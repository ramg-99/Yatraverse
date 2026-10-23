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
    is_public: true,
    share_slug: 'ochre-ocean',
    created_at: '2026-07-11T12:00:00.000Z',
    budget_cap: 260000,
    collaborators: ['u_demo'],
    notes: 'Pack a light scarf for the medina and a wind layer for Table Mountain.',
  },
  {
    id: 't_himalaya',
    user_id: 'u_demo',
    name: 'Himalayan & Coastal Odyssey 2026',
    description: 'From sacred river ghats and pink sandstones down to Arabian Sea palms and cliff sunsets.',
    start_date: '2026-11-15',
    end_date: '2026-11-26',
    cover_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1400',
    is_public: true,
    share_slug: 'himalayan-coastal-odyssey',
    created_at: '2026-09-25T10:00:00.000Z',
    budget_cap: 195000,
    collaborators: ['u_aisha', 'u_kabir'],
    notes: 'Book mountain guides ahead of time for high passes.',
  },
  {
    id: 't_golden',
    user_id: 'u_demo',
    name: 'Royal Rajasthan & Golden Triangle',
    description: 'Amber fortresses, bustling spice bazaars, and heritage havelis across the desert state.',
    start_date: '2026-12-01',
    end_date: '2026-12-10',
    cover_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1400',
    is_public: true,
    share_slug: 'royal-rajasthan-heritage',
    created_at: '2026-09-28T14:00:00.000Z',
    budget_cap: 160000,
    collaborators: ['u_maya'],
    notes: 'Sunset chai at Nahargarh Fort is unmissable.',
  },
  {
    id: 't_east',
    user_id: 'u_demo',
    name: 'Silk Route & Oriental Horizons',
    description: 'Futuristic glass sky-orchids, night ramen counters, and river ferry crossings across Asia.',
    start_date: '2027-01-10',
    end_date: '2027-01-22',
    cover_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1400',
    is_public: true,
    share_slug: 'silk-route-horizons',
    created_at: '2026-10-02T16:00:00.000Z',
    budget_cap: 280000,
    collaborators: ['u_aisha'],
    notes: 'Suica metro cards ready on digital wallet.',
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
  { id: 's13', trip_id: 't_himalaya', city_id: 'c_jai', order_index: 0, start_date: '2026-11-15', end_date: '2026-11-19' },
  { id: 's14', trip_id: 't_himalaya', city_id: 'c_mum', order_index: 1, start_date: '2026-11-19', end_date: '2026-11-23' },
  { id: 's15', trip_id: 't_himalaya', city_id: 'c_goa', order_index: 2, start_date: '2026-11-23', end_date: '2026-11-26' },
  { id: 's16', trip_id: 't_golden', city_id: 'c_jai', order_index: 0, start_date: '2026-12-01', end_date: '2026-12-06' },
  { id: 's17', trip_id: 't_golden', city_id: 'c_mum', order_index: 1, start_date: '2026-12-06', end_date: '2026-12-10' },
  { id: 's18', trip_id: 't_east', city_id: 'c_tyo', order_index: 0, start_date: '2027-01-10', end_date: '2027-01-15' },
  { id: 's19', trip_id: 't_east', city_id: 'c_sin', order_index: 1, start_date: '2027-01-15', end_date: '2027-01-18' },
  { id: 's20', trip_id: 't_east', city_id: 'c_bkk', order_index: 2, start_date: '2027-01-18', end_date: '2027-01-22' },
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
  sa('sa25', 's13', 'a_c_jai_sightseeing_0', '2026-11-16', '08:00', 0),
  sa('sa26', 's14', 'a_c_mum_sightseeing_0', '2026-11-20', '09:00', 0),
  sa('sa27', 's15', 'a_c_goa_wellness_0', '2026-11-24', '08:30', 0),
  sa('sa28', 's16', 'a_c_jai_food_0', '2026-12-02', '12:00', 0),
  sa('sa29', 's17', 'a_c_mum_food_0', '2026-12-07', '19:30', 0),
  sa('sa30', 's18', 'a_c_tyo_nightlife_0', '2027-01-11', '20:00', 0),
  sa('sa31', 's19', 'a_c_sin_sightseeing_0', '2027-01-16', '10:00', 0),
  sa('sa32', 's20', 'a_c_bkk_food_0', '2027-01-19', '18:30', 0),
];

/** @type {import('./schema.js').Expense[]} */
export const expenses = [
  { id: 'e1', trip_id: 't_spice', category: 'transport', amount: 28000, date: '2026-12-12', paid_by: 'u_demo', notes: 'Train tickets Mumbai to Goa' },
  { id: 'e2', trip_id: 't_spice', category: 'stay', amount: 54000, date: '2026-12-12', paid_by: 'u_demo', notes: 'Heritage Villa booking in Panaji' },
  { id: 'e3', trip_id: 't_spice', category: 'activities', amount: 6000, date: '2026-12-13', paid_by: 'u_demo', stop_activity_id: 'sa1', notes: 'Mumbai Street Food Tour (Group of 4)' },
  { id: 'e4', trip_id: 't_spice', category: 'meals', amount: 3600, date: '2026-12-14', paid_by: 'u_aisha', notes: 'Café Leopold Lunch & Cocktails' },
  { id: 'e4b', trip_id: 't_spice', category: 'activities', amount: 4800, date: '2026-12-16', paid_by: 'u_kabir', stop_activity_id: 'sa4', notes: 'Goa Sunrise Yoga & Ayurvedic Spa' },
  { id: 'e5', trip_id: 't_neon', category: 'transport', amount: 72000, date: '2026-11-02', paid_by: 'u_demo' },
  { id: 'e6', trip_id: 't_neon', category: 'stay', amount: 98000, date: '2026-11-02', paid_by: 'u_demo' },
  { id: 'e7', trip_id: 't_neon', category: 'activities', amount: 41000, date: '2026-11-04', paid_by: 'u_demo' },
  { id: 'e8', trip_id: 't_neon', category: 'meals', amount: 36000, date: '2026-11-05', paid_by: 'u_demo' },
  { id: 'e9', trip_id: 't_atl', category: 'transport', amount: 64000, date: '2027-04-03', paid_by: 'u_demo' },
  { id: 'e10', trip_id: 't_atl', category: 'stay', amount: 88000, date: '2027-04-03', paid_by: 'u_demo' },
  { id: 'e11', trip_id: 't_atl', category: 'meals', amount: 30000, date: '2027-04-05', paid_by: 'u_demo' },
  { id: 'e12', trip_id: 't_sahara', category: 'transport', amount: 58000, date: '2026-10-20', paid_by: 'u_aisha' },
  { id: 'e13', trip_id: 't_sahara', category: 'stay', amount: 62000, date: '2026-10-20', paid_by: 'u_aisha' },
  { id: 'e14', trip_id: 't_sahara', category: 'activities', amount: 24000, date: '2026-10-22', paid_by: 'u_demo' },
  { id: 'e15', trip_id: 't_himalaya', category: 'transport', amount: 32000, date: '2026-11-15', paid_by: 'u_demo' },
  { id: 'e16', trip_id: 't_himalaya', category: 'stay', amount: 68000, date: '2026-11-15', paid_by: 'u_demo' },
  { id: 'e17', trip_id: 't_himalaya', category: 'activities', amount: 28000, date: '2026-11-17', paid_by: 'u_aisha' },
  { id: 'e18', trip_id: 't_golden', category: 'transport', amount: 22000, date: '2026-12-01', paid_by: 'u_demo' },
  { id: 'e19', trip_id: 't_golden', category: 'stay', amount: 48000, date: '2026-12-01', paid_by: 'u_demo' },
  { id: 'e20', trip_id: 't_golden', category: 'meals', amount: 18000, date: '2026-12-03', paid_by: 'u_maya' },
  { id: 'e21', trip_id: 't_east', category: 'transport', amount: 82000, date: '2027-01-10', paid_by: 'u_demo' },
  { id: 'e22', trip_id: 't_east', category: 'stay', amount: 110000, date: '2027-01-10', paid_by: 'u_demo' },
  { id: 'e23', trip_id: 't_east', category: 'activities', amount: 45000, date: '2027-01-12', paid_by: 'u_aisha' },
];

/** Group members for collaborative trips */
export const tripMembers = [
  { id: 'tm1', trip_id: 't_spice', user_id: 'u_demo', role: 'owner', joined_at: '2026-09-01T12:00:00.000Z' },
  { id: 'tm2', trip_id: 't_spice', user_id: 'u_aisha', role: 'editor', joined_at: '2026-09-02T14:30:00.000Z' },
  { id: 'tm3', trip_id: 't_spice', user_id: 'u_kabir', role: 'member', joined_at: '2026-09-05T09:15:00.000Z' },
  { id: 'tm4', trip_id: 't_spice', user_id: 'u_maya', role: 'member', joined_at: '2026-09-07T11:45:00.000Z' },
  { id: 'tm5', trip_id: 't_neon', user_id: 'u_demo', role: 'owner', joined_at: '2026-08-18T12:00:00.000Z' },
  { id: 'tm6', trip_id: 't_neon', user_id: 'u_aisha', role: 'member', joined_at: '2026-08-20T10:00:00.000Z' },
];

/** Group Votes on itinerary activities (+1 = 👍, -1 = 👎) */
export const votes = [
  // sa1: Mumbai Food Walk -> Consensus Favorite! (+4)
  { id: 'v1', trip_id: 't_spice', stop_activity_id: 'sa1', activity_id: 'a_c_mum_food_0', user_id: 'u_demo', value: 1 },
  { id: 'v2', trip_id: 't_spice', stop_activity_id: 'sa1', activity_id: 'a_c_mum_food_0', user_id: 'u_aisha', value: 1 },
  { id: 'v3', trip_id: 't_spice', stop_activity_id: 'sa1', activity_id: 'a_c_mum_food_0', user_id: 'u_kabir', value: 1 },
  { id: 'v4', trip_id: 't_spice', stop_activity_id: 'sa1', activity_id: 'a_c_mum_food_0', user_id: 'u_maya', value: 1 },

  // sa2: Elephanta Caves / Sightseeing -> Group Conflict! (-2: 3 voted against)
  { id: 'v5', trip_id: 't_spice', stop_activity_id: 'sa2', activity_id: 'a_c_mum_sightseeing_0', user_id: 'u_demo', value: -1 },
  { id: 'v6', trip_id: 't_spice', stop_activity_id: 'sa2', activity_id: 'a_c_mum_sightseeing_0', user_id: 'u_aisha', value: -1 },
  { id: 'v7', trip_id: 't_spice', stop_activity_id: 'sa2', activity_id: 'a_c_mum_sightseeing_0', user_id: 'u_kabir', value: -1 },
  { id: 'v8', trip_id: 't_spice', stop_activity_id: 'sa2', activity_id: 'a_c_mum_sightseeing_0', user_id: 'u_maya', value: 1 },

  // sa4: Goa Wellness Yoga -> Upvoted (+3)
  { id: 'v9', trip_id: 't_spice', stop_activity_id: 'sa4', activity_id: 'a_c_goa_wellness_0', user_id: 'u_demo', value: 1 },
  { id: 'v10', trip_id: 't_spice', stop_activity_id: 'sa4', activity_id: 'a_c_goa_wellness_0', user_id: 'u_aisha', value: 1 },
  { id: 'v11', trip_id: 't_spice', stop_activity_id: 'sa4', activity_id: 'a_c_goa_wellness_0', user_id: 'u_maya', value: 1 },

  // sa6: Goa Water Sports -> Mixed (+1: 2 for, 1 against)
  { id: 'v12', trip_id: 't_spice', stop_activity_id: 'sa6', activity_id: 'a_c_goa_adventure_1', user_id: 'u_demo', value: 1 },
  { id: 'v13', trip_id: 't_spice', stop_activity_id: 'sa6', activity_id: 'a_c_goa_adventure_1', user_id: 'u_kabir', value: 1 },
  { id: 'v14', trip_id: 't_spice', stop_activity_id: 'sa6', activity_id: 'a_c_goa_adventure_1', user_id: 'u_aisha', value: -1 },
];

/** Expense Splits between group members */
export const expenseSplits = [
  // e3: Mumbai Food Trail (₹6,000 paid by u_demo, split 4 ways: ₹1,500 each)
  { id: 'sp1', expense_id: 'e3', user_id: 'u_demo', share: 1500, is_settled: true },
  { id: 'sp2', expense_id: 'e3', user_id: 'u_aisha', share: 1500, is_settled: false },
  { id: 'sp3', expense_id: 'e3', user_id: 'u_kabir', share: 1500, is_settled: false },
  { id: 'sp4', expense_id: 'e3', user_id: 'u_maya', share: 1500, is_settled: false },

  // e4: Café Leopold Lunch (₹3,600 paid by u_aisha, split 4 ways: ₹900 each)
  { id: 'sp5', expense_id: 'e4', user_id: 'u_demo', share: 900, is_settled: false },
  { id: 'sp6', expense_id: 'e4', user_id: 'u_aisha', share: 900, is_settled: true },
  { id: 'sp7', expense_id: 'e4', user_id: 'u_kabir', share: 900, is_settled: false },
  { id: 'sp8', expense_id: 'e4', user_id: 'u_maya', share: 900, is_settled: false },

  // e4b: Goa Yoga & Spa (₹4,800 paid by u_kabir, split 4 ways: ₹1,200 each)
  { id: 'sp9', expense_id: 'e4b', user_id: 'u_demo', share: 1200, is_settled: false },
  { id: 'sp10', expense_id: 'e4b', user_id: 'u_aisha', share: 1200, is_settled: false },
  { id: 'sp11', expense_id: 'e4b', user_id: 'u_kabir', share: 1200, is_settled: true },
  { id: 'sp12', expense_id: 'e4b', user_id: 'u_maya', share: 1200, is_settled: false },
];

/** @type {import('./schema.js').SavedDestination[]} */
export const savedDestinations = [
  { user_id: 'u_demo', city_id: 'c_kyo' },
  { user_id: 'u_demo', city_id: 'c_lis' },
  { user_id: 'u_demo', city_id: 'c_cpt' },
  { user_id: 'u_aisha', city_id: 'c_syd' },
];
