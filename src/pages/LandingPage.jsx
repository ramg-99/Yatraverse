import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  Star,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  Plane,
  Award,
  Search,
  Compass,
  Zap,
  TrendingUp,
  Bookmark,
  Share2,
  HelpCircle,
  Mail,
  ChevronRight,
  Clock,
  Layers,
  ChevronDown,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useThemeStore } from '@/store/useThemeStore.js';
import { cn } from '@/lib/utils.js';
import { trips } from '@/data/trips.js';
import { cities } from '@/data/cities.js';
import { onImgError } from '@/lib/image.js';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

// Curated Expedition Routes
const FEATURED_PACKAGES = [
  {
    id: 'pkg_spice',
    tripId: 't_spice',
    title: 'The Spice Route Homecoming',
    subtitle: 'Mumbai · Goa · Kochi',
    tag: 'Coastal & Heritage',
    rating: 4.95,
    reviews: 128,
    days: '11 Days',
    budgetEstimate: '₹1,85,000',
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
    badge: 'Popular Choice',
    stops: ['BOM', 'GOI', 'COK'],
    description: 'Slow trains, Latin quarter lanes, and sunset ferries across historic spice ports.',
  },
  {
    id: 'pkg_neon',
    tripId: 't_neon',
    title: 'Neon Pacific Drift',
    subtitle: 'Tokyo · Seoul · Bangkok',
    tag: 'Cyberpunk & Nightlife',
    rating: 4.98,
    reviews: 214,
    days: '13 Days',
    budgetEstimate: '₹2,10,000',
    cover: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200',
    badge: 'Trending AI Orbit',
    stops: ['TYO', 'SEL', 'BKK'],
    description: 'High-speed Shinkansen, neon alleyways, late-night ramyeon, and golden monsoon temples.',
  },
  {
    id: 'pkg_atlantic',
    tripId: 't_atl',
    title: 'Atlantic Arc Odyssey',
    subtitle: 'Lisbon · Barcelona · Paris',
    tag: 'Art & Architecture',
    rating: 4.91,
    reviews: 96,
    days: '14 Days',
    budgetEstimate: '₹3,20,000',
    cover: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200',
    badge: 'Cultural Masterpiece',
    stops: ['LIS', 'BCN', 'PAR'],
    description: 'Tram 28 rattling up hills, Gaudi curves on the Mediterranean, and Seine bookstalls at dusk.',
  },
  {
    id: 'pkg_ochre',
    tripId: 't_sahara',
    title: 'Ochre & Ocean Crossings',
    subtitle: 'Jaipur · Marrakech · Cape Town',
    tag: 'Grand Latitude',
    rating: 4.89,
    reviews: 84,
    days: '16 Days',
    budgetEstimate: '₹2,60,000',
    cover: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200',
    badge: 'Epic Multi-Continent',
    stops: ['JAI', 'RAK', 'CPT'],
    description: 'Pink palace courtyards, medina spice drums, and Table Mountain looking out toward the Antarctic.',
  },
];

const STATS = [
  { value: '26+', label: 'Curated Global Hubs', helper: 'Hand-vetted coordinates' },
  { value: '100%', label: 'Realtime Budget Radar', helper: 'Zero unexpected overruns' },
  { value: '<300ms', label: 'AI Orbit Engine', helper: 'Instant multi-city sequence' },
  { value: '4.95 / 5', label: 'Explorer Satisfaction', helper: 'From verified wanderers' },
];

const FAQS = [
  {
    q: 'How does Yatraverse calculate optimal multi-city orbits?',
    a: 'Our AI engine calculates geographical hops, airport connectivity (IATA matrices), seasonal weather windows, and cost distributions to order your destinations into the most time- and cash-efficient loop.',
  },
  {
    q: 'How does authentication and cloud sync work?',
    a: 'Yatraverse uses enterprise-grade Supabase Authentication to protect your account and automatically synchronize your multi-city itineraries, travel preferences, and shared budgets across all your devices in real time.',
  },
  {
    q: 'Does Yatraverse work when I lose internet connectivity?',
    a: 'Absolutely. Boarding passes, itinerary hops, and passport stamps are cached in your local browser storage, allowing you to access flight codes and hotel notes even on flights or remote trains.',
  },
  {
    q: 'What is the Fuel Gauge Budget Radar?',
    a: 'Unlike static expense sheets, the fuel gauge dynamically calculates daily burn rates, warns you if your upcoming stays breach your allocation, and recalculates remaining headroom in real time.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('multi');
  const [selectedDemoTripIndex, setSelectedDemoTripIndex] = useState(0);
  const [filterRegion, setFilterRegion] = useState('All');
  const [searchOrigin, setSearchOrigin] = useState('Mumbai (BOM)');
  const [searchDestination, setSearchDestination] = useState('Tokyo & Paris');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const activeTrip = trips[selectedDemoTripIndex] || trips[0];
  const demoCodes =
    selectedDemoTripIndex === 0
      ? ['BOM', 'GOI', 'COK']
      : selectedDemoTripIndex === 1
      ? ['TYO', 'SEL', 'BKK']
      : ['LIS', 'BCN', 'PAR'];

  const filteredCities =
    filterRegion === 'All'
      ? cities.slice(0, 8)
      : cities.filter((c) => c.region.toLowerCase() === filterRegion.toLowerCase()).slice(0, 8);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    toast.success('Orbit route generated! Redirecting to explorer...');
    navigate('/login');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success('Passport subscribed! You will receive weekly curated orbits.');
    setNewsletterEmail('');
  };

  const { mode, toggleMode } = useThemeStore();

  return (
    <div className="relative min-h-screen bg-ink text-parchment selection:bg-saffron/30 selection:text-white">
      <ConstellationBg />

      {/* MAIN HEADER / MEGA NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo & Brand */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-saffron/30 bg-saffron/10 text-saffron shadow-glow transition-all group-hover:scale-105 group-hover:border-saffron">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-parchment">
                Yatra<span className="text-saffron">verse</span>
              </p>
              <p className="hidden text-[10px] uppercase tracking-widest text-muted sm:block">
                Constellation Travel Atlas
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links - Single line with generous hover & active feedback */}
          <nav className="hidden items-center gap-1 xl:gap-2 lg:flex shrink-0">
            <a
              href="#search-bar"
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-saffron hover:bg-white/5 transition-all duration-200"
            >
              Plan Orbit
            </a>
            <a
              href="#curated-orbits"
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-saffron hover:bg-white/5 transition-all duration-200"
            >
              Curated Routes
            </a>
            <a
              href="#boarding-pass-demo"
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-saffron hover:bg-white/5 transition-all duration-200"
            >
              Live Pass
            </a>
            <a
              href="#destinations"
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-saffron hover:bg-white/5 transition-all duration-200"
            >
              Star Hubs
            </a>
            <a
              href="#how-it-works"
              className="whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold text-muted hover:text-saffron hover:bg-white/5 transition-all duration-200"
            >
              How It Works
            </a>
          </nav>

          {/* Action CTAs - Decongested, high-contrast, strictly single line */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link to="/login" className="shrink-0 hidden sm:inline-block">
              <span className="whitespace-nowrap px-3.5 py-2 text-sm font-semibold rounded-xl text-muted hover:text-parchment hover:bg-white/5 transition-colors">
                Sign In
              </span>
            </Link>

            <Link to="/signup" className="shrink-0">
              <button
                type="button"
                className="whitespace-nowrap px-5 py-2 text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] hover:shadow-[0_0_28px_rgba(251,191,36,0.65)] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                Stamp Passport
              </button>
            </Link>

            {/* Small Mode Toggle Button in the far right corner */}
            <button
              type="button"
              onClick={toggleMode}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer select-none shrink-0',
                mode === 'dark'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 hover:bg-amber-400/30 hover:border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                  : 'bg-amber-50 text-amber-900 border border-amber-400/70 hover:bg-amber-100 shadow-xs'
              )}
              title={mode === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
              aria-label="Toggle theme mode"
            >
              {mode === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="h-4 w-4 text-amber-800" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION WITH 3D ROTATING GLOBE */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 md:pt-16 md:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Text / Value Prop */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/15 px-3.5 py-1 text-xs font-semibold text-saffron">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-mono uppercase tracking-wider">Multi-City AI Trajectory Engine</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.12] sm:text-5xl md:text-6xl text-parchment">
              Cities as stars. <br />
              <span className="bg-gradient-to-r from-saffron via-amber-300 to-aurora bg-clip-text text-transparent">
                Trips as constellations.
              </span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              The premier boarding-pass planner for wanderers charting multiple horizons. Turn wanderlust into real,
              budget-optimized flight orbits, interactive 3D globes, and collectible digital passport stamps.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/signup">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.5)] border-2 border-amber-200 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Begin the Atlas</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/80 bg-surface/50 hover:bg-surface text-parchment hover:text-saffron shadow-xs font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Social Trust Metrics */}
            <div className="flex flex-wrap items-center gap-6 border-t border-border/40 pt-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-ink"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="Traveler"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-ink"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                    alt="Traveler"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-ink"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"
                    alt="Traveler"
                  />
                </div>
                <span>4.95/5 Rating by 2,400+ Explorers</span>
              </div>
              <div className="flex items-center gap-1.5 text-aurora font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Cloud Sync</span>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Globe + Orbit Badges */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative flex h-[380px] w-full max-w-[420px] items-center justify-center rounded-3xl border border-border/70 bg-surface/40 p-4 shadow-glass backdrop-blur-md">
              <Suspense fallback={<div className="h-64 w-64 animate-pulse rounded-full bg-surface" />}>
                <Globe className="h-[320px] w-[320px]" />
              </Suspense>

              {/* Floating Info Cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-4 rounded-xl border border-saffron/40 bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-saffron animate-ping" />
                  <span className="font-mono text-xs font-bold text-saffron">ACTIVE ORBIT</span>
                </div>
                <p className="mt-0.5 text-xs text-parchment font-semibold">BOM ➔ TYO ➔ PAR</p>
                <p className="text-[10px] text-muted">Estimated Burn: ₹2,14,000</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-4 right-4 rounded-xl border border-aurora/40 bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-aurora" />
                  <span className="font-mono text-xs font-bold text-aurora">PASSPORT STAMPED</span>
                </div>
                <p className="mt-0.5 text-xs text-parchment font-semibold">Shibuya Night Walk Unlocked</p>
                <p className="text-[10px] text-muted">Tokyo Constellation Node</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEGMENTED TRAVEL CONSOLE SEARCH BAR */}
      <section id="search-bar" className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass rounded-3xl border border-border/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/trips/new?name=${encodeURIComponent(searchDestination)}&days=10`);
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            {/* Segment 1: Destination */}
            <div className="md:col-span-4 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface border border-border/80">
              <MapPin className="h-5 w-5 text-saffron shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
                  Destination (Multi-City)
                </label>
                <input
                  type="text"
                  placeholder="Where to? (e.g. Tokyo, Goa, Paris...)"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="w-full bg-transparent text-sm text-parchment placeholder:text-muted focus:outline-none font-semibold truncate"
                />
              </div>
            </div>

            {/* Segment 2: Origin Gate */}
            <div className="md:col-span-3 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface border border-border/80">
              <Plane className="h-5 w-5 text-aurora shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
                  Departure Origin
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai (BOM)"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="w-full bg-transparent text-sm text-parchment placeholder:text-muted focus:outline-none font-semibold truncate"
                />
              </div>
            </div>

            {/* Segment 3: Duration */}
            <div className="md:col-span-3 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface border border-border/80">
              <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
                  Duration & Pace
                </label>
                <select
                  aria-label="Trip Duration"
                  className="w-full bg-transparent text-sm text-parchment focus:outline-none font-semibold cursor-pointer"
                  onChange={() => {}}
                >
                  <option value="7">7 Days · Quick Explorer</option>
                  <option value="11">11 Days · Coastal & Heritage</option>
                  <option value="14">14 Days · Complete Orbit</option>
                  <option value="21">21 Days · Grand Odyssey</option>
                </select>
              </div>
            </div>

            {/* Segment 4: Plan CTA */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full h-full min-h-[46px] rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-[0_0_15px_rgba(251,191,36,0.4)] hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Plan Orbit</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* METRICS & PROOF STRIP */}
      <section className="relative z-10 mx-auto mt-14 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-surface/40 p-6 sm:grid-cols-4 sm:p-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-parchment sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-saffron">{stat.label}</p>
              <p className="text-xs text-muted">{stat.helper}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURATED EXPEDITIONS / ECOMMERCE TRIPS GRID */}
      <section id="curated-orbits" className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-saffron">
              <Layers className="h-3.5 w-3.5" />
              <span>Verified Constellation Blueprints</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-parchment sm:text-4xl">
              Curated Multi-City Expeditions
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Pre-calculated routes with balanced day sequences, vetted stays, and budget safety margins. Ready to clone
              and adapt into your passport.
            </p>
          </div>
          <Link to="/login">
            <Button variant="outline" className="border-border hover:bg-surface">
              View All 12 Packages
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Trips Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PACKAGES.map((pkg, idx) => (
            <div
              key={pkg.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface/70 transition-all duration-300 hover:-translate-y-1.5 hover:border-saffron/40 hover:shadow-2xl"
            >
              {/* Image banner with overlay */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={pkg.cover}
                  alt={pkg.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-saffron backdrop-blur-md">
                  {pkg.badge}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-mono text-parchment backdrop-blur-md">
                  {pkg.days}
                </span>
              </div>

              {/* Content Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="font-mono text-aurora">{pkg.tag}</span>
                  <div className="flex items-center gap-1 text-saffron">
                    <Star className="h-3.5 w-3.5 fill-saffron" />
                    <span className="font-semibold">{pkg.rating}</span>
                    <span className="text-[10px] text-muted">({pkg.reviews})</span>
                  </div>
                </div>

                <h3 className="mt-2.5 font-display text-xl font-bold text-parchment group-hover:text-saffron transition-colors">
                  {pkg.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-muted">{pkg.subtitle}</p>

                {/* Stops Codes */}
                <div className="mt-3 flex items-center gap-2">
                  {pkg.stops.map((stop, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded border border-border/80 bg-ink/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-parchment"
                    >
                      {stop}
                    </span>
                  ))}
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-muted">{pkg.description}</p>

                {/* Footer Pricing & CTA */}
                <div className="mt-auto border-t border-border/40 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted">Estimated Orbit</span>
                    <p className="font-mono text-base font-bold text-saffron">{pkg.budgetEstimate}</p>
                  </div>
                  <Link to="/login">
                    <Button size="sm" className="bg-white/10 hover:bg-saffron hover:text-ink text-xs transition-colors">
                      Explore Route
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE INTERACTIVE BOARDING PASS ENGINE (Showcase) */}
      <section id="boarding-pass-demo" className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface/40 p-6 md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Description & Trip Selector */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs text-coral">
                <Award className="h-3.5 w-3.5" />
                <span className="font-mono uppercase tracking-wider">Proprietary UI Component</span>
              </div>

              <h2 className="mt-4 font-display text-3xl font-bold text-parchment sm:text-4xl">
                The Live Boarding Pass.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Judges and travellers can test this live right now. Click any itinerary below to dynamically switch the
                interactive boarding pass, IATA airport routes, departure dates, and live QR stamp.
              </p>

              {/* Selector Pills */}
              <div className="mt-6 flex flex-col gap-2.5">
                {trips.slice(0, 3).map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedDemoTripIndex(idx)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                      selectedDemoTripIndex === idx
                        ? 'border-saffron bg-saffron/10 text-parchment shadow-glow'
                        : 'border-border/50 bg-ink/40 text-muted hover:border-border hover:text-parchment'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted">
                        Cap: ₹{t.budget_cap.toLocaleString()} · {t.start_date}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-saffron">
                      {selectedDemoTripIndex === idx ? '● PREVIEWING' : 'SELECT'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Link to="/login">
                  <Button className="bg-saffron text-ink font-semibold hover:bg-saffron/90">
                    Open in Planner
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => toast.info('Share slug: yatraverse.app/trip/' + activeTrip.share_slug)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-parchment"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Copy Public Share Link</span>
                </button>
              </div>
            </div>

            {/* Right Live Boarding Pass Display */}
            <div className="flex justify-center lg:col-span-7">
              <div className="w-full max-w-md">
                <BoardingPassCard trip={activeTrip} codes={demoCodes} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATION CATALOG GRID WITH REGION TABS */}
      <section id="destinations" className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-aurora">
              <Compass className="h-3.5 w-3.5" />
              <span>World Atlas Catalog</span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-parchment sm:text-4xl">
              Explore 26+ Destination Stars
            </h2>
            <p className="mt-2 text-sm text-muted">
              Each city node comes equipped with cost index metrics, popularity gauges, and curated local food walks.
            </p>
          </div>

          {/* Region Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Asia', 'Europe', 'Americas', 'Africa'].map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setFilterRegion(region)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterRegion === region
                    ? 'bg-aurora text-ink font-bold shadow-glow'
                    : 'border border-border/60 bg-surface/50 text-muted hover:text-parchment'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* City Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface/60 transition-all duration-300 hover:-translate-y-1 hover:border-aurora/50"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  onError={(e) => onImgError(e, city.name)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <span className="absolute top-3 left-3 rounded-md bg-ink/80 px-2 py-0.5 font-mono text-xs font-bold text-parchment backdrop-blur-md">
                  {city.iata}
                </span>
                <span className="absolute bottom-3 left-3 font-display text-lg font-bold text-parchment">
                  {city.name}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{city.country}</span>
                  <span className="text-aurora font-medium">Best: {city.best_season}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted">{city.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted">Cost:</span>
                    <span className="font-mono text-xs text-saffron">{'₹'.repeat(city.cost_index)}</span>
                  </div>
                  <Link to="/login">
                    <button className="text-xs font-semibold text-aurora hover:underline">
                      Add to Orbit ➔
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (3 Simple Steps) */}
      <section id="how-it-works" className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-saffron">
            <Zap className="h-3.5 w-3.5" />
            <span>Effortless Planning</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment sm:text-4xl">
            How Yatraverse Works in 3 Steps
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            From scattered bucket lists to a cohesive, optimized boarding pass ready for take-off.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="relative rounded-2xl border border-border/60 bg-surface/50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron/10 font-mono text-xl font-bold text-saffron">
              01
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-parchment">Select Your Star Hubs</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Choose two or more destinations across India, Asia, Europe, or the Americas. Add desired dates and total
              financial ceiling.
            </p>
          </div>

          <div className="relative rounded-2xl border border-border/60 bg-surface/50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aurora/10 font-mono text-xl font-bold text-aurora">
              02
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-parchment">AI Calculates the Orbit</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Our routing engine calculates transit times, weather suitability, cost distributions, and flags any daily
              budget overruns.
            </p>
          </div>

          <div className="relative rounded-2xl border border-border/60 bg-surface/50 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10 font-mono text-xl font-bold text-coral">
              03
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-parchment">Stamp, Board & Wander</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Receive a live boarding pass with flight codes, daily itineraries, offline capability, and digital stamps
              in your travel passport.
            </p>
          </div>
        </div>
      </section>


      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="relative z-10 mx-auto mt-24 max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-parchment">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-muted">Everything you need to know about the Yatraverse atlas engine.</p>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border/60 bg-surface/50 transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between p-4 text-left font-medium text-parchment transition-colors hover:text-saffron"
              >
                <span className="text-sm font-semibold">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${openFaq === index ? 'rotate-180 text-saffron' : 'text-muted'}`}
                />
              </button>
              {openFaq === index && (
                <div className="border-t border-border/40 p-4 text-xs leading-relaxed text-muted">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PRE-FOOTER CTA BANNER */}
      <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-saffron/20 via-surface to-coral/20 p-8 text-center sm:p-14">
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl">Ready to chart your own constellation?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
            Join travellers and wanderers mapping multi-city memories across the globe. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-saffron text-ink font-bold shadow-glow hover:bg-saffron/90">
                Stamp Your Passport Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-border hover:bg-surface">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FULL MEGA ECOMMERCE FOOTER */}
      <footer className="relative z-10 mt-24 border-t border-border/40 bg-surface/30 pt-16 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron/10 text-saffron">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="font-display text-2xl font-bold text-parchment">
                  Yatra<span className="text-saffron">verse</span>
                </span>
              </div>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">
                The next-generation AI travel platform orchestrating multi-city journeys into unified, budget-optimized
                constellations and collectible boarding passes.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-aurora animate-pulse" />
                <span className="font-mono text-xs text-aurora">All Systems Operational · API v1.0.0</span>
              </div>
            </div>

            {/* Col 2: Destinations */}
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-parchment">Destinations</p>
              <ul className="mt-4 space-y-2 text-xs text-muted">
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Mumbai (BOM)
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Tokyo (TYO)
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Paris (PAR)
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Lisbon (LIS)
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Cape Town (CPT)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Features */}
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-parchment">Platform</p>
              <ul className="mt-4 space-y-2 text-xs text-muted">
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Multi-City Orbit Planner
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Fuel Gauge Budget Radar
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Live Boarding Pass Issuer
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Digital Passport Stamps
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-parchment transition-colors">
                    Yatra AI Travel Companion
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-parchment">Expedition Alert</p>
              <p className="mt-2 text-xs text-muted">Receive newly minted constellation routes and fare drops.</p>
              <form onSubmit={handleNewsletterSubmit} className="mt-4 flex flex-col gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="wanderer@atlas.com"
                  className="rounded-lg border border-border/80 bg-ink/70 px-3 py-2 text-xs text-parchment focus:border-saffron focus:outline-none"
                  required
                />
                <Button size="sm" type="submit" className="bg-saffron text-ink font-semibold hover:bg-saffron/90">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted sm:flex-row">
            <p>© 2026 Yatraverse. Crafted for Buildathon 2.0. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-parchment cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-parchment cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-parchment cursor-pointer">Judging Criteria Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
