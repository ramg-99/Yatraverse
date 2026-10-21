import { useAuthStore } from '@/store/useAuthStore.js';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let serverOnlineCache = null;
let lastHealthCheck = 0;

/**
 * Checks if the backend server is reachable. Cached for 15 seconds.
 */
export async function isBackendAvailable() {
  const now = Date.now();
  if (serverOnlineCache !== null && now - lastHealthCheck < 15000) {
    return serverOnlineCache;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timer);
    serverOnlineCache = res.ok;
    lastHealthCheck = now;
    return serverOnlineCache;
  } catch {
    serverOnlineCache = false;
    lastHealthCheck = now;
    return false;
  }
}

/**
 * Normalizes City object for dual camelCase & snake_case compatibility.
 */
export function normalizeCity(c) {
  if (!c) return null;
  return {
    ...c,
    cost_index: c.costIndex ?? c.cost_index ?? 3,
    costIndex: c.costIndex ?? c.cost_index ?? 3,
    best_season: c.bestSeason || c.best_season || '',
    bestSeason: c.bestSeason || c.best_season || '',
  };
}

/**
 * Normalizes Activity object for dual camelCase & snake_case compatibility.
 */
export function normalizeActivity(a) {
  if (!a) return null;
  return {
    ...a,
    city_id: a.cityId || a.city_id,
    cityId: a.cityId || a.city_id,
    duration_min: a.durationMin ?? a.duration_min ?? 60,
    durationMin: a.durationMin ?? a.duration_min ?? 60,
  };
}

/**
 * Normalizes StopActivity object.
 */
export function normalizeStopActivity(sa) {
  if (!sa) return null;
  return {
    ...sa,
    stop_id: sa.stopId || sa.stop_id,
    stopId: sa.stopId || sa.stop_id,
    activity_id: sa.activityId || sa.activity_id,
    activityId: sa.activityId || sa.activity_id,
    day_date: sa.dayDate || sa.day_date,
    dayDate: sa.dayDate || sa.day_date,
    start_time: sa.startTime || sa.start_time || '10:00',
    startTime: sa.startTime || sa.start_time || '10:00',
    cost_override: sa.costOverride ?? sa.cost_override,
    costOverride: sa.costOverride ?? sa.cost_override,
    order_index: sa.orderIndex ?? sa.order_index ?? 0,
    orderIndex: sa.orderIndex ?? sa.order_index ?? 0,
    activity: sa.activity ? normalizeActivity(sa.activity) : undefined,
  };
}

/**
 * Normalizes Stop object.
 */
export function normalizeStop(s) {
  if (!s) return null;
  return {
    ...s,
    trip_id: s.tripId || s.trip_id,
    tripId: s.tripId || s.trip_id,
    city_id: s.cityId || s.city_id,
    cityId: s.cityId || s.city_id,
    start_date: s.startDate || s.start_date,
    startDate: s.startDate || s.start_date,
    end_date: s.endDate || s.end_date,
    endDate: s.endDate || s.end_date,
    order_index: s.orderIndex ?? s.order_index ?? 0,
    orderIndex: s.orderIndex ?? s.order_index ?? 0,
    city: s.city ? normalizeCity(s.city) : undefined,
    stopActivities: (s.stopActivities || []).map(normalizeStopActivity),
  };
}

/**
 * Normalizes Expense object.
 */
export function normalizeExpense(e) {
  if (!e) return null;
  return {
    ...e,
    trip_id: e.tripId || e.trip_id,
    tripId: e.tripId || e.trip_id,
  };
}

/**
 * Normalizes Trip object so all frontend pages work seamlessly.
 */
export function normalizeTrip(t) {
  if (!t) return null;
  const stops = (t.stops || []).map(normalizeStop);
  const expenses = (t.expenses || []).map(normalizeExpense);
  return {
    ...t,
    user_id: t.userId || t.user_id,
    userId: t.userId || t.user_id,
    start_date: t.startDate || t.start_date,
    startDate: t.startDate || t.start_date,
    end_date: t.endDate || t.end_date,
    endDate: t.endDate || t.end_date,
    cover_url: t.coverUrl || t.cover_url,
    coverUrl: t.coverUrl || t.cover_url,
    is_public: t.isPublic !== undefined ? t.isPublic : t.is_public ?? false,
    isPublic: t.isPublic !== undefined ? t.isPublic : t.is_public ?? false,
    share_slug: t.shareSlug || t.share_slug,
    shareSlug: t.shareSlug || t.share_slug,
    budget_cap: t.budgetCap ?? t.budget_cap ?? 200000,
    budgetCap: t.budgetCap ?? t.budget_cap ?? 200000,
    stops,
    expenses,
  };
}

/**
 * Normalizes User object.
 */
export function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    avatar: u.avatarUrl || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
    avatarUrl: u.avatarUrl || u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
    suspended: u.isSuspended !== undefined ? u.isSuspended : u.suspended ?? false,
    isSuspended: u.isSuspended !== undefined ? u.isSuspended : u.suspended ?? false,
    created_at: u.createdAt || u.created_at || new Date().toISOString(),
    createdAt: u.createdAt || u.created_at || new Date().toISOString(),
  };
}

/**
 * Central API request helper with auth token attachment & error parsing.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = useAuthStore.getState().getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errMessage = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) errMessage = data.error;
    } catch {
      // ignore
    }
    const err = new Error(errMessage);
    err.status = res.status;
    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}
