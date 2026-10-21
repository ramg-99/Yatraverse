import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { users } from '@/data/users.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: users[0], // Default to demo traveller (Aarav Mehta) so all pages are immediately accessible
      token: 'demo-local-jwt-token',
      personaDone: true,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuth: ({ user, token }) => set({ user, token: token !== undefined ? token : get().token }),
      setPersonaDone: (personaDone) => set({ personaDone }),
      loginDemoTraveller: () => set({ user: users[0], token: 'demo-local-jwt-token' }),
      loginDemoAdmin: () => set({ user: users[2], token: 'demo-admin-jwt-token' }),
      logout: () => set({ user: null, token: null }),
      getToken: () => get().token,
    }),
    { name: 'yatraverse-auth' },
  ),
);

