import { simulate } from '@/lib/simulate.js';
import { useWorldStore } from '@/store/useWorldStore.js';

/** @returns {Promise<object>} */
export function adminStats() {
  return simulate(() => {
    const { trips, users, stops, cities, activities } = useWorldStore.getState();
    const cityCounts = {};
    stops.forEach((s) => {
      cityCounts[s.city_id] = (cityCounts[s.city_id] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, n]) => ({ city: cities.find((c) => c.id === id)?.name || id, n }));
    return {
      users: users.length,
      trips: trips.length,
      dau: 2,
      mau: users.length,
      avgLength: 11,
      topCities,
      topActivities: activities.slice(0, 5).map((a) => a.name),
      tripsOverTime: [
        { month: 'May', trips: 2 },
        { month: 'Jun', trips: 3 },
        { month: 'Jul', trips: 4 },
        { month: 'Aug', trips: 5 },
        { month: 'Sep', trips: 7 },
        { month: 'Oct', trips: trips.length },
      ],
    };
  });
}

/** @param {string} userId @param {boolean} suspended */
export function setSuspended(userId, suspended) {
  return simulate(() => {
    const w = useWorldStore.getState();
    const user = w.users.find((u) => u.id === userId);
    if (user) w.upsertUser({ ...user, suspended });
    return true;
  });
}

/** @param {string} userId */
export function deleteUser(userId) {
  return simulate(() => {
    const w = useWorldStore.getState();
    w.patch({ users: w.users.filter((u) => u.id !== userId) });
    return true;
  });
}
