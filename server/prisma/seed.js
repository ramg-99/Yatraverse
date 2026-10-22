const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const CITIES = [
  { id: "c_mum", name: "Mumbai", country: "India", region: "Asia", lat: 19.076, lng: 72.877, costIndex: 3, popularity: 92, iata: "BOM", bestSeason: "Nov-Feb", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200", description: "Marine Drive neon, vada pav, and trains that never sleep." },
  { id: "c_goa", name: "Goa", country: "India", region: "Asia", lat: 15.299, lng: 74.124, costIndex: 2, popularity: 88, iata: "GOI", bestSeason: "Nov-Mar", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200", description: "Latin quarter lanes, spice-salt air, and sunsets over the Arabian Sea." },
  { id: "c_jai", name: "Jaipur", country: "India", region: "Asia", lat: 26.912, lng: 75.787, costIndex: 2, popularity: 85, iata: "JAI", bestSeason: "Oct-Mar", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200", description: "Pink palaces, gemstone courtyards, and kite-filled skies." },
  { id: "c_koc", name: "Kochi", country: "India", region: "Asia", lat: 9.931, lng: 76.267, costIndex: 2, popularity: 80, iata: "COK", bestSeason: "Sep-Mar", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200", description: "Chinese fishing nets, backwater hush, and Kerala pepper evenings." },
  { id: "c_tyo", name: "Tokyo", country: "Japan", region: "Asia", lat: 35.676, lng: 139.65, costIndex: 5, popularity: 98, iata: "TYO", bestSeason: "Mar-May", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200", description: "Lantern alleys, silent trains, and a skyline that flickers like a constellation." },
  { id: "c_bkk", name: "Bangkok", country: "Thailand", region: "Asia", lat: 13.756, lng: 100.502, costIndex: 2, popularity: 94, iata: "BKK", bestSeason: "Nov-Feb", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200", description: "River ferries, night markets, and gold spires that catch the monsoon light." },
  { id: "c_sin", name: "Singapore", country: "Singapore", region: "Asia", lat: 1.352, lng: 103.82, costIndex: 4, popularity: 91, iata: "SIN", bestSeason: "Feb-Apr", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200", description: "Gardens that pierce clouds and a harbour of glass orchids." },
  { id: "c_sel", name: "Seoul", country: "South Korea", region: "Asia", lat: 37.566, lng: 126.978, costIndex: 4, popularity: 89, iata: "SEL", bestSeason: "Apr-May", image: "https://images.unsplash.com/photo-1546874177-9e6641073140?w=1200", description: "Palace roofs, late-night ramyeon, and neon over Han River bridges." },
  { id: "c_dxb", name: "Dubai", country: "UAE", region: "Asia", lat: 25.204, lng: 55.27, costIndex: 5, popularity: 91, iata: "DXB", bestSeason: "Nov-Mar", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200", description: "Desert geometry, souk gold, and towers with their own weather." },
  { id: "c_lis", name: "Lisbon", country: "Portugal", region: "Europe", lat: 38.722, lng: -9.139, costIndex: 3, popularity: 86, iata: "LIS", bestSeason: "Mar-Jun", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200", description: "Trams on hills, azulejo glow, and fado in the Atlantic wind." },
  { id: "c_par", name: "Paris", country: "France", region: "Europe", lat: 48.856, lng: 2.352, costIndex: 5, popularity: 97, iata: "PAR", bestSeason: "Apr-Jun", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200", description: "Bookstalls on the Seine and evenings the colour of old gold." },
  { id: "c_bcn", name: "Barcelona", country: "Spain", region: "Europe", lat: 41.385, lng: 2.173, costIndex: 4, popularity: 93, iata: "BCN", bestSeason: "May-Jun", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200", description: "Mosaic balconies, vermouth hour, and Gaudi curves." },
  { id: "c_nyc", name: "New York", country: "USA", region: "Americas", lat: 40.712, lng: -74.006, costIndex: 5, popularity: 99, iata: "NYC", bestSeason: "Apr-Jun", image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1200", description: "Steam grids, skyline canyons, and diners that keep the night on payroll." },
  { id: "c_rak", name: "Marrakech", country: "Morocco", region: "Africa", lat: 31.629, lng: -7.981, costIndex: 2, popularity: 86, iata: "RAK", bestSeason: "Mar-May", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200", description: "Spice pyramids, riad courtyards, and drums when the square cools." },
  { id: "c_cpt", name: "Cape Town", country: "South Africa", region: "Africa", lat: -33.924, lng: 18.424, costIndex: 3, popularity: 85, iata: "CPT", bestSeason: "Nov-Mar", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200", description: "Table Mountain, penguin coves, and vineyards against Atlantic cliffs." },
  { id: "c_syd", name: "Sydney", country: "Australia", region: "Oceania", lat: -33.868, lng: 151.209, costIndex: 5, popularity: 92, iata: "SYD", bestSeason: "Sep-Nov", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200", description: "Harbour sails, coastal walks, and a city with its feet in the Pacific." },
];

const ACTIVITIES = [
  { id: "a_mum_1", cityId: "c_mum", name: "Marine Drive Sunset Walk", type: "sightseeing", cost: 0, durationMin: 90, rating: 4.7, description: "Walk the Queens Necklace as city lights begin to glow.", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800" },
  { id: "a_mum_2", cityId: "c_mum", name: "Dharavi Street Food Tour", type: "food", cost: 800, durationMin: 120, rating: 4.5, description: "Taste vada pav, pav bhaji, and bhel puri from legendary stalls.", image: "https://images.unsplash.com/photo-1567188040759-fb8a253de4bb?w=800" },
  { id: "a_mum_3", cityId: "c_mum", name: "Elephanta Caves Ferry Trip", type: "culture", cost: 600, durationMin: 240, rating: 4.3, description: "Ferry across the harbour to UNESCO rock-cut Shiva temples.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800" },
  { id: "a_goa_1", cityId: "c_goa", name: "Anjuna Night Market", type: "nightlife", cost: 500, durationMin: 180, rating: 4.6, description: "Flea markets, live music, and food stalls under string lights.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800" },
  { id: "a_goa_2", cityId: "c_goa", name: "Spice Plantation Tour", type: "culture", cost: 1200, durationMin: 180, rating: 4.4, description: "Tour aromatic spice estates with lunch included.", image: "https://images.unsplash.com/photo-1615485020940-897bdca46b5f?w=800" },
  { id: "a_jai_1", cityId: "c_jai", name: "Amber Fort Sunrise Tour", type: "sightseeing", cost: 500, durationMin: 150, rating: 4.8, description: "Golden hour over the most dramatic hilltop fort in Rajasthan.", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800" },
  { id: "a_jai_2", cityId: "c_jai", name: "Jaipur Heritage Food Walk", type: "food", cost: 1500, durationMin: 180, rating: 4.6, description: "Dal baati churma, ghewar, and chai from old city markets.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800" },
  { id: "a_tyo_1", cityId: "c_tyo", name: "Shibuya Crossing Night Walk", type: "sightseeing", cost: 0, durationMin: 90, rating: 4.9, description: "The busiest pedestrian crossing on Earth at neon-lit peak hour.", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
  { id: "a_tyo_2", cityId: "c_tyo", name: "Tsukiji Market Breakfast", type: "food", cost: 2000, durationMin: 90, rating: 4.7, description: "Fresh tuna sashimi and tamagoyaki at the legendary fish market.", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800" },
  { id: "a_tyo_3", cityId: "c_tyo", name: "teamLab Planets Immersive Art", type: "culture", cost: 4500, durationMin: 120, rating: 4.9, description: "Walk through digital infinity rooms and floating flowers.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" },
  { id: "a_bkk_1", cityId: "c_bkk", name: "Chatuchak Weekend Market", type: "sightseeing", cost: 300, durationMin: 180, rating: 4.5, description: "One of the largest markets in the world: vintage, antiques, street food.", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800" },
  { id: "a_bkk_2", cityId: "c_bkk", name: "Chao Phraya River Dinner Cruise", type: "nightlife", cost: 3500, durationMin: 150, rating: 4.4, description: "Dining on a traditional teak boat past illuminated temples.", image: "https://images.unsplash.com/photo-1555399512-f9e91f09e69d?w=800" },
  { id: "a_lis_1", cityId: "c_lis", name: "Tram 28 Historic Ride", type: "sightseeing", cost: 300, durationMin: 60, rating: 4.6, description: "Rattle through steep alleys on the iconic yellow tram.", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800" },
  { id: "a_lis_2", cityId: "c_lis", name: "Fado Evening in Alfama", type: "culture", cost: 2500, durationMin: 150, rating: 4.8, description: "Intimate fado performance in a century-old tavern with petiscos.", image: "https://images.unsplash.com/photo-1513735492246-483525079686?w=800" },
  { id: "a_par_1", cityId: "c_par", name: "Eiffel Tower Sunset Visit", type: "sightseeing", cost: 2800, durationMin: 120, rating: 4.8, description: "Golden hour views from the iron lattice of the most iconic tower.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" },
  { id: "a_par_2", cityId: "c_par", name: "Le Marais Food Walk", type: "food", cost: 3500, durationMin: 180, rating: 4.7, description: "Croissants, crepes, falafels, and fromage in the trendiest quarter.", image: "https://images.unsplash.com/photo-1499744937866-d7e566a20a61?w=800" },
  { id: "a_nyc_1", cityId: "c_nyc", name: "Central Park Morning Jog", type: "adventure", cost: 0, durationMin: 120, rating: 4.6, description: "Rent a bike or jog the paths and grab breakfast from a park cart.", image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800" },
  { id: "a_nyc_2", cityId: "c_nyc", name: "Brooklyn Bridge Walk", type: "sightseeing", cost: 0, durationMin: 90, rating: 4.8, description: "Walk across the cables with unbeatable Manhattan skyline views.", image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800" },
  { id: "a_rak_1", cityId: "c_rak", name: "Djemaa el-Fna Dusk Visit", type: "culture", cost: 200, durationMin: 180, rating: 4.7, description: "Snake charmers, acrobats, food stalls, and storytellers at sunset.", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800" },
  { id: "a_rak_2", cityId: "c_rak", name: "Medina Hammam Experience", type: "wellness", cost: 1800, durationMin: 120, rating: 4.6, description: "Traditional steam bath with black soap scrub in a 14th-century hammam.", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800" },
  { id: "a_cpt_1", cityId: "c_cpt", name: "Table Mountain Cable Car", type: "adventure", cost: 3200, durationMin: 180, rating: 4.9, description: "Rotating cable car to the flat-top summit with 360 degree views.", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800" },
  { id: "a_sin_1", cityId: "c_sin", name: "Gardens by the Bay Night Walk", type: "sightseeing", cost: 1500, durationMin: 120, rating: 4.8, description: "Supertrees aglow during the nightly light-and-sound show.", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" },
  { id: "a_dxb_1", cityId: "c_dxb", name: "Desert Safari and Dune Bashing", type: "adventure", cost: 6000, durationMin: 360, rating: 4.7, description: "Off-road dune driving, camel riding, and Bedouin dinner under stars.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" },
  { id: "a_syd_1", cityId: "c_syd", name: "Sydney Opera House Tour", type: "culture", cost: 3500, durationMin: 90, rating: 4.8, description: "Inside look at the most beautiful performance venue on Earth.", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800" },
  { id: "a_koc_1", cityId: "c_koc", name: "Kerala Backwater Houseboat", type: "sightseeing", cost: 8000, durationMin: 480, rating: 4.9, description: "Drift through palm-lined canals on a traditional rice-boat.", image: "https://images.unsplash.com/photo-1602216054214-4d0b0b6d6c2f?w=800" },
  { id: "a_bcn_1", cityId: "c_bcn", name: "Sagrada Familia Guided Tour", type: "culture", cost: 2500, durationMin: 120, rating: 4.9, description: "Unfinished masterpiece with stained glass ceilings in natural light.", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800" },
];

async function main() {
  console.log("Seeding database...");
  for (const c of CITIES) await prisma.city.upsert({ where: { id: c.id }, update: c, create: c });
  console.log(CITIES.length + " cities seeded");
  for (const a of ACTIVITIES) await prisma.activity.upsert({ where: { id: a.id }, update: a, create: a });
  console.log(ACTIVITIES.length + " activities seeded");

  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({ where: { email: "admin@yatraverse.app" }, update: {}, create: { email: "admin@yatraverse.app", passwordHash: adminHash, name: "Atlas Admin", role: "admin" } });

  const demoHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({ where: { email: "demo@yatraverse.app" }, update: {}, create: { email: "demo@yatraverse.app", passwordHash: demoHash, name: "Demo Traveller", role: "user", persona: "Midnight Foodie" } });

  console.log("Demo users seeded (demo@yatraverse.app / demo1234 | admin@yatraverse.app / admin1234)");
  console.log("Database ready!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
