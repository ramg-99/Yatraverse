import { simulate } from '@/lib/simulate.js';
import { uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { apiRequest, isBackendAvailable, normalizeUser } from '@/lib/api.js';
import { supabase } from '@/lib/supabase.js';


/**
 * Logs in via Supabase Auth (or demo credentials fallback).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function login(email, password) {
  // 1. Try Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || email.split('@')[0],
        avatarUrl: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
        role: email === 'admin@yatraverse.app' ? 'admin' : (data.user.app_metadata?.role || 'user'),
      };
      const token = data.session?.access_token || 'supabase-session';
      useAuthStore.getState().setAuth({ user, token });
      useWorldStore.getState().upsertUser(user);

      // Sync user profile to PostgreSQL User table
      apiRequest('/auth/sync', {
        method: 'POST',
        body: JSON.stringify(user),
      }).catch(() => {});

      return user;
    }
    if (error && !email.includes('demo@') && !email.includes('admin@')) {
      throw new Error(error.message);
    }
  } catch (err) {
    if (!email.includes('demo@') && !email.includes('admin@')) {
      throw err;
    }
  }

  // 2. Demo Evaluation Accounts
  if (email === 'demo@yatraverse.app' || email === 'admin@yatraverse.app') {
    const isAdmin = email === 'admin@yatraverse.app';
    const user = {
      id: isAdmin ? 'u_admin' : 'u_aarav',
      email,
      name: isAdmin ? 'Atlas Admin' : 'Aarav Mehta',
      role: isAdmin ? 'admin' : 'user',
      avatarUrl: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
    };
    useAuthStore.getState().setAuth({ user, token: 'demo-supabase-session-token' });
    useWorldStore.getState().upsertUser(user);
    return user;
  }

  throw new Error('Invalid email or password.');
}

/** @returns {Promise<import('@/data/schema.js').User>} */
export async function loginDemo() {
  return login('demo@yatraverse.app', 'demo1234');
}

/**
 * Registers new user via Supabase Auth and mirrors into PostgreSQL.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function signup(payload) {
  const { name, email, password } = payload;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, full_name: name },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const suUser = data?.user;
  const user = {
    id: suUser?.id || uid('u_'),
    email,
    name,
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
  };

  const token = data.session?.access_token || 'supabase-registered-token';
  useAuthStore.getState().setAuth({ user, token });
  useAuthStore.getState().setPersonaDone(false);
  useWorldStore.getState().upsertUser(user);

  // Sync to PostgreSQL user table
  apiRequest('/auth/sync', {
    method: 'POST',
    body: JSON.stringify(user),
  }).catch(() => {});

  return user;
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

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
  return data;
}

export async function sendPhoneOtp(phone) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) throw error;
  return data;
}

export async function verifyPhoneOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  if (data?.user) {
    const user = {
      id: data.user.id,
      email: data.user.email || `${phone.replace(/\D/g, '')}@phone.yatraverse.app`,
      name: data.user.user_metadata?.full_name || `Traveler ${phone.slice(-4)}`,
      role: 'user',
      avatarUrl: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
    };
    useAuthStore.getState().setAuth({ user, token: data.session?.access_token });
    useWorldStore.getState().upsertUser(user);
    return user;
  }
}

export function logout() {
  supabase.auth.signOut().catch(() => {});
  useAuthStore.getState().logout();
}

