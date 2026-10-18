import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import { lazy, Suspense } from 'react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { weatherFor } from '@/services/ai.js';
import { onImgError } from '@/lib/image.js';
import { money } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';
import { pointsFor } from '@/lib/tripView.js';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

export default function TripViewPage() {
  const { id } = useParams();
  const world = useWorldStore();
  const trip = world.trips.find((t) => t.id === id);
  const [mode, setMode] = useState('list');
  const stops = world.stops.filter((s) => s.trip_id === id).sort((a, b) => a.order_index - b.order_index);

  const days = useMemo(() => {
    if (!trip) return [];
    return eachDayOfInterval({ start: new Date(trip.start_date), end: new Date(trip.end_date) }).map((d) => {
      const iso = format(d, 'yyyy-MM-dd');
      const stop = stops.find((s) => iso >= s.start_date && iso < s.end_date) || stops.find((s) => iso === s.start_date);
      const city = world.cities.find((c) => c.id === stop?.city_id);
      const acts = world.stopActivities
        .filter((sa) => sa.stop_id === stop?.id && sa.day_date === iso)
        .sort((a, b) => a.order_index - b.order_index)
        .map((sa) => ({ sa, act: world.activities.find((a) => a.id === sa.activity_id) }));
      return { iso, d, stop, city, acts };
    });
  }, [trip, stops, world]);

  if (!trip) return <p>Itinerary not found.</p>;

  const exportIcs = () => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Yatraverse//EN']
      .concat(
        days.flatMap((day) =>
          day.acts.map(
            ({ act }) =>
              `BEGIN:VEVENT\nDTSTART:${day.iso.replaceAll('-', '')}\nSUMMARY:${act?.name}\nEND:VEVENT`,
          ),
        ),
      )
      .concat(['END:VCALENDAR'])
      .join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${trip.share_slug}.ics`;
    a.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${trip.share_slug}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl">{trip.name}</h1>
          <div className="flex gap-2">
            <Button size="sm" variant={mode === 'list' ? 'solid' : 'outline'} onClick={() => setMode('list')}>
              List
            </Button>
            <Button size="sm" variant={mode === 'calendar' ? 'solid' : 'outline'} onClick={() => setMode('calendar')}>
              Calendar
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={exportIcs}>
              .ics
            </Button>
            <Button size="sm" variant="ghost" onClick={copyLink}>
              Copy link
            </Button>
          </div>
        </div>
        {stops.map((s) => {
          const city = world.cities.find((c) => c.id === s.city_id);
          const wx = weatherFor(s.city_id);
          return (
            <section key={s.id} className="mt-8 overflow-hidden rounded-3xl">
              <div className="relative h-40">
                <img src={city?.image} alt="" onError={(e) => onImgError(e, city?.name)} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent p-4 flex items-end justify-between">
                  <h2 className="font-display text-3xl">{city?.name}</h2>
                  <p className="font-mono text-xs text-aurora">
                    {wx.label} · {wx.hint}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
        <div className={mode === 'calendar' ? 'mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3' : 'mt-6 space-y-3'}>
          {days.map((day) => (
            <article key={day.iso} className="glass rounded-2xl p-4">
              <p className="font-mono text-xs text-saffron">{format(day.d, 'EEE dd MMM')} · {day.city?.name || 'Transit'}</p>
              {day.acts.map(({ sa, act }) => (
                <div key={sa.id} className="mt-2 border-l-2 border-aurora pl-3 text-sm">
                  <p className="font-medium">{act?.name}</p>
                  <p className="font-mono text-xs text-muted">
                    {sa.start_time} · {money(sa.cost_override ?? act?.cost ?? 0)}
                  </p>
                </div>
              ))}
            </article>
          ))}
        </div>
        <div className="mt-6 flex gap-3 text-sm">
          <Link to={`/trips/${id}/timeline`} className="text-aurora">
            Timeline
          </Link>
          <Link to={`/trips/${id}/budget`} className="text-saffron">
            Budget
          </Link>
          <Link to={`/trips/${id}/build`} className="text-muted">
            Builder
          </Link>
        </div>
      </div>
      <Suspense fallback={null}>
        <TripMap points={pointsFor(id)} className="sticky top-4 h-80 overflow-hidden rounded-2xl" />
      </Suspense>
    </div>
  );
}
