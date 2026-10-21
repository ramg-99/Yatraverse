import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Save,
  Trash2,
  Globe,
  Camera,
  Heart,
  DollarSign,
  User as UserIcon,
  PlusCircle,
  LogOut,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/index.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { logout } from '@/services/auth.js';
import { onImgError } from '@/lib/image.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConfirmDialog } from '@/components/ConfirmDialog.jsx';
import { toggleSaved } from '@/services/catalog.js';

const LANGUAGES = [
  { code: 'en', label: 'English (US)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&h=256&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop',
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const world = useWorldStore();
  const settings = useSettingsStore();

  const [name, setName] = useState(user?.name || 'Aarav Mehta');
  const [email, setEmail] = useState(user?.email || 'demo@yatraverse.app');
  const [avatar, setAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256'
  );
  const [showDelete, setShowDelete] = useState(false);

  const savedCities = useMemo(
    () =>
      world.savedDestinations
        .filter((s) => s.user_id === user?.id)
        .map((s) => world.cities.find((c) => c.id === s.city_id))
        .filter(Boolean),
    [world.savedDestinations, world.cities, user]
  );

  const handleSave = () => {
    const updated = { ...user, name, email, avatar };
    world.upsertUser(updated);
    setUser(updated);
    toast.success('Profile information updated successfully.');
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleLang = (code) => {
    settings.setLanguage(code);
    i18n.changeLanguage(code);
    if (user) {
      const updated = { ...user, language: code };
      world.upsertUser(updated);
      setUser(updated);
    }
    toast.success('Language preference updated.');
  };

  const handleCurrency = (c) => {
    settings.setCurrency(c);
    if (user) {
      const updated = { ...user, currency: c };
      world.upsertUser(updated);
      setUser(updated);
    }
    toast.success(`Currency set to ${c}.`);
  };

  const handleRemoveSaved = async (cityId) => {
    try {
      await toggleSaved(user.id, cityId);
      toast.success('Destination removed from wishlist.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteAccount = () => {
    setShowDelete(false);
    if (user) {
      world.setTrips(world.trips.filter((t) => t.user_id !== user.id));
      world.setSaved(world.savedDestinations.filter((s) => s.user_id !== user.id));
      world.patch({ users: world.users.filter((u) => u.id !== user.id) });
    }
    logout();
    toast.success('Account permanently deleted.');
    nav('/login');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-aurora">
          User Profile & Settings
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
          User Profile & Settings
        </h1>
        <p className="text-xs text-muted">
          Manage your personal information, update language & currency preferences, and review saved destinations.
        </p>
      </div>

      {/* Editable Fields: Name, Photo, Email */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-md space-y-6">
        <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-saffron" /> Personal Information
        </h2>

        <div className="flex flex-wrap items-center gap-6">
          {/* Avatar with Upload */}
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              onError={(e) => onImgError(e, name)}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-saffron/30 shadow-lg"
            />
            <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-saffron text-ink shadow-md hover:scale-105 transition-transform">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </label>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4 min-w-[260px]">
            <div>
              <Label htmlFor="userName">Full Name *</Label>
              <Input
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email Address *</Label>
              <Input
                id="userEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Preset Avatars */}
        <div>
          <p className="text-xs text-muted mb-2">Or select from avatar presets:</p>
          <div className="flex gap-2">
            {AVATAR_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(p)}
                className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                  avatar === p ? 'border-saffron scale-110 ring-2 ring-saffron/40' : 'border-border/40 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Profile Changes
          </Button>
        </div>
      </div>

      {/* Language & Currency Preferences */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-md space-y-6">
        <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
          <Globe className="h-5 w-5 text-aurora" /> App Preferences
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Language Preference */}
          <div>
            <Label>Language Preference</Label>
            <div className="mt-2 space-y-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLang(l.code)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                    settings.language === l.code
                      ? 'border-saffron bg-saffron/15 text-saffron font-semibold'
                      : 'border-border/40 bg-white/5 text-muted hover:text-parchment'
                  }`}
                >
                  <span>{l.label}</span>
                  {settings.language === l.code && <Check className="h-4 w-4 text-saffron" />}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Preference */}
          <div>
            <Label>Display Currency</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCurrency(c)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                    settings.currency === c
                      ? 'border-saffron bg-saffron/15 text-saffron font-semibold'
                      : 'border-border/40 bg-white/5 text-muted hover:text-parchment'
                  }`}
                >
                  <span className="font-mono">{c}</span>
                  {settings.currency === c && <Check className="h-4 w-4 text-saffron" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Destinations List */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-border/50 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
              <Heart className="h-5 w-5 text-coral" /> Saved Destinations List ({savedCities.length})
            </h2>
            <p className="text-xs text-muted">Destinations you bookmarked from the City Search</p>
          </div>
          <Link to="/cities">
            <Button size="sm" variant="outline">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Explore Cities
            </Button>
          </Link>
        </div>

        {savedCities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center text-xs text-muted">
            You haven't saved any destinations yet. Browse the{' '}
            <Link to="/cities" className="text-saffron underline">
              City Search
            </Link>{' '}
            and click the heart icon on any city to bookmark it here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedCities.map((c) => (
              <div
                key={c.id}
                className="glass overflow-hidden rounded-2xl border border-border/40 shadow-sm flex flex-col justify-between"
              >
                <div className="relative h-28 w-full">
                  <img
                    src={c.image}
                    alt={c.name}
                    onError={(e) => onImgError(e, c.name)}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-saffron">
                    Cost {c.cost_index}/5
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-parchment">{c.name}</h3>
                    <span className="text-[11px] text-muted">{c.country}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted line-clamp-2">{c.description}</p>

                  <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between text-xs">
                    <Link to="/cities" className="text-saffron hover:underline">
                      Add to Trip →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveSaved(c.id)}
                      className="text-coral/80 hover:text-coral text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Deletion & Danger Zone */}
      <div className="rounded-3xl border border-coral/30 bg-coral/5 p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-coral flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone: Delete Account
          </h2>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Permanently delete your account and all associated itineraries, custom stops, and saved destinations.
            This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="coral" onClick={() => setShowDelete(true)}>
            Delete My Account
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDelete}
        title="Permanently Delete Account?"
        body="All your personal travel data, trips, custom stops, and saved bookmarks will be deleted. Are you sure you want to proceed?"
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
