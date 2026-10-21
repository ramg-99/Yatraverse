import { useMemo, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import {
  PlusCircle,
  GripVertical,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  PieChart,
  Share2,
  MapPin,
  X,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  List as ListIcon,
} from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { addStop, removeStop, addStopActivity, removeStopActivity, reorderStops, updateTrip } from '@/services/trips.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { pointsFor, spendFor } from '@/lib/tripView.js';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { TripOptimizerModal } from '@/features/ai/TripOptimizerModal.jsx';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

function SortableStop({ stop, index, total, city, activities, onAssignAct, onRemoveStop, onMoveUp, onMoveDown }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const world = useWorldStore();

  const stopActs = world.stopActivities.filter((sa) => sa.stop_id === stop.id);

  const removeAct = async (saId) => {
    try {
      await removeStopActivity(saId);
      toast.success('Activity removed from stop.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass mb-4 rounded-3xl border border-border/50 p-5 shadow-md transition-all hover:border-saffron/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab text-muted hover:text-parchment p-1 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            title="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron/20 font-mono text-xs font-bold text-saffron shrink-0">
            {index + 1}
          </span>
          {city?.image && (
            <img
              src={city.image}
              alt={city.name || 'City'}
              onError={(e) => onImgError(e, city.name)}
              className="h-11 w-11 rounded-xl object-cover border border-border/40 shrink-0"
            />
          )}
          <div>
            <h3 className="font-display text-xl font-bold text-parchment flex items-center gap-2">
              {city?.name || 'City Destination'}
              <span className="text-xs font-normal text-muted">({city?.country || 'Stop'})</span>
            </h3>
            <p className="font-mono text-xs text-muted flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-aurora" />
              {stop.start_date} → {stop.end_date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {index > 0 && (
            <button
              type="button"
              onClick={onMoveUp}
              className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-parchment"
              title="Move stop up"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
          {index < total - 1 && (
            <button
              type="button"
              onClick={onMoveDown}
              className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-parchment"
              title="Move stop down"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={onAssignAct}
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5 text-saffron" /> Assign Activity
          </Button>
          <button
            type="button"
            onClick={onRemoveStop}
            className="rounded-lg p-1.5 text-coral/80 hover:bg-coral/10 hover:text-coral transition-colors"
            title="Remove stop"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Assigned Activities */}
      <div className="mt-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">
          Assigned Activities ({stopActs.length})
        </p>
        {stopActs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/40 p-3 text-center text-xs text-muted">
            No activities assigned yet for this stop. Click "Assign Activity" to add experiences.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {stopActs.map((sa) => {
              const act = activities.find((a) => a.id === sa.activity_id);
              return (
                <div
                  key={sa.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 text-xs border border-border/30"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={act?.image}
                      alt=""
                      onError={(e) => onImgError(e, act?.name)}
                      className="h-9 w-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-parchment truncate">{act?.name}</p>
                      <p className="font-mono text-[10px] text-muted flex items-center gap-1.5">
                        <span>{sa.start_time || '10:00'}</span>
                        <span>·</span>
                        <span className="text-saffron">{money(sa.cost_override ?? act?.cost ?? 0)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAct(sa.id)}
                    className="p-1 text-muted hover:text-coral transition-colors ml-2"
                    title="Remove activity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripBuildPage() {
  const { id } = useParams();
  const world = useWorldStore();
  const trip = world.trips.find((t) => t.id === id);
  const stops = world.stops.filter((s) => s.trip_id === id).sort((a, b) => a.order_index - b.order_index);

  const [cityId, setCityId] = useState(world.cities[0]?.id || '');
  const selectedCity = world.cities.find((c) => c.id === cityId);
  const [start, setStart] = useState(trip?.start_date || '');
  const [end, setEnd] = useState(trip?.end_date || '');
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [assigningStop, setAssigningStop] = useState(null);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const points = useMemo(() => pointsFor(id), [id, world.stops]);

  const COLORS = ['#FFB02E', '#2DD4BF', '#FF6B6B', '#a78bfa', '#38bdf8'];
  const [scheduleView, setScheduleView] = useState('calendar'); // 'calendar' | 'list'

  const scheduleDays = useMemo(() => {
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
        const acts = world.stopActivities.filter((sa) => sa.day_date === iso);
        return { d, iso, dayNum: index + 1, stop, city, color, acts };
      });
    } catch {
      return [];
    }
  }, [trip, stops, world.cities, world.stopActivities]);

  const spend = useMemo(
    () => (trip ? spendFor(id) : { total: 0, byCat: {}, cityBreakdown: [] }),
    [id, trip, stops, world.stopActivities, world.expenses]
  );

  if (!trip) {
    return (
      <div className="glass rounded-3xl p-8 text-center max-w-md mx-auto my-12">
        <h2 className="font-display text-2xl font-bold">Trip Not Found</h2>
        <p className="mt-2 text-xs text-muted">The requested trip could not be located in your account.</p>
        <Link to="/trips" className="mt-4 inline-block">
          <Button size="sm">Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  const applyOrder = async (ids) => {
    try {
      await reorderStops(id, ids);
      toast.success('Destinations reordered.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onDragEnd = (e) => {
    if (!e.over) return;
    const ids = stops.map((s) => s.id);
    const old = ids.indexOf(e.active.id);
    const neu = ids.indexOf(e.over.id);
    if (old !== neu) {
      applyOrder(arrayMove(ids, old, neu));
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const ids = stops.map((s) => s.id);
    applyOrder(arrayMove(ids, index, index - 1));
  };

  const moveDown = (index) => {
    if (index >= stops.length - 1) return;
    const ids = stops.map((s) => s.id);
    applyOrder(arrayMove(ids, index, index + 1));
  };

  const handleAddStop = async () => {
    if (!cityId) return;
    try {
      await addStop({
        trip_id: id,
        city_id: cityId,
        start_date: start || trip.start_date,
        end_date: end || trip.end_date,
      });
      toast.success('City stop added to trip.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleRemoveStop = async (stopId) => {
    try {
      await removeStop(stopId);
      toast.success('Stop removed from itinerary.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const assignActivityToStop = async (activity) => {
    if (!assigningStop) return;
    try {
      await addStopActivity({
        stop_id: assigningStop.id,
        activity_id: activity.id,
        day_date: assigningStop.start_date,
        start_time: selectedTime,
      });
      toast.success(`"${activity.name}" assigned to ${selectedTime}.`);
      setAssigningStop(null);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Activities available for the stop being assigned
  const availableActivities = useMemo(() => {
    if (!assigningStop) return [];
    return world.activities.filter((a) => a.city_id === assigningStop.city_id);
  }, [assigningStop, world.activities]);

  const activeStopCity = world.cities.find((c) => c.id === assigningStop?.city_id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Itinerary Builder
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-parchment">
            Itinerary Builder: {trip.name}
          </h1>
          <p className="text-xs text-muted">
            Add destinations, arrange travel dates, and assign activities for each stop.
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/trips/${id}`}>
            <Button size="sm" variant="solid">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Itinerary
            </Button>
          </Link>
          <Link to={`/trips/${id}/budget`}>
            <Button size="sm" variant="outline">
              <PieChart className="mr-1.5 h-3.5 w-3.5" /> Budget
            </Button>
          </Link>
          <Link to={`/trips/${id}/timeline`}>
            <Button size="sm" variant="outline">
              <Calendar className="mr-1.5 h-3.5 w-3.5" /> Timeline
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="border-aurora/40 text-aurora"
            onClick={() => setShowOptimizer(true)}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Optimize
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Builder */}
        <div className="space-y-6">
          {/* Add Stop Form */}
          <div className="glass rounded-3xl p-5 border border-border/50 shadow-md">
            <h2 className="font-display text-lg font-bold text-parchment mb-3">
              Add a City Stop
            </h2>
            <div className="grid gap-3 sm:grid-cols-4 items-end">
              <div className="sm:col-span-2">
                <Label htmlFor="citySelect">Select City</Label>
                <select
                  id="citySelect"
                  className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-black shadow-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/40"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                >
                  {world.cities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-black font-medium py-1">
                      {c.name}, {c.country} (Cost: {c.cost_index}/5)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="stopFrom">Arrival</Label>
                <Input
                  id="stopFrom"
                  type="date"
                  className="mt-1.5"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stopTo">Departure</Label>
                <Input
                  id="stopTo"
                  type="date"
                  className="mt-1.5"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Selected City Visual Preview Card */}
            {selectedCity && (
              <div className="mt-4 flex items-center gap-3.5 rounded-2xl bg-white/10 p-3.5 border border-saffron/40 shadow-sm">
                <img
                  src={selectedCity.image}
                  alt={selectedCity.name}
                  onError={(e) => onImgError(e, selectedCity.name)}
                  className="h-12 w-12 rounded-xl object-cover border border-border/50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-mono tracking-wider text-aurora font-bold">Selected City:</span>
                    <span className="font-display text-base font-bold text-parchment">{selectedCity.name}, {selectedCity.country}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    Region: {selectedCity.region} · Cost Index: {selectedCity.cost_index}/5 · Best Season: {selectedCity.best_season}
                  </p>
                </div>
              </div>
            )}

            <Button className="mt-4 w-full sm:w-auto" onClick={handleAddStop}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Stop to Itinerary
            </Button>
          </div>

          {/* Dynamic Trip Budget for Input Cities */}
          {stops.length > 0 && (
            <div className="glass rounded-3xl p-5 border border-border/50 shadow-md bg-gradient-to-r from-saffron/[0.05] via-aurora/[0.04] to-transparent">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-aurora font-semibold">
                      Trip Budget
                    </span>
                    <span className="rounded-full bg-saffron/20 px-2 py-0.5 font-mono text-[10px] text-saffron font-bold">
                      Calculated for {stops.length} {stops.length === 1 ? 'City' : 'Cities'}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-parchment flex items-center gap-2">
                    Estimated Budget: <span className="text-saffron">{money(spend.total)}</span>
                  </h3>
                  <p className="text-xs text-muted">
                    Dynamic estimate calculated from your input cities' daily cost index, stay duration, and assigned activities.
                  </p>
                </div>

                <Link to={`/trips/${id}/budget`}>
                  <Button size="sm" variant="outline" className="border-saffron/40 text-saffron hover:bg-saffron/10 text-xs shadow-sm">
                    <PieChart className="mr-1.5 h-3.5 w-3.5" /> Full Budget Breakdown →
                  </Button>
                </Link>
              </div>

              {/* Category Pills */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/30 text-xs">
                <div className="rounded-xl bg-white/5 p-2.5 border border-border/30">
                  <span className="text-[11px] text-muted">🏨 Stay</span>
                  <p className="font-mono font-bold text-parchment mt-0.5">{money(spend.byCat?.stay || 0)}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-border/30">
                  <span className="text-[11px] text-muted">🍽️ Meals</span>
                  <p className="font-mono font-bold text-parchment mt-0.5">{money(spend.byCat?.meals || 0)}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-border/30">
                  <span className="text-[11px] text-muted">🚕 Transport</span>
                  <p className="font-mono font-bold text-parchment mt-0.5">{money(spend.byCat?.transport || 0)}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5 border border-border/30">
                  <span className="text-[11px] text-muted">🎯 Activities</span>
                  <p className="font-mono font-bold text-parchment mt-0.5">{money(spend.byCat?.activities || 0)}</p>
                </div>
              </div>

              {/* City Cost Pills */}
              {spend.cityBreakdown && spend.cityBreakdown.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/20 text-xs">
                  <span className="text-[11px] text-muted font-mono mr-1">City Budgets:</span>
                  {spend.cityBreakdown.map((item, idx) => (
                    <span
                      key={item.stop?.id || idx}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-parchment border border-border/40"
                    >
                      <MapPin className="h-3 w-3 text-aurora" />
                      {item.city?.name || 'City'}: <span className="text-saffron font-semibold">{money(item.total)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stops List with Dnd Kit Reordering */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl font-bold text-parchment">
                Itinerary Stops ({stops.length})
              </h2>
              <span className="text-xs text-muted">Drag or use arrows to reorder destinations</span>
            </div>

            {stops.length === 0 ? (
              <div className="glass rounded-3xl p-8 text-center border border-dashed border-border/40">
                <MapPin className="mx-auto h-8 w-8 text-muted mb-2 opacity-60" />
                <p className="font-display text-base font-semibold">No stops in this trip yet</p>
                <p className="text-xs text-muted mt-1">Use the "Add Stop" form above to select your first destination.</p>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {stops.map((s, idx) => (
                    <SortableStop
                      key={s.id}
                      stop={s}
                      index={idx}
                      total={stops.length}
                      city={world.cities.find((c) => c.id === s.city_id || c.id === s.cityId) || s.city || { name: s.city_id || 'City Stop', country: '' }}
                      activities={world.activities}
                      onAssignAct={() => setAssigningStop(s)}
                      onRemoveStop={() => handleRemoveStop(s.id)}
                      onMoveUp={() => moveUp(idx)}
                      onMoveDown={() => moveDown(idx)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Day-by-Day Schedule of Input Cities */}
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-aurora">Schedule View</span>
                  <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-mono font-bold text-saffron">
                    {scheduleDays.length} {scheduleDays.length === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-parchment mt-0.5 flex items-center gap-2">
                  Day-by-Day Schedule of Input Cities
                </h3>
                <p className="text-xs text-muted">
                  Inspect how your added destinations and activities map day by day.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-border/50 bg-white/5 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setScheduleView('calendar')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      scheduleView === 'calendar'
                        ? 'bg-saffron text-ink shadow-sm'
                        : 'text-muted hover:text-parchment'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" /> Calendar Option
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleView('list')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      scheduleView === 'list'
                        ? 'bg-saffron text-ink shadow-sm'
                        : 'text-muted hover:text-parchment'
                    }`}
                  >
                    <ListIcon className="h-3.5 w-3.5" /> Day List
                  </button>
                </div>

                <Link to={`/trips/${id}/timeline?view=calendar`}>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Full Calendar ↗
                  </Button>
                </Link>
              </div>
            </div>

            {/* If no stops or days */}
            {scheduleDays.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center text-xs text-muted">
                Add city stops above to generate your day-by-day calendar schedule.
              </div>
            ) : scheduleView === 'calendar' ? (
              <div>
                {/* Day headers Sun - Sat */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <p key={d} className="text-center font-mono text-xs font-semibold text-muted py-1">
                      {d}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {/* Leading blank offset */}
                  {Array.from({ length: scheduleDays[0]?.d.getDay() || 0 }).map((_, i) => (
                    <div key={`blank-${i}`} className="min-h-24 rounded-2xl border border-dashed border-border/20 p-2 opacity-30 bg-black/10" />
                  ))}
                  {/* Days */}
                  {scheduleDays.map((day) => (
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
                            {format(day.d, 'd')}
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
                          {day.acts.slice(0, 2).map((sa) => {
                            const act = world.activities.find((a) => a.id === sa.activity_id);
                            return (
                              <p
                                key={sa.id}
                                className="rounded bg-white/10 px-1 py-0.5 font-mono text-[9px] text-parchment truncate"
                                title={act?.name}
                              >
                                <span className="text-saffron font-semibold">{sa.start_time}</span> {act?.name}
                              </p>
                            );
                          })}
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
            ) : (
              /* Day List View */
              <div className="space-y-3">
                {scheduleDays.map((day) => (
                  <div
                    key={day.iso}
                    className="rounded-2xl border border-border/40 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4 transition-all hover:bg-white/[0.08]"
                    style={{ borderLeft: `4px solid ${day.color}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold"
                        style={{ backgroundColor: `${day.color}25`, color: day.color }}
                      >
                        {day.dayNum}
                      </span>
                      {day.city?.image && (
                        <img
                          src={day.city.image}
                          alt={day.city.name || 'City'}
                          onError={(e) => onImgError(e, day.city.name)}
                          className="h-10 w-10 rounded-xl object-cover border border-border/40 shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="font-display text-sm font-bold text-parchment flex items-center gap-2">
                          Day {day.dayNum}: {format(day.d, 'EEEE, dd MMMM yyyy')}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                            style={{ backgroundColor: `${day.color}25`, color: day.color }}
                          >
                            <MapPin className="h-3 w-3" />
                            {day.city?.name || 'Input City'}{day.city?.country ? `, ${day.city.country}` : ''}
                          </span>
                          <span className="text-xs text-muted">
                            · {day.acts.length} {day.acts.length === 1 ? 'activity' : 'activities'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {day.stop && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-saffron hover:bg-saffron/10"
                        onClick={() => setAssigningStop(day.stop)}
                      >
                        <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Activity
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Route Map & Trip Summary */}
        <div className="space-y-4">
          <div className="glass rounded-3xl p-4 border border-border/40 sticky top-20 shadow-md">
            <h3 className="font-display text-base font-bold text-parchment mb-2">Route Overview</h3>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
              <TripMap points={points} className="h-64 w-full overflow-hidden rounded-2xl" />
            </Suspense>

            <div className="mt-4 space-y-2 pt-2 border-t border-border/30 text-xs">
              <div className="flex justify-between text-muted">
                <span>Trip Dates:</span>
                <span className="font-mono text-parchment">{trip.start_date} → {trip.end_date}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Total Stops:</span>
                <span className="font-mono text-parchment">{stops.length} Cities</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span className="font-semibold text-parchment">Est. Trip Budget:</span>
                <span className="font-mono text-base font-bold text-saffron">{money(spend.total)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Budget Cap:</span>
                <span className="font-mono text-parchment">{money(trip.budget_cap)}</span>
              </div>
              <div className="pt-1">
                <div className="flex justify-between text-[11px] text-muted mb-1">
                  <span>Budget Utilization</span>
                  <span className={spend.total > trip.budget_cap ? 'text-coral font-bold' : 'text-aurora font-medium'}>
                    {Math.round((spend.total / (trip.budget_cap || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      spend.total > trip.budget_cap ? 'bg-coral' : 'bg-saffron'
                    }`}
                    style={{ width: `${Math.min(100, (spend.total / (trip.budget_cap || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/30 flex flex-col gap-2">
              <Link to={`/trips/${id}/budget`} className="w-full">
                <Button size="sm" variant="outline" className="w-full border-aurora/40 text-aurora hover:bg-aurora/10">
                  <PieChart className="mr-1.5 h-3.5 w-3.5" /> View Budget Breakdown ({money(spend.total)}) →
                </Button>
              </Link>
              <Link to={`/trips/${id}/timeline?view=calendar`} className="w-full">
                <Button size="sm" variant="outline" className="w-full border-saffron/40 text-saffron hover:bg-saffron/10">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" /> Day-by-Day Calendar →
                </Button>
              </Link>
              <Link to={`/trips/${id}`} className="w-full">
                <Button size="sm" className="w-full">
                  Preview Full Plan →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Activity Modal */}
      {assigningStop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setAssigningStop(null)}
        >
          <div
            className="glass w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 border border-border/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-parchment">
                  Assign Activity to {activeStopCity?.name}
                </h3>
                <p className="text-xs text-muted">Select an experience and scheduled start time</p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningStop(null)}
                className="rounded-lg p-1 text-muted hover:text-parchment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Label htmlFor="schedTime" className="text-xs shrink-0">Scheduled Time:</Label>
              <select
                id="schedTime"
                className="h-9 rounded-xl border border-border bg-ink px-3 text-xs text-parchment"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="08:00">08:00 AM (Morning)</option>
                <option value="10:00">10:00 AM (Mid-Morning)</option>
                <option value="13:00">01:00 PM (Afternoon)</option>
                <option value="16:00">04:00 PM (Late Afternoon)</option>
                <option value="19:00">07:00 PM (Evening)</option>
                <option value="21:00">09:00 PM (Night)</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              {availableActivities.length === 0 ? (
                <p className="text-xs text-muted p-4 text-center">
                  No curated activities found for this city.
                </p>
              ) : (
                availableActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-white/5 p-3 hover:border-saffron/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={act.image}
                        alt={act.name}
                        onError={(e) => onImgError(e, act.name)}
                        className="h-14 w-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-display text-sm font-bold text-parchment">{act.name}</h4>
                        <p className="text-[11px] text-muted line-clamp-1">{act.description}</p>
                        <div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-muted">
                          <span className="text-saffron font-medium">{money(act.cost)}</span>
                          <span>·</span>
                          <span>{act.duration_min} mins</span>
                          <span>·</span>
                          <span className="capitalize">{act.type}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => assignActivityToStop(act)}
                      className="shrink-0 text-xs"
                    >
                      Assign
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Optimizer Modal */}
      {showOptimizer && (
        <TripOptimizerModal trip={trip} onClose={() => setShowOptimizer(false)} />
      )}
    </div>
  );
}
