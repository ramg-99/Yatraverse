import { differenceInDays } from 'date-fns';
import { useWorldStore } from '@/store/useWorldStore.js';

export function codesFor(tripId) {
  const w = useWorldStore.getState();
  return w.stops
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => w.cities.find((c) => c.id === (s.city_id || s.cityId))?.iata)
    .filter(Boolean);
}

export function pointsFor(tripId) {
  const w = useWorldStore.getState();
  return w.stops
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => {
      const c = w.cities.find((x) => x.id === (s.city_id || s.cityId));
      return c ? { lat: c.lat, lng: c.lng, name: c.name } : null;
    })
    .filter(Boolean);
}

export function spendFor(tripId) {
  const w = useWorldStore.getState();
  const trip = w.trips.find((t) => t.id === tripId);
  const tripStops = w.stops
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.order_index - b.order_index);
  const exp = w.expenses.filter((e) => e.trip_id === tripId);
  const acts = w.stopActivities.filter((sa) => tripStops.some((s) => s.id === sa.stop_id));
  
  const actCost = acts.reduce((sum, sa) => {
    const a = w.activities.find((x) => x.id === sa.activity_id);
    return sum + (sa.cost_override ?? a?.cost ?? 0);
  }, 0);

  // Category sums from explicit logged expenses
  const byCat = { transport: 0, stay: 0, activities: actCost, meals: 0 };
  exp.forEach((e) => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount;
  });

  // Calculate city-by-city baseline budget from input cities (stops)
  const cityBreakdown = tripStops.map((stop, idx) => {
    const city = w.cities.find((c) => c.id === (stop.city_id || stop.cityId)) || stop.city;
    const sStart = stop.start_date || stop.startDate || trip?.start_date;
    const sEnd = stop.end_date || stop.endDate || trip?.end_date;
    let days = 2;
    if (sStart && sEnd) {
      try {
        days = Math.max(1, differenceInDays(new Date(sEnd), new Date(sStart)) + 1);
      } catch {
        days = 2;
      }
    }
    const costIdx = city?.cost_index || 3;
    const cityActs = acts.filter((sa) => sa.stop_id === stop.id);
    const cityActCost = cityActs.reduce((sum, sa) => {
      const a = w.activities.find((x) => x.id === sa.activity_id);
      return sum + (sa.cost_override ?? a?.cost ?? 0);
    }, 0);

    // Baseline daily estimates tailored to city cost index
    const estStayPerDay = costIdx * 2200;
    const estMealsPerDay = costIdx * 900;
    const estLocalTransport = costIdx * 500;
    const estActivities = cityActCost > 0 ? cityActCost : days * (costIdx * 450);

    const stopStay = days * estStayPerDay;
    const stopMeals = days * estMealsPerDay;
    const stopTransport = days * estLocalTransport + (idx > 0 ? 2500 : 0); // Intercity transit
    const stopTotal = stopStay + stopMeals + stopTransport + estActivities;

    return {
      stop,
      city,
      days,
      costIndex: costIdx,
      stay: stopStay,
      meals: stopMeals,
      transport: stopTransport,
      activities: estActivities,
      total: stopTotal,
    };
  });

  // If there are input cities, ensure byCat reflects estimated budget for categories without manual expenses
  if (tripStops.length > 0) {
    const sumCityStay = cityBreakdown.reduce((s, c) => s + c.stay, 0);
    const sumCityMeals = cityBreakdown.reduce((s, c) => s + c.meals, 0);
    const sumCityTransport = cityBreakdown.reduce((s, c) => s + c.transport, 0);
    const sumCityActivities = cityBreakdown.reduce((s, c) => s + c.activities, 0);

    if (byCat.stay === 0) byCat.stay = sumCityStay;
    if (byCat.meals === 0) byCat.meals = sumCityMeals;
    if (byCat.transport === 0) byCat.transport = sumCityTransport;
    if (byCat.activities === 0) byCat.activities = sumCityActivities;
  }

  const total = Object.values(byCat).reduce((a, b) => a + b, 0);
  return { byCat, total, cityBreakdown, exp, hasInputCities: tripStops.length > 0 };
}

export function daysOf(start, end) {
  return Math.max(1, differenceInDays(new Date(end), new Date(start)) + 1);
}
