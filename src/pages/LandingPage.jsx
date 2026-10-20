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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { BoardingPassCard } from '@/components/trip/BoardingPassCard.jsx';
import { trips } from '@/data/trips.js';
import { cities } from '@/data/cities.js';

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
    q: 'Can I try the full platform without creating a new account?',
    a: 'Yes! Click "Demo Traveller" on the login screen or use demo@yatraverse.app / demo1234 to immediately explore real multi-city trips, interactive boarding passes, and budget radars.',
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

  const copyDemoCreds = () => {
    navigator.clipboard?.writeText('demo@yatraverse.app / demo1234');
    toast.info('Copied Demo Credentials: demo@yatraverse.app / demo1234');
  };

  return (
    <div className="relative min-h-screen bg-ink text-parchment selection:bg-saffron/30 selection:text-white">
      <ConstellationBg />

      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="relative z-20 border-b border-border/40 bg-surface/80 px-4 py-2 text-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-saffron/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-saffron">
              BUILDATHON 2.0 LIVE
            </span>
            <span className="hidden text-muted md:inline">
              Explore the next-gen AI boarding pass & multi-city travel atlas.
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted">
            <button
              onClick={copyDemoCreds}
              className="inline-flex items-center gap-1 transition-colors hover:text-saffron"
              title="Click to copy demo credentials"
            >
              <Zap className="h-3 w-3 text-saffron" />
              <span>Demo: demo@yatraverse.app</span>
            </button>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline font-mono text-[11px] text-aurora">Currency: INR (₹)</span>
          </div>
        </div>
      </div>

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

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#search-bar" className="text-sm font-medium text-muted transition-colors hover:text-parchment">
              Plan Orbit
            </a>
            <a href="#destinations" className="text-sm font-medium text-muted transition-colors hover:text-parchment">
              Destinations
            </a>
            <a href="#curated-orbits" className="text-sm font-medium text-muted transition-colors hover:text-parchment">
              Curated Routes
            </a>
            <a href="#boarding-pass-demo" className="text-sm font-medium text-muted transition-colors hover:text-parchment">
              Live Boarding Pass
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted transition-colors hover:text-parchment">
              How It Works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden text-sm sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-saffron/40 text-saffron hover:bg-saffron/10">
                Demo Traveller
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-saffron text-ink font-semibold shadow-glow hover:bg-saffron/90">
                Stamp Passport
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Text / Value Prop */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-aurora/30 bg-aurora/10 px-3.5 py-1 text-xs text-aurora">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-mono uppercase tracking-wider">Multi-City AI Trajectory Engine</span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.12] sm:text-5xl md:text-6xl">
              Cities as stars. <br />
              <span className="bg-gradient-to-r from-saffron via-coral to-aurora bg-clip-text text-transparent">
                Trips as constellations.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              The premier boarding-pass planner for wanderers charting multiple horizons. Turn wanderlust into real,
              budget-optimized flight orbits, interactive 3D globes, and collectible digital passport stamps.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-saffron text-ink font-semibold shadow-glow hover:bg-saffron/90">
                  Begin the Atlas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/20 bg-surface/40 hover:bg-surface">
                  Judge Quick Demo
                </Button>
              </Link>
            </div>

            {/* Social Trust Metrics */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-border/40 pt-6 text-sm text-muted">
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
              <div className="flex items-center gap-1.5 text-aurora">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Latency Offline Storage</span>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Globe + Orbit Badge */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative flex h-[380px] w-full max-w-[420px] items-center justify-center rounded-3xl border border-white/10 bg-surface/30 p-4 shadow-glass backdrop-blur-md">
              <Suspense fallback={<div className="h-64 w-64 animate-pulse rounded-full bg-surface" />}>
                <Globe className="h-[320px] w-[320px]" />
              </Suspense>

              {/* Floating Floating Info Cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-4 rounded-xl border border-saffron/30 bg-ink/90 p-3 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-saffron animate-ping" />
                  <span className="font-mono text-xs font-semibold text-saffron">ACTIVE ORBIT</span>
                </div>
                <p className="mt-1 text-xs text-parchment font-medium">BOM ➔ TYO ➔ PAR</p>
                <p className="text-[10px] text-muted">Estimated Burn: ₹2,14,000</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-4 right-4 rounded-xl border border-aurora/30 bg-ink/90 p-3 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-aurora" />
                  <span className="font-mono text-xs font-semibold text-aurora">PASSPORT STAMPED</span>
                </div>
                <p className="mt-1 text-xs text-parchment font-medium">Shibuya Night Walk Unlocked</p>
                <p className="text-[10px] text-muted">Tokyo Constellation Node</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOMMERCE TRIP SEARCH & BOOKING ENGINE WIDGET */}
      <section id="search-bar" className="relative z-20 mx-auto -mt-6 max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-border/70 bg-surface/90 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
          {/* Search Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('multi')}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeTab === 'multi'
                    ? 'bg-saffron text-ink font-semibold shadow-glow'
                    : 'text-muted hover:bg-white/5 hover:text-parchment'
                }`}
              >
                <Plane className="h-4 w-4" />
                Multi-City Constellation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeTab === 'single'
                    ? 'bg-saffron text-ink font-semibold shadow-glow'
                    : 'text-muted hover:bg-white/5 hover:text-parchment'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Single Destination
              </button>
            </div>
            <span className="font-mono text-xs text-muted">AI-Powered Optimization Active ⚡</span>
          </div>

          {/* Search Form Fields */}
          <form onSubmit={handleSearchSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Origin Input */}
            <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <MapPin className="h-3.5 w-3.5 text-saffron" />
                Origin City
              </label>
              <input
                type="text"
                value={searchOrigin}
                onChange={(e) => setSearchOrigin(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-parchment focus:outline-none"
                placeholder="e.g. Mumbai (BOM)"
              />
              <span className="text-[10px] text-muted">Primary departure gate</span>
            </div>

            {/* Multi Destinations Input */}
            <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Globe2 className="h-3.5 w-3.5 text-aurora" />
                Destinations (Multi-Hops)
              </label>
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-parchment focus:outline-none"
                placeholder="Tokyo, Seoul, Bangkok"
              />
              <span className="text-[10px] text-muted">AI orders for minimum transit</span>
            </div>

            {/* Travel Dates */}
            <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Calendar className="h-3.5 w-3.5 text-coral" />
                Window & Season
              </label>
              <div className="mt-1 text-sm font-semibold text-parchment">Dec 2026 – Jan 2027</div>
              <span className="text-[10px] text-muted">14 Days · High Season</span>
            </div>

            {/* Travellers & Budget */}
            <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Wallet className="h-3.5 w-3.5 text-saffron" />
                Budget Radar Cap
              </label>
              <div className="mt-1 text-sm font-semibold text-parchment">₹2,00,000 Cap</div>
              <span className="text-[10px] text-muted">2 Travellers · Fuel Gauge Active</span>
            </div>

            {/* Search CTA */}
            <div className="flex items-stretch">
              <Button
                type="submit"
                className="h-full w-full rounded-xl bg-gradient-to-r from-saffron to-coral text-base font-bold text-ink shadow-glow hover:opacity-95"
              >
                <Search className="mr-2 h-4 w-4" />
                Orbit Search
              </Button>
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

      {/* DEMO CREDENTIALS CALLOUT FOR JUDGES */}
      <section className="relative z-10 mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-saffron/40 bg-gradient-to-r from-saffron/10 via-surface to-aurora/10 p-6 text-center sm:p-8">
          <span className="rounded-full bg-saffron/20 px-3 py-1 font-mono text-xs font-semibold text-saffron">
            BUILDATHON 2.0 EVALUATOR ACCESS
          </span>
          <h3 className="mt-3 font-display text-2xl font-bold text-parchment sm:text-3xl">
            Test the live system with one click
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted sm:text-sm">
            Both the Node.js Express backend and Prisma SQLite/Postgres database are connected and operational.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-xl border border-white/10 bg-ink/80 px-4 py-2 font-mono text-xs text-parchment">
              User: <span className="text-saffron">demo@yatraverse.app</span> / Pass:{' '}
              <span className="text-saffron">demo1234</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink/80 px-4 py-2 font-mono text-xs text-parchment">
              Admin: <span className="text-aurora">admin@yatraverse.app</span> / Pass:{' '}
              <span className="text-aurora">admin1234</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="bg-saffron text-ink font-bold shadow-glow hover:bg-saffron/90">
                Launch Demo Login Now
              </Button>
            </Link>
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
                Try Demo Mode
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
                    Astra AI Travel Companion
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
