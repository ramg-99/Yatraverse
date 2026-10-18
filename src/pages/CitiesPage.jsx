import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { listCities, toggleSaved } from '@/services/catalog.js';
import { addStop } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { CityCard } from '@/components/trip/CityCard.jsx';
import { SkeletonPage, ErrorState } from '@/components/SkeletonBlock.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';

export default function CitiesPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [region, setRegion] = useState('All');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);
  const [pick, setPick] = useState(null);
  const user = useAuthStore((s) => s.user);
  const world = useWorldStore();
  const compareIds = useSettingsStore((s) => s.compareIds);
  const toggleCompare = useSettingsStore((s) => s.toggleCompare);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 280);
    return () => clearTimeout(t);
  }, [q]);

  const load = () => {
    setLoading(true);
    listCities()
      .then((c) => {
        setRows(c);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    return rows.filter((c) => {
      const hit = `${c.name} ${c.country}`.toLowerCase().includes(debounced.toLowerCase());
      const reg = region === 'All' || c.region === region;
      return hit && reg;
    });
  }, [rows, debounced, region]);

  const saved = (id) => world.savedDestinations.some((s) => s.user_id === user.id && s.city_id === id);
  const mine = world.trips.filter((t) => t.user_id === user.id);
  const compared = world.cities.filter((c) => compareIds.includes(c.id));

  if (loading) return <SkeletonPage />;
  if (err) return <ErrorState message={err} onRetry={load} />;

  return (
    <div>
      <h1 className="font-display text-4xl">City atlas</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cities" className="max-w-xs" />
        {['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'].map((r) => (
          <Button key={r} size="sm" variant={region === r ? 'solid' : 'outline'} onClick={() => setRegion(r)}>
            {r}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No stars in this sector" hint="Widen the region or clear search." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CityCard
              key={c.id}
              city={c}
              saved={saved(c.id)}
              compared={compareIds.includes(c.id)}
              onSave={() => toggleSaved(user.id, c.id).then(() => toast.success('Wishlist updated')).catch((e) => toast.error(e.message))}
              onAdd={() => setPick(c)}
              onCompare={() => toggleCompare(c.id)}
            />
          ))}
        </div>
      )}
      {pick ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="glass max-w-sm rounded-2xl p-5">
            <p className="font-display text-xl">Add {pick.name} to</p>
            {mine.map((t) => (
              <Button
                key={t.id}
                className="mt-2 w-full"
                variant="outline"
                onClick={async () => {
                  try {
                    await addStop({ trip_id: t.id, city_id: pick.id, start_date: t.start_date, end_date: t.start_date });
                    toast.success('City locked. Adjust dates in the builder.');
                    setPick(null);
                  } catch (e) {
                    toast.error(e.message);
                  }
                }}
              >
                {t.name}
              </Button>
            ))}
            <Button className="mt-3 w-full" variant="ghost" onClick={() => setPick(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
      {compared.length > 0 ? (
        <div className="glass mt-8 rounded-2xl p-4">
          <h2 className="font-display text-2xl">Compare drawer</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {compared.map((c) => (
              <div key={c.id}>
                <p className="font-display">{c.name}</p>
                <p className="text-xs text-muted">{c.country} · cost {c.cost_index}/5 · {c.best_season}</p>
                <p className="text-sm">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
