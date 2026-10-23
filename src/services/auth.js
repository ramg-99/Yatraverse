import { uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { apiRequest } from '@/lib/api.js';
import { supabase } from '@/lib/supabase.js';

/**
 * Normalizes Supabase User into Yatraverse User shape
 */
function toAppUser(sbUser) {
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Traveler',
    avatarUrl: sbUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
    role: sbUser.email === 'admin@yatraverse.app' ? 'admin' : (sbUser.app_metadata?.role || 'user'),
  };
}

/**
 * Logs in via Supabase Auth.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error(
        'Email not confirmed yet. Please verify your email inbox, or in your Supabase Dashboard go to Authentication -> Providers -> Email and toggle OFF "Confirm email" for instant login.'
      );
    }
    throw new Error(error.message || 'Invalid email or password.');
  }

  if (!data?.user) {
    throw new Error('Login failed. Please check your credentials.');
  }

  const user = toAppUser(data.user);
  const token = data.session?.access_token;

  useAuthStore.getState().setAuth({ user, token });
  useWorldStore.getState().upsertUser(user);

  // Sync profile into PostgreSQL User table
  apiRequest('/auth/sync', {
    method: 'POST',
    body: JSON.stringify(user),
  }).catch(() => {});

  return user;
}

/**
 * Registers new user via Supabase Auth.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ user: import('@/data/schema.js').User, needsConfirmation: boolean, message?: string }>}
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

  const sbUser = data?.user;
  if (!sbUser) {
    throw new Error('Registration failed. Please try again.');
  }

  const user = toAppUser(sbUser);
  const token = data.session?.access_token;

  // If Supabase returned an active session (Confirm email is disabled)
  if (token) {
    useAuthStore.getState().setAuth({ user, token });
    useAuthStore.getState().setPersonaDone(false);
    useWorldStore.getState().upsertUser(user);

    // Sync into PostgreSQL User table
    apiRequest('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(user),
    }).catch(() => {});

    return { user, needsConfirmation: false };
  }

  // If Supabase requires email verification before session is issued
  return {
    user,
    needsConfirmation: true,
    message: 'Account created! Please check your email inbox to confirm your account (or disable "Confirm email" in your Supabase Dashboard to log in immediately).',
  };
}

/**
 * Updates user profile via backend API or Supabase user metadata.
 */
export async function updateProfile(patch) {
  await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  const current = useAuthStore.getState().user;
  const updated = { ...current, ...patch };
  useAuthStore.getState().setUser(updated);
  useWorldStore.getState().upsertUser(updated);
  return updated;
}

/**
 * Deletes user account.
 */
export async function deleteAccount() {
  await apiRequest('/auth/account', { method: 'DELETE' });
  await supabase.auth.signOut().catch(() => {});
  const u = useAuthStore.getState().user;
  if (u) {
    const w = useWorldStore.getState();
    w.patch({ users: w.users.filter((x) => x.id !== u.id) });
  }
  useAuthStore.getState().logout();
  return true;
}

export async function forgotPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return { sent: true };
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
    const user = toAppUser(data.user);
    useAuthStore.getState().setAuth({ user, token: data.session?.access_token });
    useWorldStore.getState().upsertUser(user);
    return user;
  }
}

export function logout() {
  supabase.auth.signOut().catch(() => {});
  useAuthStore.getState().logout();
}
