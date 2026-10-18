import { simulate } from '@/lib/simulate.js';
import { useWorldStore } from '@/store/useWorldStore.js';

/** @returns {Promise<import('@/data/schema.js').City[]>} */
export function listCities() {
  return simulate(() => useWorldStore.getState().cities, { failRate: 0.04 });
}

/** @returns {Promise<import('@/data/schema.js').Activity[]>} */
export function listActivities() {
  return simulate(() => useWorldStore.getState().activities, { failRate: 0.04 });
}

/**
 * @param {string} userId
 * @param {string} cityId
 */
export async function toggleSaved(userId, cityId) {
  return simulate(() => {
    const { savedDestinations, setSaved } = useWorldStore.getState();
    const exists = savedDestinations.some((s) => s.user_id === userId && s.city_id === cityId);
    setSaved(
      exists
        ? savedDestinations.filter((s) => !(s.user_id === userId && s.city_id === cityId))
        : [...savedDestinations, { user_id: userId, city_id: cityId }],
    );
    return !exists;
  });
}
