import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, MapPin, Heart, PlusCircle, Scale, Check, Calendar, ArrowRight, X, Navigation } from 'lucide-react';
import { listCities, toggleSaved } from '@/services/catalog.js';
import { addStop } from '@/services/trips.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { haversineDistance } from '@/lib/paceCalculator.js';
import { CityCard } from '@/components/trip/CityCard.jsx';
import { SkeletonPage, ErrorState } from '@/components/SkeletonBlock.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';

export default function CitiesPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [region, setRegion] = useState('All');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);
  const [pick, setPick] = useState(null); // Selected city for "Add to Trip" modal
  const [targetTripId, setTargetTripId] = useState('');
  const [stopStart, setStopStart] = useState('2027-03-01');
  const [stopEnd, setStopEnd] = useState('2027-03-05');
  const [userCoords, setUserCoords] = useState(null);

  const user = useAuthStore((s) => s.user) || { id: 'u_demo' };
  const world = useWorldStore();
  const compareIds = useSettingsStore((s) => s.compareIds);
  const toggleCompare = useSettingsStore((s) => s.toggleCompare);
  const mine = world.trips.filter((t) => t.user_id === user.id || t.collaborators?.includes(user.id));

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
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

  const handleSelectRegion = (r) => {
    setRegion(r);
    if (r === '📍 Near Me' && !userCoords) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setUserCoords({ lat: 19.076, lng: 72.877 }) // default Mumbai GPS hub
        );
      } else {
        setUserCoords({ lat: 19.076, lng: 72.877 });
      }
    }
  };

  useEffect(() => {
    if (mine.length > 0 && !targetTripId) {
      setTargetTripId(mine[0].id);
      setStopStart(mine[0].start_date);
      setStopEnd(mine[0].end_date);
    }
  }, [mine, targetTripId]);

  const filtered = useMemo(() => {
    const isNearMe = region === '📍 Near Me';
    const origin = userCoords || { lat: 19.076, lng: 72.877 };

    let list = rows
      .map((c) => {
        const distKm = Math.round(haversineDistance(origin.lat, origin.lng, c.lat, c.lng));
        return { ...c, distKm };
      })
      .filter((c) => {
        const match = `${c.name} ${c.country} ${c.region}`.toLowerCase().includes(debounced.toLowerCase());
        const reg = region === 'All' || isNearMe || c.region === region;
        return match && reg;
      });

    if (isNearMe) {
      list = [...list].sort((a, b) => a.distKm - b.distKm);
    }
    return list;
  }, [rows, debounced, region, userCoords]);

  const isSaved = (id) => world.savedDestinations.some((s) => s.user_id === user.id && s.city_id === id);
  const compared = world.cities.filter((c) => compareIds.includes(c.id));

  const handleAddStopToTrip = async () => {
    if (!pick || !targetTripId) return;
    try {
      await addStop({
        trip_id: targetTripId,
        city_id: pick.id,
        start_date: stopStart,
        end_date: stopEnd,
      });
      const chosenTrip = mine.find((t) => t.id === targetTripId);
      toast.success(`"${pick.name}" added to ${chosenTrip?.name || 'trip'}!`);
      setPick(null);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <SkeletonPage />;
  if (err) return <ErrorState message={err} onRetry={load} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-aurora">
          City Search
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
          Discover Destinations
        </h1>
        <p className="text-xs text-muted">
          Explore global cities with cost indices, seasonality, and add them directly to your itineraries.
        </p>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by city, country..."
            className="pl-9"
          />
        </div>

        {/* Region & Proximity Filters */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-border/50 bg-white/5 p-1">
          {['All', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania', '📍 Near Me'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleSelectRegion(r)}
              className={`rounded-lg px-3 py-1 text-xs transition-colors cursor-pointer ${
                region === r
                  ? 'bg-saffron text-slate-950 font-bold shadow-xs'
                  : 'text-muted hover:text-parchment'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-border/40">
          <MapPin className="mx-auto h-10 w-10 text-muted mb-2 opacity-60" />
          <h3 className="font-display text-lg font-bold">No cities match your criteria</h3>
          <p className="mt-1 text-xs text-muted">Try clearing the search query or selecting a different region.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => { setQ(''); setRegion('All'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CityCard
              key={c.id}
              city={c}
              saved={isSaved(c.id)}
              compared={compareIds.includes(c.id)}
              onSave={() =>
                toggleSaved(user.id, c.id)
                  .then(() => toast.success('Wishlist updated'))
                  .catch((e) => toast.error(e.message))
              }
              onAdd={() => setPick(c)}
              onCompare={() => toggleCompare(c.id)}
            />
          ))}
        </div>
      )}

      {/* Add to Trip Modal */}
      {pick && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPick(null)}
        >
          <div
            className="glass w-full max-w-md rounded-3xl p-6 border border-border/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-parchment">
                  Add {pick.name} to Trip
                </h3>
                <p className="text-xs text-muted">{pick.country} · Cost index: {pick.cost_index}/5</p>
              </div>
              <button
                type="button"
                onClick={() => setPick(null)}
                className="p-1 text-muted hover:text-parchment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="targetTrip">Select Trip</Label>
                {mine.length === 0 ? (
                  <p className="text-xs text-coral mt-1">
                    No trips available. Create a trip first!
                  </p>
                ) : (
                  <select
                    id="targetTrip"
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-ink px-3 text-sm text-parchment outline-none"
                    value={targetTripId}
                    onChange={(e) => {
                      setTargetTripId(e.target.value);
                      const t = mine.find((x) => x.id === e.target.value);
                      if (t) {
                        setStopStart(t.start_date);
                        setStopEnd(t.end_date);
                      }
                    }}
                  >
                    {mine.map((t) => (
                      <option key={t.id} value={t.id} className="bg-ink text-parchment">
                        {t.name} ({t.start_date} → {t.end_date})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="arrDate">Arrival Date</Label>
                  <Input
                    id="arrDate"
                    type="date"
                    className="mt-1.5"
                    value={stopStart}
                    onChange={(e) => setStopStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="depDate">Departure Date</Label>
                  <Input
                    id="depDate"
                    type="date"
                    className="mt-1.5"
                    value={stopEnd}
                    onChange={(e) => setStopEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button className="w-full" onClick={handleAddStopToTrip} disabled={mine.length === 0}>
                  <PlusCircle className="mr-1.5 h-4 w-4" /> Add Destination
                </Button>
                <Button variant="ghost" onClick={() => setPick(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Drawer */}
      {compared.length > 0 && (
        <div className="glass rounded-3xl p-5 border border-saffron/40 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h2 className="font-display text-lg font-bold text-parchment flex items-center gap-2">
              <Scale className="h-5 w-5 text-saffron" /> City Comparison ({compared.length})
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => compareIds.forEach((id) => toggleCompare(id))}
            >
              Clear Comparison
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {compared.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border/40 bg-white/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-saffron">{c.name}</h3>
                  <span className="text-xs text-muted">{c.country}</span>
                </div>
                <div className="text-xs space-y-1 text-muted">
                  <p>Cost Index: <span className="font-mono text-parchment font-semibold">{c.cost_index}/5</span></p>
                  <p>Best Season: <span className="text-aurora">{c.best_season}</span></p>
                  <p>Popularity: <span className="text-parchment">★ {c.popularity || 4.5}</span></p>
                </div>
                <p className="text-xs text-muted line-clamp-2">{c.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 text-xs"
                  onClick={() => setPick(c)}
                >
                  <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add to Trip
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
