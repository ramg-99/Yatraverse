import { simulate } from '@/lib/simulate.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { apiRequest, isBackendAvailable, normalizeCity, normalizeActivity } from '@/lib/api.js';

/** @returns {Promise<import('@/data/schema.js').City[]>} */
export async function listCities(params = {}) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.region) query.set('region', params.region);
      const data = await apiRequest(`/catalog/cities?${query.toString()}`);
      const cities = (data || []).map(normalizeCity);
      if (cities.length) {
        useWorldStore.getState().patch({ cities });
      }
      return cities;
    } catch {
      // fallback
    }
  }
  return simulate(() => useWorldStore.getState().cities, { failRate: 0.01 });
}

/** @returns {Promise<import('@/data/schema.js').Activity[]>} */
export async function listActivities(params = {}) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const query = new URLSearchParams();
      if (params.cityId) query.set('cityId', params.cityId);
      if (params.type) query.set('type', params.type);
      if (params.maxCost) query.set('maxCost', params.maxCost);
      if (params.maxDuration) query.set('maxDuration', params.maxDuration);
      const data = await apiRequest(`/catalog/activities?${query.toString()}`);
      const activities = (data || []).map(normalizeActivity);
      if (activities.length) {
        useWorldStore.getState().patch({ activities });
      }
      return activities;
    } catch {
      // fallback
    }
  }
  return simulate(() => useWorldStore.getState().activities, { failRate: 0.01 });
}

/**
 * @param {string} userId
 * @param {string} cityId
 */
export async function toggleSaved(userId, cityId) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const res = await apiRequest('/catalog/saved', {
        method: 'POST',
        body: JSON.stringify({ cityId }),
      });
      const { savedDestinations, setSaved } = useWorldStore.getState();
      const next = res.saved
        ? [...savedDestinations, { user_id: userId, city_id: cityId }]
        : savedDestinations.filter((s) => !(s.user_id === userId && s.city_id === cityId));
      setSaved(next);
      return res.saved;
    } catch {
      // fallback
    }
  }
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
