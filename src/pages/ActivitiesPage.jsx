import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Compass, Clock, DollarSign, Star, X, Check, Eye } from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { ActivityCard } from '@/components/trip/ActivityCard.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { addStopActivity, removeStopActivity } from '@/services/trips.js';
import { ACTIVITY_TYPES } from '@/data/schema.js';
import { onImgError } from '@/lib/image.js';
import { money } from '@/lib/utils.js';

export default function ActivitiesPage() {
  const world = useWorldStore();
  const [cityId, setCityId] = useState(world.cities[0]?.id || '');
  const [type, setType] = useState('all');
  const [maxCost, setMaxCost] = useState(25000);
  const [maxDur, setMaxDur] = useState(360);
  const [quick, setQuick] = useState(null); // Quick view modal activity
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const rows = useMemo(
    () =>
      world.activities.filter(
        (a) =>
          (!cityId || a.city_id === cityId) &&
          (type === 'all' || a.type === type) &&
          a.cost <= maxCost &&
          a.duration_min <= maxDur &&
          (!debounced ||
            a.name.toLowerCase().includes(debounced.toLowerCase()) ||
            a.description?.toLowerCase().includes(debounced.toLowerCase()))
      ),
    [world.activities, cityId, type, maxCost, maxDur, debounced]
  );

  const stop = world.stops.find((s) => s.city_id === cityId);
  const addedIds = new Set(
    world.stopActivities.filter((sa) => sa.stop_id === stop?.id).map((sa) => sa.activity_id)
  );

  const toggle = async (activity) => {
    if (!stop) {
      toast.error('Add this city as a stop to your trip first in the Itinerary Builder.');
      return;
    }
    try {
      if (addedIds.has(activity.id)) {
        const sa = world.stopActivities.find((x) => x.activity_id === activity.id && x.stop_id === stop.id);
        if (sa) await removeStopActivity(sa.id);
        toast.success(`Removed "${activity.name}" from itinerary.`);
      } else {
        await addStopActivity({
          stop_id: stop.id,
          activity_id: activity.id,
          day_date: stop.start_date,
          start_time: '11:00',
        });
        toast.success(`Added "${activity.name}" to trip stop!`);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const selectedCity = world.cities.find((c) => c.id === cityId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-aurora">
          Activity Search
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
          Curated Experiences & Activities
        </h1>
        <p className="text-xs text-muted">
          Browse and select things to do in each stop, categorized by interest, budget, and duration.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass rounded-3xl p-5 border border-border/50 shadow-md space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Input */}
          <div>
            <Label htmlFor="actSearch">Search Activities</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                id="actSearch"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search food tours, museums..."
                className="pl-9"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <Label htmlFor="cityFilter">Select City Stop</Label>
            <select
              id="cityFilter"
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-ink px-3 text-sm text-parchment outline-none focus:border-saffron"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              {world.cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink text-parchment">
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs text-muted">
                <span>Max Cost:</span>
                <span className="font-mono text-saffron">{money(maxCost)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={maxCost}
                onChange={(e) => setMaxCost(Number(e.target.value))}
                className="mt-3 w-full accent-saffron"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted">
                <span>Max Duration:</span>
                <span className="font-mono text-aurora">{maxDur}m</span>
              </div>
              <input
                type="range"
                min="30"
                max="480"
                step="30"
                value={maxDur}
                onChange={(e) => setMaxDur(Number(e.target.value))}
                className="mt-3 w-full accent-aurora"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/30">
          <span className="text-xs text-muted mr-1">Category:</span>
          {['all', ...ACTIVITY_TYPES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1 text-xs capitalize transition-colors ${
                type === t
                  ? 'bg-saffron text-ink font-semibold'
                  : 'bg-white/5 text-muted hover:text-parchment'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stop Context Notice */}
      <div className="flex items-center justify-between text-xs text-muted px-1">
        <span>
          Showing activities for <strong className="text-saffron">{selectedCity?.name || 'All Cities'}</strong> ({rows.length} found)
        </span>
        {stop ? (
          <span className="text-aurora flex items-center gap-1 font-mono">
            <Check className="h-3.5 w-3.5" /> Stop is active in your current trip
          </span>
        ) : (
          <span className="text-muted">
            (Add {selectedCity?.name} to your trip in Builder to assign)
          </span>
        )}
      </div>

      {/* Activities Grid */}
      {rows.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto my-8 border border-border/40">
          <Compass className="mx-auto h-10 w-10 text-muted mb-2 opacity-60" />
          <h3 className="font-display text-lg font-bold">No activities match your filters</h3>
          <p className="mt-1 text-xs text-muted">Try increasing your cost or duration limits or switching categories.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => { setType('all'); setMaxCost(25000); setMaxDur(360); setQ(''); }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              added={addedIds.has(a.id)}
              onToggle={() => toggle(a)}
              onQuick={() => setQuick(a)}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quick && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setQuick(null)}
        >
          <div
            className="glass w-full max-w-lg rounded-3xl p-6 border border-border/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 w-full overflow-hidden rounded-2xl">
              <img
                src={quick.image}
                alt={quick.name}
                onError={(e) => onImgError(e, quick.name)}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-xs text-saffron">
                ★ {quick.rating?.toFixed(1) || '4.8'}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-saffron/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-saffron">
                  {quick.type}
                </span>
                <span className="font-mono text-base font-bold text-saffron">
                  {money(quick.cost)}
                </span>
              </div>

              <h3 className="mt-2 font-display text-2xl font-bold text-parchment">
                {quick.name}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {quick.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/30 pt-3 text-xs text-muted font-mono">
                <div>Duration: <span className="text-parchment font-medium">{quick.duration_min} mins</span></div>
                <div>Category: <span className="text-parchment font-medium capitalize">{quick.type}</span></div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                className="w-full"
                variant={addedIds.has(quick.id) ? 'coral' : 'solid'}
                onClick={() => {
                  toggle(quick);
                  setQuick(null);
                }}
              >
                {addedIds.has(quick.id) ? 'Remove from Trip Stop' : 'Add to Current Stop'}
              </Button>
              <Button variant="ghost" onClick={() => setQuick(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
