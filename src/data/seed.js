import { users } from './users.js';
import { cities } from './cities.js';
import { activities } from './activities.js';
import { trips, stops, stopActivities, expenses, savedDestinations } from './trips.js';

export function createSeed() {
  return {
    users: structuredClone(users),
    cities: structuredClone(cities),
    activities: structuredClone(activities),
    trips: structuredClone(trips),
    stops: structuredClone(stops),
    stopActivities: structuredClone(stopActivities),
    expenses: structuredClone(expenses),
    savedDestinations: structuredClone(savedDestinations),
    badges: [
      { id: 'b_cities5', label: '5 Cities', hint: 'Plan five cities in one universe' },
      { id: 'b_budget', label: 'Budget Master', hint: 'Keep a trip under cap' },
      { id: 'b_asia', label: 'Asia Stamp', hint: 'Plan an Asian city' },
      { id: 'b_public', label: 'Constellation Publisher', hint: 'Share a public itinerary' },
    ],
    comments: [
      { id: 'cm1', stop_id: 's2', user_id: 'u_aisha', text: 'Let’s add a sunset sail if the tide agrees.', created_at: '2026-09-12T10:00:00.000Z' },
    ],
    packing: {},
    documents: {},
    chat: [],
  };
}
