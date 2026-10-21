import { cities } from '@/data/cities.js';
import { apiRequest, isBackendAvailable } from '@/lib/api.js';

async function* typewrite(text, chunk = 16) {
  for (let i = 0; i < text.length; i += chunk) {
    yield text.slice(i, i + chunk);
    await new Promise((r) => setTimeout(r, 20));
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
      ` ${days} days · ₹${(input.budget || 200000).toLocaleString()} budget cap for ${input.travelers || 2} travellers.`,
      `\n\nDay 1–3: Arrive into ${picks[0]?.name}, unpack slowly. Evening street food walk near the historic quarter.`,
      `\nDay 4–5: Travel to ${picks[1]?.name || picks[0]?.name}. Golden hour walk and local museum or market stroll.`,
      `\nDay 6–${days}: Transition to ${picks[2]?.name || picks[0]?.name}. Unwind at sunset viewpoints and night markets.`,
      `\n\nTip: Avoid midday transfer delays by taking early morning expresses.`,
    ];
    yield* typewrite(lines.join(''));
  },

  async optimizeTrip(trip) {
    return [
      {
        id: 'opt1',
        kind: 'cost',
        title: 'Trim stay tier by 1 notch',
        detail: 'Switching 2 nights from luxury to boutique frees ~₹14,000 for dining.',
      },
      {
        id: 'opt2',
        kind: 'geo',
        title: 'Eliminate zig-zag in route',
        detail: 'Reverse stop order to reduce travel time by ~3.5 hours.',
      },
      {
        id: 'opt3',
        kind: 'pace',
        title: 'Add a buffer afternoon',
        detail: 'Day 4 has 4 activities back-to-back. Space them out for breath.',
      },
      {
        id: 'opt4',
        kind: 'swap',
        title: 'Local secret swap',
        detail: 'Replace crowded viewpoint with rooftop tea pavilion at dusk.',
      },
    ];
  },

  async *chat(messages, context) {
    const last = (messages[messages.length - 1]?.content || '').toLowerCase();
    const trip = context?.trip;
    const reply = last.includes('food')
      ? `For ${trip?.name || 'this trip'}, chase local night markets first. Skip the tourist strip restaurants.`
      : last.includes('budget')
      ? `You have healthy headroom. Keep 15% in reserve for spontaneous rail hops.`
      : `I've mapped the constellation for ${trip?.name || 'your journey'}. What shall we tweak next?`;
    yield* typewrite(reply);
  },
};

/**
 * Hybrid AI Provider that calls the Express API backend,
 * streaming the response via typewriter generator.
 */
export const HybridAIProvider = {
  async *generateItinerary(input) {
    const online = await isBackendAvailable();
    if (online) {
      try {
        const res = await apiRequest('/ai/generate', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        if (res?.text) {
          yield* typewrite(res.text);
          return;
        }
      } catch {
        // Fall back to MockAIProvider
      }
    }
    yield* MockAIProvider.generateItinerary(input);
  },

  async optimizeTrip(trip) {
    const online = await isBackendAvailable();
    if (online) {
      try {
        const suggestions = await apiRequest('/ai/optimize', {
          method: 'POST',
          body: JSON.stringify({ trip }),
        });
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return suggestions;
        }
      } catch {
        // Fall back
      }
    }
    return MockAIProvider.optimizeTrip(trip);
  },

  async *chat(messages, context) {
    const online = await isBackendAvailable();
    if (online) {
      try {
        const res = await apiRequest('/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages,
            tripName: context?.trip?.name,
          }),
        });
        if (res?.reply) {
          yield* typewrite(res.reply);
          return;
        }
      } catch {
        // Fall back
      }
    }
    yield* MockAIProvider.chat(messages, context);
  },
};

/** @returns {import('@/data/schema.js').AIProvider} */
export function getAI() {
  return HybridAIProvider;
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
    c_sin: { label: 'Thunder 30°', hint: 'Shelter in indoor gardens' },
    c_par: { label: 'Mild 18°', hint: 'Ideal walking weather' },
    c_bcn: { label: 'Sunny 24°', hint: 'Light jacket for evening sea' },
    c_nyc: { label: 'Brisk 17°', hint: 'Avenue wind tunnels' },
    c_dxb: { label: 'Hot 35°', hint: 'Stay indoors midday' },
    c_syd: { label: 'Breezy 22°', hint: 'Ferry weather' },
  };
  return map[cityId] || { label: 'Fair 22°', hint: 'Good walking weather' };
}
