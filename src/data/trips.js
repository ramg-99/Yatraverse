/** @type {import('./schema.js').Trip[]} */
export const trips = [
  {
    id: 't_spice',
    user_id: 'u_demo',
    name: 'Spice Route Homecoming',
    description: 'West coast India: markets, monsoon memory, and slow trains between spice ports.',
    start_date: '2026-12-12',
    end_date: '2026-12-22',
    cover_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400',
    is_public: true,
    share_slug: 'spice-route-homecoming',
    created_at: '2026-09-01T12:00:00.000Z',
    budget_cap: 185000,
    collaborators: ['u_aisha'],
    notes: 'Keep one empty evening in Fort Kochi for the Chinese nets.',
  },
  {
    id: 't_neon',
    user_id: 'u_demo',
    name: 'Neon Pacific',
    description: 'Tokyo to Seoul to Bangkok — dense nights, precise trains, and a budget already glowing red.',
    start_date: '2026-11-02',
    end_date: '2026-11-14',
    cover_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400',
    is_public: false,
    share_slug: 'neon-pacific',
    created_at: '2026-08-18T12:00:00.000Z',
    budget_cap: 210000,
    collaborators: [],
    notes: 'Need cheaper stays in Shinjuku or the fuel gauge stays in the red.',
  },
  {
    id: 't_atl',
    user_id: 'u_demo',
    name: 'Atlantic Arc',
    description: 'Lisbon hills into Barcelona mosaics, then a Paris coda of bakeries and bookstalls.',
    start_date: '2027-04-03',
    end_date: '2027-04-16',
    cover_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1400',
    is_public: false,
    share_slug: 'atlantic-arc',
    created_at: '2026-09-20T12:00:00.000Z',
    budget_cap: 320000,
    collaborators: ['u_aisha'],
    notes: 'Buy the tram 28 ticket the night before.',
  },
  {
    id: 't_sahara',
    user_id: 'u_aisha',
    name: 'Ochre & Ocean',
    description: 'Jaipur courtyards, Marrakech drums, Cape Town cliffs — three latitudes, one warm palette.',
    start_date: '2026-10-20',
    end_date: '2026-11-04',
    cover_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400',
    is_public: false,
    share_slug: 'ochre-ocean',
    created_at: '2026-07-11T12:00:00.000Z',
    budget_cap: 260000,
    collaborators: ['u_demo'],
    notes: 'Pack a light scarf for the medina and a wind layer for Table Mountain.',
  },
];

/** @type {import('./schema.js').Stop[]} */
export const stops = [
  { id: 's1', trip_id: 't_spice', city_id: 'c_mum', order_index: 0, start_date: '2026-12-12', end_date: '2026-12-15' },
  { id: 's2', trip_id: 't_spice', city_id: 'c_goa', order_index: 1, start_date: '2026-12-15', end_date: '2026-12-19' },
  { id: 's3', trip_id: 't_spice', city_id: 'c_koc', order_index: 2, start_date: '2026-12-19', end_date: '2026-12-22' },
  { id: 's4', trip_id: 't_neon', city_id: 'c_tyo', order_index: 0, start_date: '2026-11-02', end_date: '2026-11-07' },
  { id: 's5', trip_id: 't_neon', city_id: 'c_sel', order_index: 1, start_date: '2026-11-07', end_date: '2026-11-10' },
  { id: 's6', trip_id: 't_neon', city_id: 'c_bkk', order_index: 2, start_date: '2026-11-10', end_date: '2026-11-14' },
  { id: 's7', trip_id: 't_atl', city_id: 'c_lis', order_index: 0, start_date: '2027-04-03', end_date: '2027-04-08' },
  { id: 's8', trip_id: 't_atl', city_id: 'c_bcn', order_index: 1, start_date: '2027-04-08', end_date: '2027-04-12' },
  { id: 's9', trip_id: 't_atl', city_id: 'c_par', order_index: 2, start_date: '2027-04-12', end_date: '2027-04-16' },
  { id: 's10', trip_id: 't_sahara', city_id: 'c_jai', order_index: 0, start_date: '2026-10-20', end_date: '2026-10-25' },
  { id: 's11', trip_id: 't_sahara', city_id: 'c_rak', order_index: 1, start_date: '2026-10-25', end_date: '2026-10-30' },
  { id: 's12', trip_id: 't_sahara', city_id: 'c_cpt', order_index: 2, start_date: '2026-10-30', end_date: '2026-11-04' },
];

function sa(id, stop_id, activity_id, day_date, start_time, order_index, cost_override) {
  return { id, stop_id, activity_id, day_date, start_time, order_index, cost_override, votes: 2, notes: '' };
}

/** @type {import('./schema.js').StopActivity[]} */
export const stopActivities = [
  sa('sa1', 's1', 'a_c_mum_food_0', '2026-12-12', '19:00', 0),
  sa('sa2', 's1', 'a_c_mum_sightseeing_0', '2026-12-13', '07:30', 0),
  sa('sa3', 's1', 'a_c_mum_nightlife_1', '2026-12-13', '21:00', 1),
  sa('sa4', 's2', 'a_c_goa_wellness_0', '2026-12-16', '08:00', 0),
  sa('sa5', 's2', 'a_c_goa_food_1', '2026-12-16', '13:00', 1),
  sa('sa6', 's2', 'a_c_goa_adventure_1', '2026-12-17', '09:00', 0),
  sa('sa7', 's3', 'a_c_koc_culture_0', '2026-12-20', '10:00', 0),
  sa('sa8', 's3', 'a_c_koc_food_0', '2026-12-20', '18:30', 1),
  sa('sa9', 's4', 'a_c_tyo_nightlife_0', '2026-11-03', '20:00', 0, 9000),
  sa('sa10', 's4', 'a_c_tyo_food_1', '2026-11-04', '12:00', 0, 12000),
  sa('sa11', 's4', 'a_c_tyo_sightseeing_1', '2026-11-05', '06:30', 0),
  sa('sa12', 's5', 'a_c_sel_culture_1', '2026-11-08', '11:00', 0),
  sa('sa13', 's5', 'a_c_sel_nightlife_1', '2026-11-08', '21:30', 1),
  sa('sa14', 's6', 'a_c_bkk_food_0', '2026-11-11', '18:00', 0),
  sa('sa15', 's6', 'a_c_bkk_wellness_1', '2026-11-12', '07:00', 0),
  sa('sa16', 's7', 'a_c_lis_sightseeing_0', '2027-04-04', '09:00', 0),
  sa('sa17', 's7', 'a_c_lis_food_1', '2027-04-04', '13:30', 1),
  sa('sa18', 's8', 'a_c_bcn_culture_0', '2027-04-09', '10:00', 0),
  sa('sa19', 's8', 'a_c_bcn_nightlife_0', '2027-04-10', '20:00', 0),
  sa('sa20', 's9', 'a_c_par_food_1', '2027-04-13', '12:30', 0),
  sa('sa21', 's9', 'a_c_par_sightseeing_1', '2027-04-14', '08:00', 0),
  sa('sa22', 's10', 'a_c_jai_culture_0', '2026-10-21', '09:30', 0),
  sa('sa23', 's11', 'a_c_rak_food_0', '2026-10-26', '19:00', 0),
  sa('sa24', 's12', 'a_c_cpt_adventure_0', '2026-11-01', '06:00', 0),
];

/** @type {import('./schema.js').Expense[]} */
export const expenses = [
  { id: 'e1', trip_id: 't_spice', category: 'transport', amount: 28000, date: '2026-12-12' },
  { id: 'e2', trip_id: 't_spice', category: 'stay', amount: 54000, date: '2026-12-12' },
  { id: 'e3', trip_id: 't_spice', category: 'activities', amount: 18000, date: '2026-12-13' },
  { id: 'e4', trip_id: 't_spice', category: 'meals', amount: 22000, date: '2026-12-14' },
  { id: 'e5', trip_id: 't_neon', category: 'transport', amount: 72000, date: '2026-11-02' },
  { id: 'e6', trip_id: 't_neon', category: 'stay', amount: 98000, date: '2026-11-02' },
  { id: 'e7', trip_id: 't_neon', category: 'activities', amount: 41000, date: '2026-11-04' },
  { id: 'e8', trip_id: 't_neon', category: 'meals', amount: 36000, date: '2026-11-05' },
  { id: 'e9', trip_id: 't_atl', category: 'transport', amount: 64000, date: '2027-04-03' },
  { id: 'e10', trip_id: 't_atl', category: 'stay', amount: 88000, date: '2027-04-03' },
  { id: 'e11', trip_id: 't_atl', category: 'meals', amount: 30000, date: '2027-04-05' },
  { id: 'e12', trip_id: 't_sahara', category: 'transport', amount: 58000, date: '2026-10-20' },
  { id: 'e13', trip_id: 't_sahara', category: 'stay', amount: 62000, date: '2026-10-20' },
  { id: 'e14', trip_id: 't_sahara', category: 'activities', amount: 24000, date: '2026-10-22' },
];

/** @type {import('./schema.js').SavedDestination[]} */
export const savedDestinations = [
  { user_id: 'u_demo', city_id: 'c_kyo' },
  { user_id: 'u_demo', city_id: 'c_lis' },
  { user_id: 'u_demo', city_id: 'c_cpt' },
  { user_id: 'u_aisha', city_id: 'c_syd' },
];
