import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useWorldStore } from '@/store/useWorldStore.js';
import { ActivityCard } from '@/components/trip/ActivityCard.jsx';
import { Button } from '@/components/ui/button.jsx';
import { addStopActivity, removeStopActivity } from '@/services/trips.js';
import { ACTIVITY_TYPES } from '@/data/schema.js';
import { onImgError } from '@/lib/image.js';

export default function ActivitiesPage() {
  const world = useWorldStore();
  const [cityId, setCityId] = useState(world.cities[0].id);
  const [type, setType] = useState('all');
  const [maxCost, setMaxCost] = useState(20000);
  const [maxDur, setMaxDur] = useState(300);
  const [quick, setQuick] = useState(null);

  const rows = useMemo(
    () =>
      world.activities.filter(
        (a) => a.city_id === cityId && (type === 'all' || a.type === type) && a.cost <= maxCost && a.duration_min <= maxDur,
      ),
    [world.activities, cityId, type, maxCost, maxDur],
  );

  const stop = world.stops.find((s) => s.city_id === cityId);
  const addedIds = new Set(world.stopActivities.filter((sa) => sa.stop_id === stop?.id).map((sa) => sa.activity_id));

  const toggle = async (activity) => {
    if (!stop) {
      toast.error('Add this city to a trip first.');
      return;
    }
    try {
      if (addedIds.has(activity.id)) {
        const sa = world.stopActivities.find((x) => x.activity_id === activity.id && x.stop_id === stop.id);
        await removeStopActivity(sa.id);
        toast.success('Removed from day.');
      } else {
        await addStopActivity({ stop_id: stop.id, activity_id: activity.id, day_date: stop.start_date, start_time: '11:00' });
        toast.success('Pinned to the stop.');
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Activity hangar</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <select className="h-10 rounded-xl border border-border bg-ink/40 px-2" value={cityId} onChange={(e) => setCityId(e.target.value)}>
          {world.cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {['all', ...ACTIVITY_TYPES].map((t) => (
          <Button key={t} size="sm" variant={type === t ? 'solid' : 'outline'} onClick={() => setType(t)}>
            {t}
          </Button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <label>
          Cost ≤ {maxCost}
          <input type="range" min="500" max="20000" value={maxCost} onChange={(e) => setMaxCost(Number(e.target.value))} className="ml-2" />
        </label>
        <label>
          Duration ≤ {maxDur}m
          <input type="range" min="30" max="400" value={maxDur} onChange={(e) => setMaxDur(Number(e.target.value))} className="ml-2" />
        </label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {rows.map((a) => (
          <ActivityCard key={a.id} activity={a} added={addedIds.has(a.id)} onToggle={() => toggle(a)} onQuick={() => setQuick(a)} />
        ))}
      </div>
      {quick ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={() => setQuick(null)}>
          <div className="glass max-w-lg rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <img src={quick.image} alt="" onError={(e) => onImgError(e, quick.name)} className="h-48 w-full rounded-xl object-cover" />
            <h3 className="mt-3 font-display text-2xl">{quick.name}</h3>
            <p className="text-sm text-muted">{quick.description}</p>
            <p className="mt-2 font-mono text-xs">★ {quick.rating.toFixed(1)} · {quick.duration_min}m</p>
            <Button className="mt-4" onClick={() => setQuick(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
