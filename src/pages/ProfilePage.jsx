import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Trash2, Globe, Camera, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/index.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { logout } from '@/services/auth.js';
import { onImgError } from '@/lib/image.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Textarea } from '@/components/ui/input.jsx';
import { ConfirmDialog } from '@/components/ConfirmDialog.jsx';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export default function ProfilePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const personaDone = useAuthStore((s) => s.personaDone);
  const setPersonaDone = useAuthStore((s) => s.setPersonaDone);
  const world = useWorldStore();
  const settings = useSettingsStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [showDelete, setShowDelete] = useState(false);

  const savedCities = useMemo(
    () =>
      world.savedDestinations
        .filter((s) => s.user_id === user?.id)
        .map((s) => world.cities.find((c) => c.id === s.city_id))
        .filter(Boolean),
    [world.savedDestinations, world.cities, user],
  );

  if (!user) return null;

  const handleSave = () => {
    const updated = { ...user, name, email, avatar };
    world.upsertUser(updated);
    setUser(updated);
    toast.success('Profile updated.');
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleLang = (code) => {
    settings.setLanguage(code);
    i18n.changeLanguage(code);
    const updated = { ...user, language: code };
    world.upsertUser(updated);
    setUser(updated);
    toast.success('Language changed.');
  };

  const handleCurrency = (c) => {
    settings.setCurrency(c);
    const updated = { ...user, currency: c };
    world.upsertUser(updated);
    setUser(updated);
  };

  const handleRetakeQuiz = () => {
    const updated = { ...user, persona: null };
    world.upsertUser(updated);
    setUser(updated);
    setPersonaDone(false);
    nav('/dashboard');
    toast.info('Persona quiz reset — answer on the dashboard.');
  };

  const handleDeleteAccount = () => {
    setShowDelete(false);
    world.setTrips(world.trips.filter((t) => t.user_id !== user.id));
    world.setStops(world.stops.filter((s) => !world.trips.some((t) => t.id === s.trip_id && t.user_id === user.id)));
    world.setSaved(world.savedDestinations.filter((s) => s.user_id !== user.id));
    world.patch({ users: world.users.filter((u) => u.id !== user.id) });
    logout();
    toast.success('Account removed. Safe travels.');
    nav('/');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-aurora">{t('nav.profile')}</p>
        <h1 className="mt-1 font-display text-4xl">Your passport</h1>
      </div>

      {/* Avatar & basic info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <img
              src={avatar}
              alt=""
              onError={(e) => onImgError(e, name)}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-saffron/40"
            />
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-saffron text-ink">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <p className="text-sm text-muted">Persona: <span className="text-saffron">{user.persona || 'Unmapped'}</span></p>
          <Button size="sm" variant="outline" onClick={handleRetakeQuiz}>Retake quiz</Button>
        </div>
        <Button className="mt-4" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save changes</Button>
      </div>

      {/* Language & Currency */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl"><Globe className="mr-2 inline h-5 w-5" />Preferences</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Language</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <Button key={l.code} size="sm" variant={settings.language === l.code ? 'solid' : 'outline'} onClick={() => handleLang(l.code)}>
                  {l.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Currency</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <Button key={c} size="sm" variant={settings.currency === c ? 'solid' : 'outline'} onClick={() => handleCurrency(c)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved destinations */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl"><Heart className="mr-2 inline h-5 w-5 text-coral" />Saved destinations ({savedCities.length})</h2>
        {savedCities.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No saved cities yet. Browse the <Link to="/cities" className="text-aurora underline">City atlas</Link> and tap the heart.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {savedCities.map((c) => (
              <Link key={c.id} to="/cities" className="overflow-hidden rounded-xl glass">
                <img src={c.image} alt="" onError={(e) => onImgError(e, c.name)} className="h-24 w-full object-cover" />
                <div className="p-2">
                  <p className="font-display text-sm">{c.name}</p>
                  <p className="text-[10px] text-muted">{c.country} · cost {c.cost_index}/5</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6">
        <h2 className="font-display text-xl text-coral"><Trash2 className="mr-2 inline h-5 w-5" />Danger zone</h2>
        <p className="mt-2 text-sm text-muted">Permanently delete your account and all associated trips. This action cannot be undone.</p>
        <Button className="mt-4" variant="coral" onClick={() => setShowDelete(true)}>Delete my account</Button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete your account?"
        body="All your trips, stops, and saved destinations will be permanently erased."
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
