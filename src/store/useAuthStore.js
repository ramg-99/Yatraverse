import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      personaDone: false,
      setUser: (user) => set({ user }),
      setPersonaDone: (personaDone) => set({ personaDone }),
      logout: () => set({ user: null }),
    }),
    { name: 'yatraverse-auth' },
  ),
);
