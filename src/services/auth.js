import { simulate } from '@/lib/simulate.js';
import { uid } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function login(email, password) {
  return simulate(() => {
    const user = useWorldStore.getState().users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Those credentials do not match any traveller.');
    if (user.suspended) throw new Error('This passport is paused. Contact the atlas keeper.');
    useAuthStore.getState().setUser(user);
    return user;
  }, { failRate: 0.02 });
}

/** @returns {Promise<import('@/data/schema.js').User>} */
export async function loginDemo() {
  return login('demo@yatraverse.app', 'demo1234');
}

/**
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<import('@/data/schema.js').User>}
 */
export async function signup(payload) {
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
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setPersonaDone(false);
    return user;
  }, { failRate: 0.03 });
}

/** @param {string} _email */
export async function forgotPassword(_email) {
  return simulate({ sent: true }, { failRate: 0.02 });
}

export function logout() {
  useAuthStore.getState().logout();
}
