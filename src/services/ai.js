import { cities } from '@/data/cities.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { uid } from '@/lib/utils.js';

async function* typewrite(text, chunk = 18) {
  for (let i = 0; i < text.length; i += chunk) {
    yield text.slice(i, i + chunk);
    await new Promise((r) => setTimeout(r, 28));
  }
}

function pickCities(budget = 200000, interests = []) {
  const pool = [...cities].sort((a, b) => a.cost_index - b.cost_index);
  const cheap = budget < 180000;
  const chosen = (cheap ? pool.filter((c) => c.cost_index <= 3) : pool).slice(0, 8);
  const foodie = interests.includes('food');
  const order = foodie
    ? chosen.filter((c) => ['c_mum', 'c_bkk', 'c_lis', 'c_goa'].includes(c.id)).concat(chosen)
    : chosen;
  const uniq = [];
  order.forEach((c) => {
    if (!uniq.find((x) => x.id === c.id) && uniq.length < 3) uniq.push(c);
  });
  return uniq.length ? uniq : cities.slice(0, 3);
}

export const MockAIProvider = {
  /**
   * @param {{ prompt?: string, destination?: string, duration?: number, budget?: number, interests?: string[], travelers?: number }} input
   */
  async *generateItinerary(input) {
    const days = Number(input.duration) || 8;
    const picks = pickCities(input.budget, input.interests || []);
    const lines = [
      `Planning your universe around ${input.destination || picks.map((c) => c.name).join(', ')}.`,
      ` ${days} days · ₹${(input.budget || 200000).toLocaleString()} · ${input.travelers || 2} travellers.`,
      `\n\nConstellation: ${picks.map((c) => c.iata).join(' → ')}`,
      ...picks.map(
        (c, i) =>
          `\n\nDay ${i * 3 + 1}–${i * 3 + 3} · ${c.name}\n• ${c.name} Night market graze\n• ${c.name} Iconic lookout\n• ${c.name} Dawn trail`,
      ),
      `\n\nEstimated burn: ₹${Math.round((input.budget || 200000) * 0.82).toLocaleString()} (leave 18% as weather insurance).`,
    ];
    yield* typewrite(lines.join(''));
  },
  /**
   * @param {import('@/data/schema.js').Trip} trip
   * @returns {Promise<object[]>}
   */
  async optimizeTrip(trip) {
    await new Promise((r) => setTimeout(r, 600));
    const w = useWorldStore.getState();
    const tripStops = w.stops.filter((s) => s.trip_id === trip.id).sort((a, b) => a.order_index - b.order_index);
    const names = tripStops.map((s) => w.cities.find((c) => c.id === s.city_id)?.name);
    return [
      {
        id: uid('opt'),
        kind: 'cost',
        title: 'Trim stay spend 15%',
        detail: 'Swap two 5-star nights for boutique riads / business hotels. Same neighbourhoods.',
        before: 'Stay heavy',
        after: 'Boutique mix',
        health: 8,
      },
      {
        id: uid('opt'),
        kind: 'geo',
        title: 'Reorder by geography',
        detail: `Fly ${names.join(' → ')} as a tighter arc to cut backtracking.`,
        before: names.join(' → '),
        after: [...names].reverse().join(' → '),
        health: 12,
      },
      {
        id: uid('opt'),
        kind: 'pace',
        title: 'Balance busy days',
        detail: 'Move one nightlife block so no day holds more than two high-energy activities.',
        before: 'Stacked night + dawn',
        after: 'Dawn rest, night later',
        health: 10,
      },
      {
        id: uid('opt'),
        kind: 'swap',
        title: 'Swap by persona',
        detail: 'Replace a generic lookout with a market graze — better fit for a Midnight Foodie.',
        before: 'Iconic lookout',
        after: 'Night market graze',
        health: 7,
      },
    ];
  },
  /**
   * @param {import('@/data/schema.js').ChatMessage[]} messages
   * @param {{ trip?: object }} context
   */
  async *chat(messages, context) {
    const last = messages[messages.length - 1]?.content || '';
    const tripName = context?.trip?.name || 'your open atlas';
    const reply = last.toLowerCase().includes('food')
      ? `For ${tripName}, chase steam: night markets first, chef’s lunch on the quieter day, and keep one meal unplanned so the city can surprise you.`
      : last.toLowerCase().includes('budget')
        ? `${tripName} looks tight if stays stay five-star. Cap lodging at 40% and you still keep the aurora nights.`
        : `Reading ${tripName}. I can sketch a day, swap an activity, or pack a bag for the weather strip. Try “add a food stop” or “lighten day 2”.`;
    yield* typewrite(reply);
  },
};

export const LLMProvider = {
  async *generateItinerary(input) {
    const key = import.meta.env.VITE_AI_API_KEY;
    if (!key) {
      yield* MockAIProvider.generateItinerary(input);
      return;
    }
    yield 'LLMProvider is stubbed. Set a real endpoint to stream model tokens.';
  },
  async optimizeTrip(trip) {
    const key = import.meta.env.VITE_AI_API_KEY;
    if (!key) return MockAIProvider.optimizeTrip(trip);
    return MockAIProvider.optimizeTrip(trip);
  },
  async *chat(messages, context) {
    const key = import.meta.env.VITE_AI_API_KEY;
    if (!key) {
      yield* MockAIProvider.chat(messages, context);
      return;
    }
    yield 'LLM chat stub — wire your vendor here.';
  },
};

/** @returns {import('@/data/schema.js').AIProvider} */
export function getAI() {
  return import.meta.env.VITE_AI_API_KEY ? LLMProvider : MockAIProvider;
}

/** Mock weather by city id */
export function weatherFor(cityId) {
  const map = {
    c_mum: { label: 'Haze 31°', hint: 'Sea breeze after 5pm' },
    c_goa: { label: 'Clear 29°', hint: 'UV high at noon' },
    c_koc: { label: 'Shower 28°', hint: 'Pack a light rain layer' },
    c_tyo: { label: 'Crisp 16°', hint: 'Layer for metro draughts' },
    c_sel: { label: 'Cool 12°', hint: 'Wind on the river' },
    c_bkk: { label: 'Humid 33°', hint: 'Hydrate between sois' },
    c_lis: { label: 'Bright 19°', hint: 'Hills, wear grip' },
    c_jai: { label: 'Dry 27°', hint: 'Dust at dusk' },
    c_rak: { label: 'Warm 26°', hint: 'Medina shade' },
    c_cpt: { label: 'Wind 18°', hint: 'Cable car may pause' },
  };
  return map[cityId] || { label: 'Fair 22°', hint: 'Good walking weather' };
}
