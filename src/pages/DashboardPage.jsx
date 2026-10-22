import { useState, useMemo, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import {
  PlusCircle,
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  ArrowRight,
  CreditCard,
  Clock,
  Search,
  CheckCircle2,
  Globe2,
  TrendingUp,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { greeting, money, tripStatus } from '@/lib/utils.js';
import { codesFor, pointsFor, spendFor } from '@/lib/tripView.js';
import { Button } from '@/components/ui/button.jsx';
import { useCountUp } from '@/hooks/useCountUp.js';
import { onImgError } from '@/lib/image.js';
import { YatraAiSymbol } from '@/components/ai/YatraAiSymbol.jsx';

const TripMap = lazy(() => import('@/components/map/TripMap.jsx').then((m) => ({ default: m.TripMap })));

export default function DashboardPage() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user) || { name: 'Traveller', currency: 'INR' };
  const world = useWorldStore();
  const setChatOpen = useWorldStore((s) => s.setChatOpen);
  const [destinationSearch, setDestinationSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const mine = world.trips.filter((t) => t.user_id === user.id || t.collaborators?.includes(user.id));
  const upcoming = mine.find((t) => tripStatus(t.start_date, t.end_date) === 'upcoming') || mine[0];
  const daysUntil = upcoming ? Math.max(0, differenceInDays(new Date(upcoming.start_date), new Date())) : 0;
  const totalPlannedSpend = mine.reduce((s, t) => s + spendFor(t.id).total, 0);
  const totalCap = mine.reduce((s, t) => s + (t.budget_cap || 150000), 0);
  const animatedSpend = useCountUp(totalPlannedSpend);

  const upcomingStops = upcoming ? world.stops.filter((s) => s.trip_id === upcoming.id) : [];
  const upcomingSpend = upcoming ? spendFor(upcoming.id) : { total: 0 };
  const allPoints = mine.flatMap((t) => pointsFor(t.id));

  // Destination Categories
  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'beaches', label: '🏖️ Coastal & Beaches', filter: ['c_goa', 'c_bkk', 'c_syd', 'c_bcn'] },
    { id: 'culture', label: '🏛️ Heritage & Culture', filter: ['c_jai', 'c_tyo', 'c_lis', 'c_rak'] },
    { id: 'cities', label: '🌆 Metro & Skyline', filter: ['c_mum', 'c_nyc', 'c_sin', 'c_dxb', 'c_sel'] },
  ];

  const filteredCities = useMemo(() => {
    let list = world.cities;
    if (activeCategory !== 'all') {
      const match = categories.find((c) => c.id === activeCategory);
      if (match?.filter) {
        list = list.filter((c) => match.filter.includes(c.id));
      }
    }
    if (destinationSearch.trim()) {
      const q = destinationSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
    }
    return list.slice(0, 8);
  }, [world.cities, activeCategory, destinationSearch]);

  const [durationDays, setDurationDays] = useState(7);
  const [budgetTier, setBudgetTier] = useState('Moderate');

  const handleHeroPlan = (e) => {
    e.preventDefault();
    const dest = destinationSearch.trim() || 'Multi-City Adventure';
    nav(`/trips/new?name=${encodeURIComponent(dest)}&days=${durationDays}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Personalized Travel Cockpit & Welcome Command Bar */}
      <div className="glass relative overflow-hidden rounded-3xl border border-border/80 p-6 sm:p-8 shadow-md bg-gradient-to-br from-surface via-surface to-accent/10">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs font-bold text-accent shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Travel Command Center</span>
              </span>
              <span className="rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-xs font-mono text-muted">
                {greeting()}, {user.name}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-parchment">
              Ready for your next journey?
            </h1>
            <p className="text-sm text-muted max-w-xl leading-relaxed">
              {upcoming
                ? `Your upcoming expedition "${upcoming.name}" is scheduled in ${daysUntil} days. All offline boarding passes and Gemini AI trajectories are synced.`
                : 'Explore 16 global hubs, craft multi-city itineraries, and track real-time budgets with automated fuel gauges.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              onClick={() => setChatOpen(true)}
              variant="outline"
              className="border-border/80 hover:border-accent text-parchment font-semibold shadow-xs"
            >
              <Sparkles className="mr-2 h-4 w-4 text-accent" />
              <span>Ask Yatra AI</span>
            </Button>

            <Link to="/cities">
              <Button
                variant="outline"
                className="border-border/80 hover:border-accent text-parchment font-semibold shadow-xs"
              >
                <Compass className="mr-2 h-4 w-4 text-aurora" />
                <span>Explore Cities</span>
              </Button>
            </Link>

            <Link to="/trips/new">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-extrabold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.55)] border-2 border-amber-200 hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                <PlusCircle className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" />
                <span className="font-extrabold tracking-wide text-slate-950">+ Plan New Trip</span>
              </button>
            </Link>
          </div>
        </div>
      </div>


      {/* 2. Primary Upcoming Trip Spotlight (if exists) */}
      {upcoming && (
        <div className="glass rounded-3xl p-6 border border-border/80 overflow-hidden relative shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center w-full lg:w-auto">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden shrink-0 shadow-md">
                <img
                  src={upcoming.cover_url}
                  alt={upcoming.name}
                  onError={(e) => onImgError(e, upcoming.name)}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                  {daysUntil === 0 ? 'Happening Now' : `In ${daysUntil} Days`}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-accent font-bold">
                    Primary Journey
                  </span>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                    {tripStatus(upcoming.start_date, upcoming.end_date)}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-parchment">
                  {upcoming.name}
                </h2>
                <p className="text-xs text-muted flex items-center gap-1.5 font-mono">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(upcoming.start_date), 'dd MMM')} — {format(new Date(upcoming.end_date), 'dd MMM yyyy')}
                </p>

                {/* Stops Breadcrumb */}
                {upcomingStops.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {upcomingStops.map((stop, i) => {
                      const c = world.cities.find((x) => x.id === stop.city_id);
                      return (
                        <span key={stop.id} className="inline-flex items-center text-xs text-parchment font-medium">
                          <span className="rounded-md bg-border/50 px-2 py-0.5 text-[11px]">
                            {c ? c.name : 'Stop'}
                          </span>
                          {i < upcomingStops.length - 1 && <span className="mx-1 text-muted">→</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between w-full lg:w-auto gap-3 border-t lg:border-t-0 border-border/40 pt-4 lg:pt-0">
              <div className="text-left lg:text-right">
                <p className="text-xs text-muted">Planned Spend / Budget Cap</p>
                <p className="font-mono text-xl font-bold text-parchment">
                  {money(upcomingSpend.total, user.currency)}{' '}
                  <span className="text-xs text-muted font-normal">/ {money(upcoming.budget_cap, user.currency)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link to={`/trips/${upcoming.id}/build`} className="w-full sm:w-auto">
                  <Button size="md" className="w-full bg-saffron text-slate-950 font-bold hover:brightness-105 shadow-md">
                    Open Itinerary Studio <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/trips/${upcoming.id}`}>
                  <Button size="md" variant="outline" className="border-border">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Core Travel Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5 border border-border/70 hover:border-accent/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-medium">Total Planned Budget</span>
            <div className="h-8 w-8 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-parchment">
            {money(animatedSpend, user.currency)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Cap: {money(totalCap, user.currency)} ({Math.min(100, Math.round((totalPlannedSpend / (totalCap || 1)) * 100))}% allocated)
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/70 hover:border-accent/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-medium">Upcoming Journeys</span>
            <div className="h-8 w-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-parchment">
            {upcoming ? `${daysUntil} Days` : 'Ready'}
          </p>
          <p className="mt-1 text-xs text-muted truncate">
            {upcoming ? upcoming.name : 'Create your next vacation plan'}
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/70 hover:border-accent/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-medium">Active Itineraries</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-parchment">{mine.length}</p>
          <p className="mt-1 text-xs text-muted">
            {mine.filter((t) => tripStatus(t.start_date, t.end_date) === 'upcoming').length} upcoming · {mine.filter((t) => tripStatus(t.start_date, t.end_date) === 'past').length} completed
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/70 hover:border-accent/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="font-medium">Mapped Destinations</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-parchment">
            {allPoints.length}
          </p>
          <Link to="/cities" className="mt-1 inline-block text-xs text-accent hover:underline font-medium">
            Browse 16 Global Cities →
          </Link>
        </div>
      </div>

      {/* 4. Yatra AI Intelligent Concierge Banner */}
      <div className="glass relative overflow-hidden rounded-3xl p-6 border border-border/80 shadow-sm bg-gradient-to-r from-accent/5 via-teal-500/5 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
              onClick={() => setChatOpen(true)}
              title="Click to open Yatra AI Travel Concierge"
            >
              <YatraAiSymbol size="lg" withPulse={true} onClick={() => setChatOpen(true)} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                  Intelligent Travel Assistant
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.5 Live
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-parchment">
                Need trip ideas or budget pacing advice?
              </h2>
              <p className="mt-1 text-xs text-muted max-w-xl leading-relaxed">
                Ask Yatra AI for tailored multi-city routes, packing checklists, street food hot spots, or route optimizations in real time.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5 w-full md:w-auto">
            <Button
              size="md"
              className="bg-accent text-white font-bold shadow-xs hover:opacity-95"
              onClick={() => setChatOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Ask Yatra AI
            </Button>
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {['Plan 7 days in Japan', 'Budget backpacking tips', 'Best street food in Mumbai'].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-parchment hover:border-accent transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Your Itineraries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Your Itineraries</h2>
            <p className="text-xs text-muted">Manage, edit, and share your multi-city journeys</p>
          </div>
          <Link to="/trips" className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
            View all ({mine.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {mine.slice(0, 3).map((t) => {
            const stopsCount = world.stops.filter((s) => s.trip_id === t.id).length;
            const spend = spendFor(t.id);
            const status = tripStatus(t.start_date, t.end_date);
            return (
              <div
                key={t.id}
                className="glass group relative overflow-hidden rounded-3xl border border-border/80 transition-all hover:border-accent hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={t.cover_url}
                    alt={t.name}
                    onError={(e) => onImgError(e, t.name)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase backdrop-blur-md ${
                      status === 'upcoming'
                        ? 'bg-emerald-500/80 text-white'
                        : status === 'ongoing'
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-black/60 text-white'
                    }`}
                  >
                    {status}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-display text-lg font-bold truncate">{t.name}</p>
                    <p className="text-[11px] text-white/80 font-mono">
                      {format(new Date(t.start_date), 'dd MMM yyyy')} → {format(new Date(t.end_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-medium text-parchment">{stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</span>
                    <span className="font-mono text-accent font-bold">{money(spend.total, user.currency)}</span>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                    <Link to={`/trips/${t.id}/build`} className="text-saffron hover:underline font-bold flex items-center gap-1">
                      Itinerary Studio <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link to={`/trips/${t.id}`} className="text-muted hover:text-parchment">
                      Quick View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Explore Curated Destinations with Categories */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Explore Top Destinations</h2>
            <p className="text-xs text-muted">Curated destinations ready to add to your custom itinerary</p>
          </div>
          <Link to="/cities" className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
            All 16 Cities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-surface border border-border/80 text-muted hover:text-parchment hover:border-accent/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCities.map((c) => (
            <Link
              key={c.id}
              to="/cities"
              className="glass group overflow-hidden rounded-2xl border border-border/70 hover:border-accent transition-all flex flex-col shadow-xs"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  onError={(e) => onImgError(e, c.name)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[10px] text-white">
                  {'₹'.repeat(c.cost_index)}
                </span>
                <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] text-accent font-bold">
                  {c.iata}
                </span>
              </div>
              <div className="p-3">
                <p className="font-display text-base font-bold text-parchment group-hover:text-accent truncate">
                  {c.name}
                </p>
                <p className="text-xs text-muted truncate">{c.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Interactive Journey Map */}
      <section className="glass rounded-3xl p-6 border border-border/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Interactive Route Map</h2>
            <p className="text-xs text-muted">Geographic layout of all destinations staged across your trips</p>
          </div>
          <span className="font-mono text-xs text-accent font-semibold">{allPoints.length} Pinned Destinations</span>
        </div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-border/40" />}>
          <TripMap points={allPoints} className="h-72 w-full overflow-hidden rounded-2xl" />
        </Suspense>
      </section>
    </div>
  );
}
