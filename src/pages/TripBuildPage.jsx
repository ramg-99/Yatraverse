import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { lazy, Suspense } from 'react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { addStop, addStopActivity, reorderStops } from '@/services/trips.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { pointsFor } from '@/lib/tripView.js';
import { CollabPanel } from '@/features/collab/CollabPanel.jsx';
import { TripNotes } from '@/features/notes/TripNotes.jsx';
import { PackingList } from '@/features/packing/PackingList.jsx';
import { ConstellationView } from '@/features/constellation/ConstellationView.jsx';
import { TripOptimizerModal } from '@/features/ai/TripOptimizerModal.jsx';
import { updateTrip } from '@/services/trips.js';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

function SortableStop({ stop, city, onAddAct }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="glass mb-3 rounded-2xl p-4" {...attributes}>
      <div className="flex items-center justify-between">
        <button type="button" className="cursor-grab font-mono text-xs text-muted" {...listeners}>
          ⋮⋮
        </button>
        <h3 className="font-display text-xl">{city?.name}</h3>
        <p className="font-mono text-xs">
          {stop.start_date} → {stop.end_date}
        </p>
      </div>
      <Button size="sm" className="mt-3" variant="outline" onClick={onAddAct}>
        Assign activity
      </Button>
    </div>
  );
}

export default function TripBuildPage() {
  const { id } = useParams();
  const world = useWorldStore();
  const trip = world.trips.find((t) => t.id === id);
  const stops = world.stops.filter((s) => s.trip_id === id).sort((a, b) => a.order_index - b.order_index);
  const [cityId, setCityId] = useState(world.cities[0].id);
  const [start, setStart] = useState(trip?.start_date || '');
  const [end, setEnd] = useState(trip?.end_date || '');
  const [saving, setSaving] = useState('Saved');
  const [history, setHistory] = useState([stops.map((s) => s.id)]);
  const [histIndex, setHistIndex] = useState(0);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isPublic, setIsPublic] = useState(trip?.is_public || false);

  const points = useMemo(() => pointsFor(id), [id, world.stops]);

  if (!trip) return <p>Trip missing from the atlas.</p>;

  const applyOrder = async (ids, pushHist = true) => {
    setSaving('Saving…');
    try {
      await reorderStops(id, ids);
      setSaving('Saved');
      if (pushHist) {
        const next = history.slice(0, histIndex + 1).concat([ids]);
        setHistory(next);
        setHistIndex(next.length - 1);
      }
    } catch (e) {
      toast.error(e.message);
      setSaving('Retry');
    }
  };

  const onDragEnd = (e) => {
    if (!e.over) return;
    const ids = stops.map((s) => s.id);
    const old = ids.indexOf(e.active.id);
    const neu = ids.indexOf(e.over.id);
    applyOrder(arrayMove(ids, old, neu));
  };

  const add = async () => {
    try {
      await addStop({ trip_id: id, city_id: cityId, start_date: start, end_date: end });
      toast.success('Stop locked into orbit.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const assignFirst = async (stop) => {
    const act = world.activities.find((a) => a.city_id === stop.city_id);
    if (!act) return;
    try {
      await addStopActivity({ stop_id: stop.id, activity_id: act.id, day_date: stop.start_date, start_time: '10:00' });
      toast.success('Activity pinned.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="font-mono text-xs text-aurora">{saving}</p>
        <h1 className="font-display text-4xl">{trip.name}</h1>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <div>
            <Label>City</Label>
            <select className="h-11 w-full rounded-xl border border-border bg-ink/40 px-2" value={cityId} onChange={(e) => setCityId(e.target.value)}>
              {world.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button className="self-end" onClick={add}>
            Add stop
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={histIndex <= 0} onClick={() => { const i = histIndex - 1; setHistIndex(i); applyOrder(history[i], false); }}>
            Undo
          </Button>
          <Button size="sm" variant="outline" disabled={histIndex >= history.length - 1} onClick={() => { const i = histIndex + 1; setHistIndex(i); applyOrder(history[i], false); }}>
            Redo
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowOptimizer(true)}>
            ✨ AI Optimize
          </Button>
          <Button
            size="sm"
            variant={isPublic ? 'solid' : 'ghost'}
            onClick={async () => {
              const next = !isPublic;
              setIsPublic(next);
              try {
                await updateTrip(id, { is_public: next });
                toast.success(next ? 'Trip is now public — share the link!' : 'Trip set to private.');
              } catch (e) { toast.error(e.message); }
            }}
          >
            {isPublic ? '🔓 Public' : '🔒 Private'}
          </Button>
          <Link to={`/trips/${id}`} className="text-sm text-saffron underline self-center">
            View itinerary
          </Link>
        </div>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="mt-4">
              {stops.map((s) => (
                <SortableStop key={s.id} stop={s} city={world.cities.find((c) => c.id === s.city_id)} onAddAct={() => assignFirst(s)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <ConstellationView tripId={id} />
        <TripNotes trip={trip} />
        <PackingList trip={trip} />
        <CollabPanel trip={trip} />
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
        <TripMap points={points} className="sticky top-4 h-80 w-full overflow-hidden rounded-2xl" />
      </Suspense>
    </div>
    {showOptimizer && <TripOptimizerModal trip={trip} onClose={() => setShowOptimizer(false)} />}
  </>
);
}
