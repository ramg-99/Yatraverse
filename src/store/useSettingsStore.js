import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'en',
      currency: 'INR',
      privacyPublicProfile: false,
      compareIds: [],
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setPrivacy: (privacyPublicProfile) => set({ privacyPublicProfile }),
      toggleCompare: (id) => {
        const cur = get().compareIds;
        if (cur.includes(id)) set({ compareIds: cur.filter((x) => x !== id) });
        else if (cur.length < 3) set({ compareIds: [...cur, id] });
      },
      clearCompare: () => set({ compareIds: [] }),
    }),
    { name: 'yatraverse-settings' },
  ),
);
