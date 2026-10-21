import { simulate } from '@/lib/simulate.js';
import { slugify, uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import {
  apiRequest,
  isBackendAvailable,
  normalizeTrip,
  normalizeStop,
  normalizeStopActivity,
  normalizeExpense,
} from '@/lib/api.js';

/**
 * Syncs full trip hierarchy (trip, stops, stopActivities, expenses) into useWorldStore
 */
function syncTripHierarchyToStore(trip) {
  if (!trip) return;
  const w = useWorldStore.getState();
  // Sync trip
  const existingTrips = w.trips.filter((t) => t.id !== trip.id);
  w.setTrips([trip, ...existingTrips]);

  // Sync stops & stopActivities if included
  if (Array.isArray(trip.stops)) {
    const tripStops = trip.stops;
    const otherStops = w.stops.filter((s) => s.trip_id !== trip.id);
    w.setStops([...otherStops, ...tripStops]);

    const newSa = [];
    tripStops.forEach((s) => {
      if (Array.isArray(s.stopActivities)) {
        newSa.push(...s.stopActivities);
      }
    });
    if (newSa.length > 0) {
      const stopIds = new Set(tripStops.map((s) => s.id));
      const otherSa = w.stopActivities.filter((sa) => !stopIds.has(sa.stop_id));
      w.setStopActivities([...otherSa, ...newSa]);
    }
  }

  // Sync expenses if included
  if (Array.isArray(trip.expenses)) {
    const otherExp = w.expenses.filter((e) => e.trip_id !== trip.id);
    w.setExpenses([...otherExp, ...trip.expenses]);
  }
}

/** @param {string} userId */
export async function listTrips(userId) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest('/trips');
      const trips = (data || []).map(normalizeTrip);
      const w = useWorldStore.getState();
      w.setTrips(trips);

      // Also sync all stops and stop activities
      const allStops = [];
      const allSa = [];
      const allExp = [];
      trips.forEach((t) => {
        if (t.stops) {
          allStops.push(...t.stops);
          t.stops.forEach((s) => {
            if (s.stopActivities) allSa.push(...s.stopActivities);
          });
        }
        if (t.expenses) allExp.push(...t.expenses);
      });
      if (allStops.length) w.setStops(allStops);
      if (allSa.length) w.setStopActivities(allSa);
      if (allExp.length) w.setExpenses(allExp);

      return trips;
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const { trips } = useWorldStore.getState();
    return trips.filter((t) => t.user_id === userId || t.collaborators?.includes(userId));
  });
}

/** @param {string} id */
export async function getTrip(id) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest(`/trips/${id}`);
      const trip = normalizeTrip(data);
      syncTripHierarchyToStore(trip);
      return trip;
    } catch {
      // fallback
    }
  }

  return simulate(() => useWorldStore.getState().trips.find((t) => t.id === id) || null, { failRate: 0.01 });
}

/** @param {string} slug */
export async function getTripBySlug(slug) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest(`/trips/share/${slug}`);
      const trip = normalizeTrip(data);
      syncTripHierarchyToStore(trip);
      return trip;
    } catch (err) {
      if (err.status === 404) throw err;
    }
  }

  return simulate(() => {
    const trip = useWorldStore.getState().trips.find((t) => t.share_slug === slug && t.is_public);
    if (!trip) throw new Error('This constellation is private or missing.');
    return trip;
  }, { failRate: 0.01 });
}

/** @param {Partial<import('@/data/schema.js').Trip> & {user_id:string,name:string,start_date:string,end_date:string}} payload */
export async function createTrip(payload) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify({
          name: payload.name,
          description: payload.description || '',
          startDate: payload.start_date || payload.startDate,
          endDate: payload.end_date || payload.endDate,
          coverUrl: payload.cover_url || payload.coverUrl,
          budgetCap: payload.budget_cap || payload.budgetCap,
          isPublic: payload.is_public !== undefined ? payload.is_public : payload.isPublic,
          notes: payload.notes || '',
        }),
      });
      const trip = normalizeTrip(data);
      const { trips, setTrips } = useWorldStore.getState();
      setTrips([trip, ...trips.filter((t) => t.id !== trip.id)]);
      return trip;
    } catch {
      // fallback
    }
  }

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
export async function updateTrip(id, patch) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest(`/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: patch.name,
          description: patch.description,
          startDate: patch.start_date || patch.startDate,
          endDate: patch.end_date || patch.endDate,
          coverUrl: patch.cover_url || patch.coverUrl,
          isPublic: patch.is_public !== undefined ? patch.is_public : patch.isPublic,
          budgetCap: patch.budget_cap !== undefined ? patch.budget_cap : patch.budgetCap,
          notes: patch.notes,
        }),
      });
      const trip = normalizeTrip(data);
      syncTripHierarchyToStore(trip);
      return trip;
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const { trips, setTrips } = useWorldStore.getState();
    const next = trips.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setTrips(next);
    return next.find((t) => t.id === id);
  }, { failRate: 0.01 });
}

/** @param {string} id */
export async function deleteTrip(id) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      await apiRequest(`/trips/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    w.setTrips(w.trips.filter((t) => t.id !== id));
    w.setStops(w.stops.filter((s) => s.trip_id !== id));
    w.setExpenses(w.expenses.filter((e) => e.trip_id !== id));
    return true;
  });
}

/** @param {string} tripId @param {string} userId */
export async function cloneTrip(tripId, userId) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest(`/trips/${tripId}/clone`, { method: 'POST' });
      const trip = normalizeTrip(data);
      syncTripHierarchyToStore(trip);
      return trip;
    } catch {
      // fallback
    }
  }

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
export async function addStop(payload) {
  const tripId = payload.trip_id || payload.tripId;
  const online = await isBackendAvailable();
  if (online && tripId) {
    try {
      const data = await apiRequest(`/trips/${tripId}/stops`, {
        method: 'POST',
        body: JSON.stringify({
          cityId: payload.city_id || payload.cityId,
          startDate: payload.start_date || payload.startDate,
          endDate: payload.end_date || payload.endDate,
        }),
      });
      const stop = normalizeStop(data);
      const w = useWorldStore.getState();
      w.setStops([...w.stops, stop]);
      return stop;
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    const existing = w.stops.filter((s) => s.trip_id === payload.trip_id);
    const stop = {
      id: uid('s'),
      order_index: existing.length,
      ...payload,
    };
    w.setStops([...w.stops, stop]);
    return stop;
  }, { failRate: 0.01 });
}

/** @param {string} stopId */
export async function removeStop(stopId) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      await apiRequest(`/trips/stops/${stopId}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
  }
  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStops(w.stops.filter((s) => s.id !== stopId));
    w.setStopActivities(w.stopActivities.filter((sa) => sa.stop_id !== stopId));
    return true;
  });
}


/** @param {string} tripId @param {string[]} orderedIds */
export async function reorderStops(tripId, orderedIds) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      await apiRequest(`/trips/${tripId}/stops/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ ids: orderedIds }),
      });
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStops(
      w.stops.map((s) =>
        s.trip_id === tripId ? { ...s, order_index: orderedIds.indexOf(s.id) } : s,
      ),
    );
    return true;
  }, { failRate: 0.01 });
}

/** @param {Partial<import('@/data/schema.js').StopActivity> & {stop_id:string,activity_id:string,day_date:string}} payload */
export async function addStopActivity(payload) {
  const stopId = payload.stop_id || payload.stopId;
  const online = await isBackendAvailable();
  if (online && stopId) {
    try {
      const data = await apiRequest(`/trips/stops/${stopId}/activities`, {
        method: 'POST',
        body: JSON.stringify({
          activityId: payload.activity_id || payload.activityId,
          dayDate: payload.day_date || payload.dayDate,
          startTime: payload.start_time || payload.startTime || '10:00',
          costOverride: payload.cost_override !== undefined ? payload.cost_override : payload.costOverride,
          notes: payload.notes,
        }),
      });
      const sa = normalizeStopActivity(data);
      const w = useWorldStore.getState();
      w.setStopActivities([...w.stopActivities, sa]);
      return sa;
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    const sa = {
      id: uid('sa'),
      start_time: '10:00',
      order_index: w.stopActivities.filter((x) => x.stop_id === payload.stop_id && x.day_date === payload.day_date).length,
      votes: 0,
      notes: '',
      ...payload,
    };
    w.setStopActivities([...w.stopActivities, sa]);
    return sa;
  });
}

/** @param {string} id */
export async function removeStopActivity(id) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      await apiRequest(`/trips/stop-activities/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    w.setStopActivities(w.stopActivities.filter((s) => s.id !== id));
    return true;
  }, { failRate: 0.01 });
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
  }, { failRate: 0.01 });
}

/** @param {import('@/data/schema.js').Expense} payload */
export async function addExpense(payload) {
  const tripId = payload.trip_id || payload.tripId;
  const online = await isBackendAvailable();
  if (online && tripId) {
    try {
      const data = await apiRequest(`/trips/${tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          category: payload.category,
          amount: payload.amount,
          currency: payload.currency || 'INR',
          notes: payload.notes || '',
          date: payload.date,
        }),
      });
      const exp = normalizeExpense(data);
      const w = useWorldStore.getState();
      w.setExpenses([...w.expenses, exp]);
      return exp;
    } catch {
      // fallback
    }
  }

  return simulate(() => {
    const w = useWorldStore.getState();
    const exp = { id: uid('e'), ...payload };
    w.setExpenses([...w.expenses, exp]);
    return exp;
  });
}
