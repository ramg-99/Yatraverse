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
      tripMembers: seed.tripMembers || [],
      votes: seed.votes || [],
      expenseSplits: seed.expenseSplits || [],
      setTripMembers: (tripMembers) => set({ tripMembers }),
      setVotes: (votes) => set({ votes }),
      setExpenseSplits: (expenseSplits) => set({ expenseSplits }),

      // Cast a vote (+1 for 👍, -1 for 👎, or toggle off if clicked same)
      castVote: (tripId, stopActivityId, activityId, userId, value) =>
        set((s) => {
          const currentVotes = s.votes || [];
          const existingIdx = currentVotes.findIndex(
            (v) =>
              v.trip_id === tripId &&
              ((stopActivityId && v.stop_activity_id === stopActivityId) ||
                (!stopActivityId && v.activity_id === activityId)) &&
              v.user_id === userId
          );

          let updated;
          if (existingIdx >= 0) {
            if (currentVotes[existingIdx].value === value) {
              // Toggle off
              updated = currentVotes.filter((_, idx) => idx !== existingIdx);
            } else {
              // Change vote
              updated = [...currentVotes];
              updated[existingIdx] = { ...updated[existingIdx], value };
            }
          } else {
            // New vote
            updated = [
              ...currentVotes,
              {
                id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                trip_id: tripId,
                stop_activity_id: stopActivityId || null,
                activity_id: activityId,
                user_id: userId,
                value,
              },
            ];
          }
          return { votes: updated };
        }),

      // Add a member to trip
      addMemberToTrip: (tripId, userId, role = 'member') =>
        set((s) => {
          const members = s.tripMembers || [];
          if (members.some((m) => m.trip_id === tripId && m.user_id === userId)) {
            return {};
          }
          const newMember = {
            id: `tm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            trip_id: tripId,
            user_id: userId,
            role,
            joined_at: new Date().toISOString(),
          };
          return { tripMembers: [...members, newMember] };
        }),

      // Add group expense with split shares
      addExpenseWithSplits: ({ tripId, category, amount, paidBy, stopActivityId, notes, date, memberIds }) =>
        set((s) => {
          const expId = `eg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          const numAmount = Number(amount) || 0;
          const newExpense = {
            id: expId,
            trip_id: tripId,
            category: category || 'activities',
            amount: numAmount,
            paid_by: paidBy,
            stop_activity_id: stopActivityId || null,
            notes: notes || 'Group shared expense',
            date: date || new Date().toISOString().split('T')[0],
          };

          const targetMembers = memberIds && memberIds.length > 0
            ? memberIds
            : (s.tripMembers || []).filter((m) => m.trip_id === tripId).map((m) => m.user_id);

          const count = Math.max(1, targetMembers.length);
          const shareAmount = Math.round((numAmount / count) * 100) / 100;

          const newSplits = targetMembers.map((uid) => ({
            id: `sp_${Date.now()}_${uid}_${Math.random().toString(36).slice(2, 5)}`,
            expense_id: expId,
            user_id: uid,
            share: shareAmount,
            is_settled: uid === paidBy, // Payer's own share is settled immediately
          }));

          return {
            expenses: [...s.expenses, newExpense],
            expenseSplits: [...(s.expenseSplits || []), ...newSplits],
          };
        }),

      // Settle all debts between a debtor (fromUserId) and creditor (toUserId)
      settleDebtBetween: (tripId, fromUserId, toUserId) =>
        set((s) => {
          // Find expenses paid by toUserId in this trip
          const toExpenses = s.expenses.filter((e) => e.trip_id === tripId && e.paid_by === toUserId).map((e) => e.id);
          const updatedSplits = (s.expenseSplits || []).map((sp) => {
            if (toExpenses.includes(sp.expense_id) && sp.user_id === fromUserId) {
              return { ...sp, is_settled: true };
            }
            return sp;
          });
          return { expenseSplits: updatedSplits };
        }),

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
