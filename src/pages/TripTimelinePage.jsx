import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useWorldStore } from '@/store/useWorldStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

const COLORS = ['#FFB02E', '#2DD4BF', '#FF6B6B', '#a78bfa'];

export default function TripTimelinePage() {
  const { id } = useParams();
  const world = useWorldStore();
  const trip = world.trips.find((t) => t.id === id);
  const stops = world.stops.filter((s) => s.trip_id === id);
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState('timeline');

  const days = useMemo(() => {
    if (!trip) return [];
    return eachDayOfInterval({ start: new Date(trip.start_date), end: new Date(trip.end_date) });
  }, [trip]);

  if (!trip) return <p>No timeline.</p>;

  const monthDays = eachDayOfInterval({ start: startOfMonth(new Date(trip.start_date)), end: endOfMonth(new Date(trip.end_date)) });

  const onDragEnd = (e) => {
    if (!e.over) return;
    const saId = e.active.id;
    const day = e.over.id;
    const w = useWorldStore.getState();
    w.setStopActivities(w.stopActivities.map((sa) => (sa.id === saId ? { ...sa, day_date: day } : sa)));
  };

  const saveEdit = () => {
    const w = useWorldStore.getState();
    w.setStopActivities(w.stopActivities.map((sa) => (sa.id === edit.id ? { ...sa, ...edit } : sa)));
    setEdit(null);
  };

  return (
    <div>
      <div className="flex gap-2">
        <h1 className="mr-auto font-display text-4xl">Calendar</h1>
        <Button size="sm" variant={view === 'month' ? 'solid' : 'outline'} onClick={() => setView('month')}>
          Month
        </Button>
        <Button size="sm" variant={view === 'timeline' ? 'solid' : 'outline'} onClick={() => setView('timeline')}>
          Timeline
        </Button>
      </div>
      {view === 'month' ? (
        <div className="mt-6 grid grid-cols-7 gap-2">
          {monthDays.map((d) => {
            const iso = format(d, 'yyyy-MM-dd');
            const stop = stops.find((s) => iso >= s.start_date && iso < s.end_date);
            const color = COLORS[stops.indexOf(stop) % COLORS.length];
            return (
              <div key={iso} className="min-h-20 rounded-xl border border-border p-2 text-xs" style={{ borderColor: stop ? color : undefined }}>
                {format(d, 'd')}
              </div>
            );
          })}
        </div>
      ) : (
        <DndContext onDragEnd={onDragEnd}>
          <div className="mt-6 space-y-4">
            {days.map((d) => {
              const iso = format(d, 'yyyy-MM-dd');
              const stop = stops.find((s) => iso >= s.start_date && iso < s.end_date);
              const city = world.cities.find((c) => c.id === stop?.city_id);
              const acts = world.stopActivities.filter((sa) => sa.day_date === iso);
              return (
                <div key={iso} id={iso} className="glass rounded-2xl p-4">
                  <p className="font-mono text-xs text-aurora">
                    {iso} · {city?.name || 'Open day'}
                  </p>
                  {acts.map((sa) => {
                    const act = world.activities.find((a) => a.id === sa.activity_id);
                    return (
                      <button
                        key={sa.id}
                        type="button"
                        draggable
                        onDragStart={(ev) => ev.dataTransfer.setData('text', sa.id)}
                        onClick={() => setEdit({ ...sa })}
                        className="mt-2 block w-full rounded-xl bg-white/5 p-2 text-left text-sm"
                      >
                        {sa.start_time} · {act?.name}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DndContext>
      )}
      {edit ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-5">
            <p className="font-display text-xl">Quick edit</p>
            <Input className="mt-3" value={edit.start_time} onChange={(e) => setEdit({ ...edit, start_time: e.target.value })} />
            <Input className="mt-2" value={edit.notes || ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} placeholder="Notes" />
            <Input className="mt-2" type="number" value={edit.cost_override || ''} onChange={(e) => setEdit({ ...edit, cost_override: Number(e.target.value) })} placeholder="Cost override" />
            <div className="mt-4 flex gap-2">
              <Button onClick={saveEdit}>Save</Button>
              <Button variant="ghost" onClick={() => setEdit(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
