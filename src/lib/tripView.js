import { differenceInDays } from 'date-fns';
import { useWorldStore } from '@/store/useWorldStore.js';

export function codesFor(tripId) {
  const w = useWorldStore.getState();
  return w.stops
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => w.cities.find((c) => c.id === s.city_id)?.iata)
    .filter(Boolean);
}

export function pointsFor(tripId) {
  const w = useWorldStore.getState();
  return w.stops
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => {
      const c = w.cities.find((x) => x.id === s.city_id);
      return c ? { lat: c.lat, lng: c.lng, name: c.name } : null;
    })
    .filter(Boolean);
}

export function spendFor(tripId) {
  const w = useWorldStore.getState();
  const exp = w.expenses.filter((e) => e.trip_id === tripId);
  const acts = w.stopActivities.filter((sa) => w.stops.some((s) => s.id === sa.stop_id && s.trip_id === tripId));
  const actCost = acts.reduce((sum, sa) => {
    const a = w.activities.find((x) => x.id === sa.activity_id);
    return sum + (sa.cost_override ?? a?.cost ?? 0);
  }, 0);
  const byCat = { transport: 0, stay: 0, activities: actCost, meals: 0 };
  exp.forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });
  const total = Object.values(byCat).reduce((a, b) => a + b, 0);
  return { byCat, total, exp };
}

export function daysOf(start, end) {
  return Math.max(1, differenceInDays(new Date(end), new Date(start)) + 1);
}
