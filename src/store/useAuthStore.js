import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      personaDone: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuth: ({ user, token }) => set({ user, token: token !== undefined ? token : get().token }),
      setPersonaDone: (personaDone) => set({ personaDone }),
      logout: () => set({ user: null, token: null }),
      getToken: () => get().token,
    }),
    { name: 'yatraverse-auth' },
  ),
);

