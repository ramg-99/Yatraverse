import { cities } from './cities.js';

const TEMPLATES = {
  sightseeing: [
    ['Old quarter walk', 'Lanterns, stories, and a skyline earned on foot.'],
    ['Iconic lookout', 'The postcard view, minus the postcard queue if you go early.'],
  ],
  food: [
    ['Night market graze', 'Follow steam, spice, and the longest local queue.'],
    ['Chef’s table lunch', 'A slow midday that maps the city’s pantry.'],
  ],
  adventure: [
    ['Dawn trail', 'Hills or harbour paths before the city clocks in.'],
    ['Water hour', 'Kayak, ferry, or surf — whichever the coast allows.'],
  ],
  culture: [
    ['Museum morning', 'One collection, no rushing, a café after the last room.'],
    ['Craft workshop', 'Leave with a souvenir your hands actually made.'],
  ],
  nightlife: [
    ['Jazz & vermouth', 'A small room, a long pour, a playlist older than the street.'],
    ['Rooftop orbit', 'City lights as a second constellation.'],
  ],
  wellness: [
    ['Thermal pause', 'Steam, silence, and a reset between cities.'],
    ['Sunrise stretch', 'Park grass, harbour breeze, or temple courtyard.'],
  ],
};

const COSTS = { sightseeing: 1800, food: 2200, adventure: 4500, culture: 1600, nightlife: 2800, wellness: 3200 };
const DURS = { sightseeing: 180, food: 120, adventure: 240, culture: 150, nightlife: 180, wellness: 90 };
const IMGS = {
  sightseeing: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
  culture: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
  nightlife: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  wellness: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
};

/** @type {import('./schema.js').Activity[]} */
export const activities = cities.flatMap((city, ci) =>
  Object.entries(TEMPLATES).flatMap(([type, pairs], ti) =>
    pairs.map(([title, blurb], pi) => ({
      id: `a_${city.id}_${type}_${pi}`,
      city_id: city.id,
      name: `${city.name} ${title}`,
      type,
      cost: Math.round(COSTS[type] * (0.7 + city.cost_index * 0.12) + ci * 20 + ti * 15),
      duration_min: DURS[type] + pi * 15,
      image: IMGS[type],
      description: `${blurb} In ${city.name}, this sits close to the ${city.best_season} sweet spot.`,
      rating: 4.2 + ((ci + ti + pi) % 8) * 0.1,
    })),
  ),
);
