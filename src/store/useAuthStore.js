import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Clean legacy demo/JWT auth from browser storage immediately
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('yatraverse-auth');
    localStorage.removeItem('sb-demo-auth');
  } catch {}
}

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
      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('yatraverse-auth-session');
            localStorage.removeItem('yatraverse-auth');
          } catch {}
        }
      },
      getToken: () => get().token,
    }),
    {
      name: 'yatraverse-auth-session', // New key to invalidate all previous sessions
      onRehydrateStorage: () => (state) => {
        // Discard any previous demo or mock account on rehydration
        if (state?.user?.id === 'u_aarav' || state?.user?.id === 'u_demo' || state?.token?.startsWith('demo-')) {
          state.user = null;
          state.token = null;
        }
      },
    },
  ),
);
