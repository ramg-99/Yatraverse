import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeed } from '@/data/seed.js';
import { uid } from '@/lib/utils.js';

const seed = createSeed();

export const useWorldStore = create(
  persist(
    (set, get) => ({
      ...seed,
      resetDemo: () => set(createSeed()),
      upsertUser: (user) =>
        set((s) => {
          const i = s.users.findIndex((u) => u.id === user.id);
          const users = [...s.users];
          if (i >= 0) users[i] = { ...users[i], ...user };
          else users.push(user);
          return { users };
        }),
      setTrips: (trips) => set({ trips }),
      setStops: (stops) => set({ stops }),
      setStopActivities: (stopActivities) => set({ stopActivities }),
      setExpenses: (expenses) => set({ expenses }),
      setSaved: (savedDestinations) => set({ savedDestinations }),
      setComments: (comments) => set({ comments }),
      chatOpen: false,
      setChatOpen: (chatOpen) => set({ chatOpen }),
      toggleChatOpen: () => set((s) => ({ chatOpen: !s.chatOpen })),
      setChat: (chat) => set({ chat }),
      setPacking: (packing) => set({ packing }),
      setDocuments: (documents) => set({ documents }),
      patch: (partial) => set(partial),
      newId: uid,
      getCity: (id) => get().cities.find((c) => c.id === id),
      getTrip: (id) => get().trips.find((t) => t.id === id),
      tripStops: (tripId) =>
        get()
          .stops.filter((s) => s.trip_id === tripId)
          .sort((a, b) => a.order_index - b.order_index),
    }),
    { name: 'yatraverse-world' },
  ),
);
