import { simulate } from '@/lib/simulate.js';
import { slugify, uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';

/** @param {string} userId */
export function listTrips(userId) {
  return simulate(() => {
    const { trips } = useWorldStore.getState();
    return trips.filter((t) => t.user_id === userId || t.collaborators?.includes(userId));
  });
}

/** @param {string} id */
export function getTrip(id) {
  return simulate(() => useWorldStore.getState().trips.find((t) => t.id === id) || null, { failRate: 0.03 });
}

/** @param {string} slug */
export function getTripBySlug(slug) {
  return simulate(() => {
    const trip = useWorldStore.getState().trips.find((t) => t.share_slug === slug && t.is_public);
    if (!trip) throw new Error('This constellation is private or missing.');
    return trip;
  }, { failRate: 0.03 });
}

/** @param {Partial<import('@/data/schema.js').Trip> & {user_id:string,name:string,start_date:string,end_date:string}} payload */
export function createTrip(payload) {
  return simulate(() => {
    const trip = {
      id: uid('t'),
      description: '',
      cover_url: payload.cover_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400',
      is_public: false,
      share_slug: slugify(payload.name) + '-' + uid('x').slice(-4),
      created_at: new Date().toISOString(),
      budget_cap: 200000,
      collaborators: [],
      notes: '',
      ...payload,
    };
    const { trips, setTrips } = useWorldStore.getState();
    setTrips([trip, ...trips]);
    return trip;
  });
}

/** @param {string} id @param {Partial<import('@/data/schema.js').Trip>} patch */
export function updateTrip(id, patch) {
  return simulate(() => {
    const { trips, setTrips } = useWorldStore.getState();
    const next = trips.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setTrips(next);
    return next.find((t) => t.id === id);
  }, { failRate: 0.04 });
}

/** @param {string} id */
export function deleteTrip(id) {
  return simulate(() => {
    const w = useWorldStore.getState();
    w.setTrips(w.trips.filter((t) => t.id !== id));
    w.setStops(w.stops.filter((s) => s.trip_id !== id));
    w.setExpenses(w.expenses.filter((e) => e.trip_id !== id));
    return true;
  });
}

/** @param {string} tripId @param {string} userId */
export function cloneTrip(tripId, userId) {
  return simulate(() => {
    const w = useWorldStore.getState();
    const src = w.trips.find((t) => t.id === tripId);
    if (!src) throw new Error('Trip vanished from the atlas.');
    const trip = {
      ...src,
      id: uid('t'),
      user_id: userId,
      name: `${src.name} (copy)`,
      is_public: false,
      share_slug: slugify(src.name) + '-' + uid('x').slice(-4),
      created_at: new Date().toISOString(),
      collaborators: [],
    };
    const stopMap = {};
    const newStops = w.stops
      .filter((s) => s.trip_id === tripId)
      .map((s) => {
        const id = uid('s');
        stopMap[s.id] = id;
        return { ...s, id, trip_id: trip.id };
      });
    const newSa = w.stopActivities
      .filter((sa) => stopMap[sa.stop_id])
      .map((sa) => ({ ...sa, id: uid('sa'), stop_id: stopMap[sa.stop_id] }));
    w.setTrips([trip, ...w.trips]);
    w.setStops([...w.stops, ...newStops]);
    w.setStopActivities([...w.stopActivities, ...newSa]);
    return trip;
  });
}

/**
 * @param {{ trip_id: string, city_id: string, start_date: string, end_date: string }} payload
 */
export function addStop(payload) {
  return simulate(() => {
    const w = useWorldStore.getState();
    const existing = w.stops.filter((s) => s.trip_id === payload.trip_id);
    const overlap = existing.some(
      (s) => !(payload.end_date <= s.start_date || payload.start_date >= s.end_date),
    );
    if (overlap) throw new Error('Those dates overlap another stop. Shift the orbit.');
    const trip = w.trips.find((t) => t.id === payload.trip_id);
    if (payload.start_date < trip.start_date || payload.end_date > trip.end_date) {
      throw new Error('Stop must sit inside the trip dates.');
    }
    const stop = {
      id: uid('s'),
      order_index: existing.length,
      ...payload,
    };
    w.setStops([...w.stops, stop]);
    return stop;
  }, { failRate: 0.05 });
}

/** @param {string} tripId @param {string[]} orderedIds */
export function reorderStops(tripId, orderedIds) {
  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStops(
      w.stops.map((s) =>
        s.trip_id === tripId ? { ...s, order_index: orderedIds.indexOf(s.id) } : s,
      ),
    );
    return true;
  }, { failRate: 0.02 });
}

/** @param {Partial<import('@/data/schema.js').StopActivity> & {stop_id:string,activity_id:string,day_date:string}} payload */
export function addStopActivity(payload) {
  return simulate(() => {
    const w = useWorldStore.getState();
    const sa = {
      id: uid('sa'),
      start_time: '10:00',
      order_index: w.stopActivities.filter((x) => x.stop_id === payload.stop_id && x.day_date === payload.day_date)
        .length,
      votes: 0,
      notes: '',
      ...payload,
    };
    w.setStopActivities([...w.stopActivities, sa]);
    return sa;
  });
}

/** @param {string} id */
export function removeStopActivity(id) {
  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStopActivities(w.stopActivities.filter((s) => s.id !== id));
    return true;
  }, { failRate: 0.02 });
}

/** @param {string[]} orderedIds */
export function reorderStopActivities(orderedIds) {
  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStopActivities(
      w.stopActivities.map((s) =>
        orderedIds.includes(s.id) ? { ...s, order_index: orderedIds.indexOf(s.id) } : s,
      ),
    );
    return true;
  }, { failRate: 0.02 });
}

/** @param {import('@/data/schema.js').Expense} payload */
export function addExpense(payload) {
  return simulate(() => {
    const w = useWorldStore.getState();
    const exp = { id: uid('e'), ...payload };
    w.setExpenses([...w.expenses, exp]);
    return exp;
  });
}
