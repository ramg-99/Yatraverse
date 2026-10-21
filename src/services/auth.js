import { simulate } from '@/lib/simulate.js';
import { uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { apiRequest, isBackendAvailable, normalizeUser } from '@/lib/api.js';

/**
 * Logs in via backend API or falls back to local simulation.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function login(email, password) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const user = normalizeUser(data.user);
      useAuthStore.getState().setAuth({ user, token: data.token });
      useWorldStore.getState().upsertUser(user);
      return user;
    } catch (err) {
      // If it's a 401/403/validation error from the server, throw it directly
      if (err.status && err.status < 500) {
        throw err;
      }
      // Otherwise fall through to local fallback
    }
  }

  // Fallback to local store simulation
  return simulate(() => {
    const user = useWorldStore.getState().users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Those credentials do not match any traveller.');
    if (user.suspended) throw new Error('This passport is paused. Contact the atlas keeper.');
    const normalized = normalizeUser(user);
    useAuthStore.getState().setAuth({ user: normalized, token: 'demo-local-jwt-token' });
    return normalized;
  }, { failRate: 0.01 });
}

/** @returns {Promise<import('@/data/schema.js').User>} */
export async function loginDemo() {
  return login('demo@yatraverse.app', 'demo1234');
}

/**
 * Registers new user via backend API or falls back to local simulation.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function signup(payload) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const user = normalizeUser(data.user);
      useAuthStore.getState().setAuth({ user, token: data.token });
      useAuthStore.getState().setPersonaDone(false);
      useWorldStore.getState().upsertUser(user);
      return user;
    } catch (err) {
      if (err.status && err.status < 500) {
        throw err;
      }
    }
  }

  return simulate(() => {
    const { users } = useWorldStore.getState();
    if (users.some((u) => u.email === payload.email)) throw new Error('That email already holds a passport.');
    const user = {
      id: uid('u'),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
      language: 'en',
      currency: 'INR',
      role: 'traveller',
      created_at: new Date().toISOString(),
      persona: null,
    };
    useWorldStore.getState().upsertUser(user);
    useAuthStore.getState().setAuth({ user, token: 'demo-local-jwt-token' });
    useAuthStore.getState().setPersonaDone(false);
    return user;
  }, { failRate: 0.01 });
}

/**
 * Updates user profile on backend API or local store.
 */
export async function updateProfile(patch) {
  const online = await isBackendAvailable();
  if (online) {
    try {
      const data = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      const user = normalizeUser(data);
      useAuthStore.getState().setUser(user);
      useWorldStore.getState().upsertUser(user);
      return user;
    } catch (err) {
      if (err.status && err.status < 500) throw err;
    }
  }

  return simulate(() => {
    const current = useAuthStore.getState().user;
    if (!current) throw new Error('Not authenticated');
    const updated = { ...current, ...patch };
    useAuthStore.getState().setUser(updated);
    useWorldStore.getState().upsertUser(updated);
    return updated;
  });
}

/**
 * Deletes user account on backend API or local store.
 */
export async function deleteAccount() {
  const online = await isBackendAvailable();
  if (online) {
    try {
      await apiRequest('/auth/account', { method: 'DELETE' });
    } catch (err) {
      if (err.status && err.status < 500) throw err;
    }
  }
  const u = useAuthStore.getState().user;
  if (u) {
    const w = useWorldStore.getState();
    w.patch({ users: w.users.filter((x) => x.id !== u.id) });
  }
  useAuthStore.getState().logout();
  return true;
}

/** @param {string} _email */
export async function forgotPassword(_email) {
  return simulate({ sent: true }, { failRate: 0.01 });
}

export function logout() {
  useAuthStore.getState().logout();
}
