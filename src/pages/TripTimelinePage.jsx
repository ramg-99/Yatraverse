import { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit2,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { updateStopActivity } from '@/services/trips.js';
import { WeatherBadge } from '@/components/timeline/WeatherBadge.jsx';
import { PaceMeterBadge } from '@/components/timeline/PaceMeterBadge.jsx';
import { TripPaceOverview } from '@/components/timeline/TripPaceOverview.jsx';
import { WeatherRescheduleModal } from '@/components/timeline/WeatherRescheduleModal.jsx';
import { PaceRebalanceModal } from '@/components/timeline/PaceRebalanceModal.jsx';
import { calculateDayPace, calculateTripPaceOverview } from '@/lib/paceCalculator.js';

const COLORS = ['#FFB02E', '#2DD4BF', '#FF6B6B', '#a78bfa', '#38bdf8'];

export default function TripTimelinePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const world = useWorldStore();
  const trips = world.trips;
  const trip = trips.find((t) => t.id === id) || trips[0];
  const stops = useMemo(
    () => (trip ? world.stops.filter((s) => s.trip_id === trip.id) : []),
    [trip, world.stops]
  );

  const initialView = searchParams.get('view') === 'calendar' ? 'calendar' : 'timeline';
  const [view, setView] = useState(initialView);
  const [editItem, setEditItem] = useState(null); // Activity being quick-edited
  const [expandedDays, setExpandedDays] = useState({});
  const [weatherModalData, setWeatherModalData] = useState(null);
  const [isPaceModalOpen, setIsPaceModalOpen] = useState(false);

  const handleSetView = (v) => {
    setView(v);
    setSearchParams({ view: v }, { replace: true });
  };

  // Determine complete date span covering trip dates and all input city stops
  const { startDate, endDate } = useMemo(() => {
    const dates = [];
    if (trip?.start_date) dates.push(new Date(trip.start_date));
    if (trip?.end_date) dates.push(new Date(trip.end_date));
    stops.forEach((s) => {
      const sStart = s.start_date || s.startDate;
      const sEnd = s.end_date || s.endDate;
      if (sStart) dates.push(new Date(sStart));
      if (sEnd) dates.push(new Date(sEnd));
    });
    if (dates.length === 0) return { startDate: new Date(), endDate: new Date() };
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return { startDate: min, endDate: max };
  }, [trip, stops]);

  const days = useMemo(() => {
    if (!trip) return [];
    try {
      return eachDayOfInterval({ start: startDate, end: endDate });
    } catch {
      return [];
    }
  }, [trip, startDate, endDate]);

  const monthDays = useMemo(() => {
    try {
      return eachDayOfInterval({
        start: startOfMonth(startDate),
        end: endOfMonth(endDate),
      });
    } catch {
      return [];
    }
  }, [startDate, endDate]);

  const paceOverview = useMemo(() => {
    return calculateTripPaceOverview(days, stops, world.stopActivities, world.activities, world.cities);
  }, [days, stops, world.stopActivities, world.activities, world.cities]);

  const toggleDay = (iso) => {
    setExpandedDays((prev) => ({ ...prev, [iso]: !prev[iso] }));
  };

  const onDragEnd = (e) => {
    if (!e.over) return;
    const saId = e.active.id;
    const newDay = e.over.id;
    const w = useWorldStore.getState();
    w.setStopActivities(
      w.stopActivities.map((sa) => (sa.id === saId ? { ...sa, day_date: newDay } : sa))
    );
    updateStopActivity(saId, { day_date: newDay }).catch(() => {});
  };

  const saveEdit = () => {
    if (!editItem) return;
    const w = useWorldStore.getState();
    w.setStopActivities(
      w.stopActivities.map((sa) => (sa.id === editItem.id ? { ...sa, ...editItem } : sa))
    );
    updateStopActivity(editItem.id, editItem).catch(() => {});
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Calendar & Timeline
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-parchment">
              Schedule & Timeline: {trip.name}
            </h1>
            {/* Trip switcher */}
            <select
              aria-label="Switch Trip"
              className="rounded-xl border border-border/50 bg-ink px-2.5 py-1 text-xs text-saffron outline-none cursor-pointer"
              value={trip.id}
              onChange={(e) => nav(`/trips/${e.target.value}/timeline`)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-ink text-parchment">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted mt-1">
            Visualize the full journey flow, inspect daily time slots, and quick-edit activity details.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border/50 bg-white/5 p-1 gap-1">
            <button
              type="button"
              onClick={() => handleSetView('timeline')}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                view === 'timeline'
                  ? 'bg-saffron text-ink font-semibold'
                  : 'text-muted hover:text-parchment'
              }`}
            >
              Vertical Timeline
            </button>
            <button
              type="button"
              onClick={() => handleSetView('calendar')}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                view === 'calendar'
                  ? 'bg-saffron text-ink font-semibold'
                  : 'text-muted hover:text-parchment'
              }`}
            >
              Calendar View
            </button>
          </div>

          <Link to={`/trips/${trip.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="mr-1 h-3.5 w-3.5" /> View
            </Button>
          </Link>
          <Link to={`/trips/${trip.id}/build`}>
            <Button size="sm" variant="outline">
              <SlidersHorizontal className="mr-1 h-3.5 w-3.5" /> Builder
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature 2: Trip Pace Meter & Burnout Guard */}
      <TripPaceOverview
        overview={paceOverview}
        onAutoRebalance={() => setIsPaceModalOpen(true)}
      />

      {/* Main View: Vertical Timeline vs Monthly Calendar */}
      {view === 'timeline' ? (
        <DndContext onDragEnd={onDragEnd}>
          <div className="space-y-4">
            {days.map((d, index) => {
              const iso = format(d, 'yyyy-MM-dd');
              const stop = stops.find((s) => {
                const sStart = s.start_date || s.startDate;
                const sEnd = s.end_date || s.endDate;
                return iso >= sStart && iso <= sEnd;
              }) || stops[0];
              const city = world.cities.find((c) => c.id === (stop?.city_id || stop?.cityId)) || stop?.city;
              const acts = world.stopActivities.filter((sa) => sa.day_date === iso);
              const dayPace = calculateDayPace(acts, world.activities, city);
              const outdoorActs = acts.filter((sa) => {
                const a = world.activities.find((x) => x.id === sa.activity_id);
                return a?.is_outdoor !== false;
              });
              const sunnyDays = days
                .map((dItem, dIdx) => ({ iso: format(dItem, 'yyyy-MM-dd'), dayIndex: dIdx }))
                .filter((dItem) => dItem.iso !== iso);

              const stopIndex = stop ? stops.indexOf(stop) : 0;
              const accentColor = COLORS[stopIndex % COLORS.length] || '#FFB02E';
              const isExpanded = expandedDays[iso] !== false; // Default expanded

              return (
                <div
                  key={iso}
                  id={iso}
                  className="glass relative rounded-3xl border border-border/50 p-5 shadow-sm transition-all hover:border-saffron/40"
                  style={{ borderLeft: `4px solid ${accentColor}` }}
                >
                  {/* Day Header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => toggleDay(iso)}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold text-parchment">
                          Day {index + 1}: {format(d, 'EEEE, dd MMM yyyy')}
                        </h3>
                        <p className="font-mono text-xs text-muted flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" style={{ color: accentColor }} />
                          <span>{city?.name || 'In Transit'}</span>
                          <span>·</span>
                          <span>{acts.length} {acts.length === 1 ? 'activity' : 'activities'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Weather Badge & Trip Pace Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <WeatherBadge
                        city={city}
                        dateIso={iso}
                        dayIndex={index}
                        outdoorCount={outdoorActs.length}
                        onFixDay={(weather) =>
                          setWeatherModalData({
                            dateIso: iso,
                            dayIndex: index,
                            weather,
                            city,
                            outdoorActs,
                            sunnyDays,
                          })
                        }
                      />
                      <PaceMeterBadge
                        pace={dayPace}
                        onRebalance={() => setIsPaceModalOpen(true)}
                      />
                      <div className="flex items-center gap-1 text-muted text-xs pl-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Activity List */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-border/30 space-y-2.5">
                      {acts.length === 0 ? (
                        <p className="text-xs text-muted italic p-2 rounded-xl bg-white/[0.02]">
                          No activities scheduled for this day. Free exploration day.
                        </p>
                      ) : (
                        acts.map((sa) => {
                          const act = world.activities.find((a) => a.id === sa.activity_id);
                          const isOutdoor = act?.is_outdoor !== false;
                          return (
                            <div
                              key={sa.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData('text', sa.id)}
                              className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-white/5 p-3 text-xs hover:border-saffron/40 hover:bg-white/[0.08] transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-3">
                                <span className="rounded-lg bg-saffron/20 px-2 py-1 font-mono text-[11px] font-semibold text-saffron shrink-0">
                                  {sa.start_time || '10:00'}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                                        isOutdoor
                                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                      }`}
                                    >
                                      {isOutdoor ? '🌲 Outdoor' : '🏛️ Indoor'}
                                    </span>
                                    <p className="font-semibold text-parchment">{act?.name}</p>
                                  </div>
                                  {sa.notes && (
                                    <p className="text-aurora text-[11px] mt-0.5 italic">Note: {sa.notes}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-saffron font-medium">
                                  {money(sa.cost_override ?? act?.cost ?? 0)}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-[11px]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditItem({ ...sa, actName: act?.name });
                                  }}
                                >
                                  <Edit2 className="mr-1 h-3 w-3" /> Quick Edit
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DndContext>
      ) : (
        /* Monthly Calendar View */
        <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-6">
          {/* Input Cities Legend Bar */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-saffron" /> Day-by-Day Calendar of Input Cities
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Visual daily schedule mapping your input destination cities and planned activities.
                </p>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-saffron/15 text-saffron font-bold">
                {stops.length} Input {stops.length === 1 ? 'City' : 'Cities'}
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {stops.map((stop, sIdx) => {
                const city = world.cities.find((c) => c.id === (stop.city_id || stop.cityId)) || stop.city;
                const color = COLORS[sIdx % COLORS.length];
                const sStart = stop.start_date || stop.startDate;
                const sEnd = stop.end_date || stop.endDate;
                const stopActs = world.stopActivities.filter((sa) => sa.stop_id === stop.id);

                return (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 rounded-2xl border p-3 bg-white/5 transition-all hover:bg-white/10"
                    style={{ borderColor: `${color}60` }}
                  >
                    <div
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    {city?.image && (
                      <img
                        src={city.image}
                        alt={city.name || 'City'}
                        onError={(e) => onImgError(e, city.name)}
                        className="h-10 w-10 rounded-xl object-cover shrink-0 border border-border/40"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-parchment truncate">
                        {city?.name || 'Input City'}
                      </p>
                      <p className="font-mono text-[10px] text-muted truncate">
                        {sStart} → {sEnd}
                      </p>
                      <p className="text-[10px] font-semibold text-aurora truncate">
                        {stopActs.length} {stopActs.length === 1 ? 'activity' : 'activities'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <p key={d} className="text-center font-mono text-xs font-semibold text-muted py-1">
                  {d}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((d) => {
                const iso = format(d, 'yyyy-MM-dd');
                const stop = stops.find((s) => {
                  const sStart = s.start_date || s.startDate;
                  const sEnd = s.end_date || s.endDate;
                  return iso >= sStart && iso <= sEnd;
                });
                const stopIndex = stop ? stops.indexOf(stop) : -1;
                const color = stopIndex >= 0 ? COLORS[stopIndex % COLORS.length] : undefined;
                const city = stop ? (world.cities.find((c) => c.id === (stop.city_id || stop.cityId)) || stop.city) : null;
                const acts = world.stopActivities.filter((sa) => sa.day_date === iso);
                const dayIndex = days.findIndex((day) => format(day, 'yyyy-MM-dd') === iso);
                const isTripDay = dayIndex >= 0;

                return (
                  <div
                    key={iso}
                    className={`min-h-32 rounded-2xl border p-2.5 flex flex-col justify-between transition-all ${
                      isTripDay
                        ? 'bg-white/5 shadow-sm hover:bg-white/[0.08]'
                        : 'border-border/20 opacity-30 bg-black/20'
                    }`}
                    style={{
                      borderColor: color ? `${color}80` : undefined,
                      borderTop: color ? `3px solid ${color}` : undefined,
                    }}
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: color || '#9aa3c7' }}
                        >
                          {format(d, 'd')}
                        </span>
                        {isTripDay && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-saffron/20 text-saffron font-semibold">
                            Day {dayIndex + 1}
                          </span>
                        )}
                      </div>

                      {/* City Highlight & Weather/Pace Badges */}
                      {city && (
                        <div
                          className="mt-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold truncate"
                          style={{
                            backgroundColor: `${color}25`,
                            color: color,
                          }}
                          title={`${city.name} (${city.country || ''})`}
                        >
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{city.name}</span>
                        </div>
                      )}

                      {/* Weather and Pace Indicators for Trip Days */}
                      {isTripDay && (
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <WeatherBadge
                            city={city}
                            dateIso={iso}
                            dayIndex={dayIndex}
                            outdoorCount={acts.filter((sa) => world.activities.find((a) => a.id === sa.activity_id)?.is_outdoor !== false).length}
                            onFixDay={(weather) =>
                              setWeatherModalData({
                                dateIso: iso,
                                dayIndex,
                                weather,
                                city,
                                outdoorActs: acts.filter((sa) => world.activities.find((a) => a.id === sa.activity_id)?.is_outdoor !== false),
                                sunnyDays: days
                                  .map((dItem, dIdx) => ({ iso: format(dItem, 'yyyy-MM-dd'), dayIndex: dIdx }))
                                  .filter((dItem) => dItem.iso !== iso),
                              })
                            }
                          />
                          <PaceMeterBadge pace={calculateDayPace(acts, world.activities, city)} />
                        </div>
                      )}

                      {/* Activities for this day */}
                      <div className="mt-2 space-y-1">
                        {acts.slice(0, 2).map((sa) => {
                          const act = world.activities.find((a) => a.id === sa.activity_id);
                          const isOutdoor = act?.is_outdoor !== false;
                          return (
                            <p
                              key={sa.id}
                              onClick={() => setEditItem({ ...sa, actName: act?.name })}
                              className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-parchment truncate cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1"
                              title="Click to edit activity"
                            >
                              <span>{isOutdoor ? '🌲' : '🏛️'}</span>
                              <span className="text-saffron font-bold">{sa.start_time}</span> · {act?.name}
                            </p>
                          );
                        })}
                        {acts.length > 2 && (
                          <p className="text-[10px] text-aurora font-mono font-medium pl-1">
                            +{acts.length - 2} more activities
                          </p>
                        )}
                      </div>
                    </div>

                    {isTripDay && acts.length === 0 && (
                      <p className="text-[10px] text-muted italic mt-1">
                        Explore {city?.name || 'city'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setEditItem(null)}
        >
          <div
            className="glass w-full max-w-sm rounded-3xl p-6 border border-border/60 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-display text-lg font-bold text-parchment">
                Edit Activity Details
              </h3>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="p-1 text-muted hover:text-parchment"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-saffron font-semibold">{editItem.actName}</p>

            <div>
              <Label htmlFor="schedTime">Scheduled Time</Label>
              <Input
                id="schedTime"
                className="mt-1.5"
                value={editItem.start_time || ''}
                onChange={(e) => setEditItem({ ...editItem, start_time: e.target.value })}
                placeholder="e.g. 10:30 AM"
              />
            </div>

            <div>
              <Label htmlFor="costOverride">Cost Override (Optional)</Label>
              <Input
                id="costOverride"
                type="number"
                className="mt-1.5"
                value={editItem.cost_override ?? ''}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    cost_override: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Leave blank to use catalog cost"
              />
            </div>

            <div>
              <Label htmlFor="actNotes">Personal Notes</Label>
              <Input
                id="actNotes"
                className="mt-1.5"
                value={editItem.notes || ''}
                onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })}
                placeholder="e.g. Bring camera, book tickets early"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button className="w-full" onClick={saveEdit}>
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setEditItem(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feature 1: Weather-Smart Auto-Reschedule Modal */}
      <WeatherRescheduleModal
        isOpen={Boolean(weatherModalData)}
        onClose={() => setWeatherModalData(null)}
        dayData={weatherModalData}
        trip={trip}
        currency={trip?.currency || 'INR'}
      />

      {/* Feature 2: Trip Pace & Burnout Rebalancer Modal */}
      <PaceRebalanceModal
        isOpen={isPaceModalOpen}
        onClose={() => setIsPaceModalOpen(false)}
        overview={paceOverview}
        trip={trip}
      />
    </div>
  );
}
