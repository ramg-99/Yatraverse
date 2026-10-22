import { useMemo, useState, lazy, Suspense } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import {
  Calendar,
  List as ListIcon,
  SlidersHorizontal,
  PieChart,
  Share2,
  Printer,
  Download,
  MapPin,
  Clock,
  DollarSign,
  CloudSun,
  ChevronDown,
} from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { weatherFor } from '@/services/ai.js';
import { onImgError } from '@/lib/image.js';
import { money } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';
import { pointsFor, spendFor } from '@/lib/tripView.js';
import { TripPaceOverview } from '@/components/timeline/TripPaceOverview.jsx';
import { PaceRebalanceModal } from '@/components/timeline/PaceRebalanceModal.jsx';
import { calculateTripPaceOverview } from '@/lib/paceCalculator.js';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

export default function TripViewPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const world = useWorldStore();
  const user = useAuthStore((s) => s.user) || { id: 'u_demo', currency: 'INR' };
  const trips = world.trips;
  const trip = trips.find((t) => t.id === id) || trips[0];

  const [mode, setMode] = useState('list');
  const [isPaceModalOpen, setIsPaceModalOpen] = useState(false);
  const stops = useMemo(
    () => (trip ? world.stops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.order_index - b.order_index) : []),
    [trip, world.stops]
  );

  const COLORS = ['#FFB02E', '#2DD4BF', '#FF6B6B', '#a78bfa', '#38bdf8'];

  const days = useMemo(() => {
    if (!trip) return [];
    try {
      const dates = [];
      if (trip.start_date) dates.push(new Date(trip.start_date));
      if (trip.end_date) dates.push(new Date(trip.end_date));
      stops.forEach((s) => {
        const sStart = s.start_date || s.startDate;
        const sEnd = s.end_date || s.endDate;
        if (sStart) dates.push(new Date(sStart));
        if (sEnd) dates.push(new Date(sEnd));
      });
      if (dates.length === 0) return [];
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())));

      return eachDayOfInterval({ start: min, end: max }).map((d, index) => {
        const iso = format(d, 'yyyy-MM-dd');
        const stop = stops.find((s) => {
          const sStart = s.start_date || s.startDate;
          const sEnd = s.end_date || s.endDate;
          return iso >= sStart && iso <= sEnd;
        }) || stops[0];
        const stopIndex = stop ? stops.indexOf(stop) : 0;
        const color = COLORS[stopIndex % COLORS.length] || '#FFB02E';
        const city = world.cities.find((c) => c.id === (stop?.city_id || stop?.cityId)) || stop?.city;
        const acts = world.stopActivities
          .filter((sa) => sa.day_date === iso)
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((sa) => ({ sa, act: world.activities.find((a) => a.id === sa.activity_id) }));
        return { iso, d, dayNum: index + 1, stop, city, color, acts };
      });
    } catch {
      return [];
    }
  }, [trip, stops, world]);

  const spend = useMemo(
    () => (trip ? spendFor(trip.id) : { total: 0, byCat: {} }),
    [trip, stops, world.stopActivities, world.expenses]
  );

  const paceOverview = useMemo(() => {
    const rawDays = days.map((d) => d.iso);
    return calculateTripPaceOverview(rawDays, stops, world.stopActivities, world.activities, world.cities);
  }, [days, stops, world.stopActivities, world.activities, world.cities]);

  if (!trip) {
    return (
      <div className="glass rounded-3xl p-8 text-center max-w-md mx-auto my-12">
        <h2 className="font-display text-2xl font-bold">Trip Not Found</h2>
        <p className="mt-2 text-xs text-muted">Please select a valid trip to view its itinerary.</p>
        <Link to="/trips" className="mt-4 inline-block">
          <Button size="sm">Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  const exportIcs = () => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Yatraverse//Yatraverse//EN']
      .concat(
        days.flatMap((day) =>
          day.acts.map(
            ({ act }) =>
              `BEGIN:VEVENT\nDTSTART:${day.iso.replaceAll('-', '')}\nSUMMARY:${act?.name || 'Activity'}\nEND:VEVENT`
          )
        )
      )
      .concat(['END:VCALENDAR'])
      .join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${trip.share_slug || 'itinerary'}.ics`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Itinerary View
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-parchment">
              {trip.name}
            </h1>
            {/* Trip switcher */}
            <select
              aria-label="Switch Trip"
              className="rounded-xl border border-border/50 bg-ink px-2.5 py-1 text-xs text-saffron outline-none cursor-pointer"
              value={trip.id}
              onChange={(e) => nav(`/trips/${e.target.value}`)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-ink text-parchment">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted mt-1">
            {format(new Date(trip.start_date), 'dd MMM yyyy')} → {format(new Date(trip.end_date), 'dd MMM yyyy')} · {stops.length} Destinations · Total est. {money(spend.total, user.currency)}
          </p>
        </div>

        {/* View mode toggle & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border/50 bg-white/5 p-1 mr-2">
            <button
              type="button"
              onClick={() => setMode('list')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                mode === 'list' ? 'bg-saffron text-ink font-semibold' : 'text-muted hover:text-parchment'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" /> List
            </button>
            <button
              type="button"
              onClick={() => setMode('calendar')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                mode === 'calendar' ? 'bg-saffron text-ink font-semibold' : 'text-muted hover:text-parchment'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" /> Calendar
            </button>
          </div>

          <Link to={`/trips/${trip.id}/build`}>
            <Button size="sm" variant="outline">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Builder
            </Button>
          </Link>
          <Link to={`/trips/${trip.id}/budget`}>
            <Button size="sm" variant="outline">
              <PieChart className="mr-1.5 h-3.5 w-3.5" /> Budget
            </Button>
          </Link>
          <Link to={`/s/${trip.share_slug || 'spice-route-homecoming'}`}>
            <Button size="sm" variant="outline">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Link
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => window.print()} title="Print itinerary">
            <Printer className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={exportIcs} title="Export iCal (.ics)">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trip Pace Meter & Burnout Guard */}
      <TripPaceOverview
        overview={paceOverview}
        onAutoRebalance={() => setIsPaceModalOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content: Day-wise Layout */}
        <div className="space-y-8">
          {/* City Headers */}
          <div>
            <h2 className="font-display text-lg font-bold text-parchment mb-3">Destination Stops</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {stops.map((s) => {
                const city = world.cities.find((c) => c.id === s.city_id);
                const wx = weatherFor(s.city_id);
                return (
                  <div key={s.id} className="glass overflow-hidden rounded-2xl border border-border/40 shadow-sm">
                    <div className="relative h-28 w-full">
                      <img
                        src={city?.image}
                        alt={city?.name}
                        onError={(e) => onImgError(e, city?.name)}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="font-display text-base font-bold text-parchment">{city?.name}</p>
                        <p className="text-[10px] text-parchment/80">{city?.country}</p>
                      </div>
                    </div>
                    <div className="p-3 text-[11px] text-muted space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{s.start_date} → {s.end_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-aurora pt-1 border-t border-border/20">
                        <CloudSun className="h-3 w-3 shrink-0" />
                        <span>{wx.label} ({wx.hint})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List or Calendar View Mode */}
          {mode === 'list' ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-parchment">Day-by-Day Schedule</h2>
              {days.map((day) => (
                <article
                  key={day.iso}
                  className="glass rounded-3xl border border-border/50 p-5 shadow-sm transition-all hover:border-saffron/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/20 font-mono text-xs font-bold text-saffron">
                        {day.dayNum}
                      </span>
                      <h3 className="font-display text-base font-bold text-parchment">
                        Day {day.dayNum}: {format(day.d, 'EEEE, dd MMMM yyyy')}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-aurora flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {day.city?.name || 'In Transit'}
                    </span>
                  </div>

                  {/* Activity Blocks */}
                  <div className="mt-4 space-y-2.5">
                    {day.acts.length === 0 ? (
                      <p className="text-xs text-muted italic p-2">
                        No scheduled activities for this day. Free exploration or transit.
                      </p>
                    ) : (
                      day.acts.map(({ sa, act }) => (
                        <div
                          key={sa.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/30 bg-white/5 p-3.5 text-xs hover:bg-white/[0.08] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-saffron/15 px-2 py-1 font-mono text-[11px] font-semibold text-saffron shrink-0">
                              {sa.start_time || '10:00'}
                            </span>
                            <div>
                              <p className="font-semibold text-parchment text-sm">{act?.name}</p>
                              <p className="text-muted text-[11px] mt-0.5 line-clamp-1">{act?.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-muted">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted" />
                              <span>{act?.duration_min}m</span>
                            </div>
                            <div className="font-mono text-saffron font-medium">
                              {money(sa.cost_override ?? act?.cost ?? 0, user.currency)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Calendar Mode */
            <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-saffron" /> Day-by-Day Calendar of Input Cities
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Daily schedule of all destinations and planned experiences.
                  </p>
                </div>
                <Link to={`/trips/${trip.id}/timeline?view=calendar`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    Full Interactive Timeline ↗
                  </Button>
                </Link>
              </div>

              {/* Input Cities Legend */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
                <span className="font-mono text-[11px] text-muted uppercase tracking-wider mr-1">Cities:</span>
                {stops.map((stop, sIdx) => {
                  const city = world.cities.find((c) => c.id === (stop.city_id || stop.cityId)) || stop.city;
                  const color = COLORS[sIdx % COLORS.length];
                  return (
                    <span
                      key={stop.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      {city?.name || 'Input City'} ({stop.start_date || stop.startDate} → {stop.end_date || stop.endDate})
                    </span>
                  );
                })}
              </div>

              <div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <p key={d} className="text-center font-mono text-xs font-semibold text-muted py-1">
                      {d}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: days[0]?.d.getDay() || 0 }).map((_, i) => (
                    <div key={`blank-${i}`} className="min-h-28 rounded-2xl border border-dashed border-border/20 p-2 opacity-30 bg-black/10" />
                  ))}
                  {days.map((day) => (
                    <div
                      key={day.iso}
                      className="min-h-28 rounded-2xl border p-2 flex flex-col justify-between bg-white/5 hover:bg-white/10 transition-all shadow-sm"
                      style={{
                        borderColor: `${day.color}70`,
                        borderTop: `3px solid ${day.color}`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold" style={{ color: day.color }}>
                            {format(day.d, 'dd')}
                          </span>
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-full bg-saffron/20 text-saffron font-bold">
                            D{day.dayNum}
                          </span>
                        </div>

                        {day.city && (
                          <div
                            className="mt-1 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold truncate"
                            style={{
                              backgroundColor: `${day.color}25`,
                              color: day.color,
                            }}
                            title={`${day.city.name} (${day.city.country || ''})`}
                          >
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{day.city.name}</span>
                          </div>
                        )}

                        <div className="mt-1.5 space-y-1">
                          {day.acts.slice(0, 2).map(({ sa, act }) => (
                            <div key={sa.id} className="rounded bg-white/10 p-1 text-[9px] leading-tight">
                              <p className="font-medium text-parchment truncate">{act?.name}</p>
                              <p className="text-muted">{sa.start_time} · {money(sa.cost_override ?? act?.cost ?? 0)}</p>
                            </div>
                          ))}
                          {day.acts.length > 2 && (
                            <p className="text-[9px] text-aurora font-mono">+{day.acts.length - 2} more</p>
                          )}
                        </div>
                      </div>

                      {day.acts.length === 0 && (
                        <p className="text-[9px] text-muted italic">Explore {day.city?.name || 'city'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Route Map & Highlights */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-4 border border-border/40 sticky top-20 shadow-md">
            <h3 className="font-display text-base font-bold text-parchment mb-2">Route Map</h3>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
              <TripMap points={pointsFor(trip.id)} className="h-64 w-full overflow-hidden rounded-2xl" />
            </Suspense>

            <div className="mt-4 space-y-2 text-xs border-t border-border/30 pt-3">
              <div className="flex justify-between text-muted">
                <span>Duration:</span>
                <span className="font-mono text-parchment">{days.length} Days</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Cities:</span>
                <span className="font-mono text-parchment">{stops.length} Stops</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Estimated Cost:</span>
                <span className="font-mono text-saffron font-medium">{money(spend.total, user.currency)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
              <Link to={`/trips/${trip.id}/build`} className="block w-full">
                <Button size="sm" className="w-full">
                  Edit in Builder →
                </Button>
              </Link>
              <Link to={`/trips/${trip.id}/budget`} className="block w-full">
                <Button size="sm" variant="outline" className="w-full">
                  Financial Breakdown
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Pace & Burnout Rebalancer Modal */}
      <PaceRebalanceModal
        isOpen={isPaceModalOpen}
        onClose={() => setIsPaceModalOpen(false)}
        overview={paceOverview}
        trip={trip}
      />
    </div>
  );
}
