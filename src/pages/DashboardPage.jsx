import { Link } from 'react-router-dom';
import { lazy, Suspense, useMemo } from 'react';
import { differenceInDays, format } from 'date-fns';
import { PlusCircle, Compass, MapPin, Sparkles, Calendar, ArrowRight, DollarSign, Clock } from 'lucide-react';
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
  const user = useAuthStore((s) => s.user) || { name: 'Traveller', currency: 'INR' };
  const world = useWorldStore();
  const setChatOpen = useWorldStore((s) => s.setChatOpen);
  const mine = world.trips.filter((t) => t.user_id === user.id || t.collaborators?.includes(user.id));
  const upcoming = mine.find((t) => tripStatus(t.start_date, t.end_date) === 'upcoming') || mine[0];
  const daysUntil = upcoming ? Math.max(0, differenceInDays(new Date(upcoming.start_date), new Date())) : 0;
  const totalPlannedSpend = mine.reduce((s, t) => s + spendFor(t.id).total, 0);
  const totalCap = mine.reduce((s, t) => s + (t.budget_cap || 150000), 0);
  const animatedSpend = useCountUp(totalPlannedSpend);

  // Recommended popular cities
  const recs = useMemo(() => {
    return world.cities.slice(0, 6);
  }, [world.cities]);

  const allPoints = mine.flatMap((t) => pointsFor(t.id));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-aurora">
              Dashboard & Home
            </span>
            <span className="rounded-full bg-saffron/20 px-2 py-0.5 font-mono text-[10px] text-saffron">
              {greeting()}
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-parchment">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track your journeys, manage multi-city budgets, and discover curated destinations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Circular Yatra AI Symbol in Dashboard Header */}
          <div
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2.5 rounded-2xl border border-aurora/40 bg-aurora/10 px-3 py-1.5 shadow-sm hover:border-aurora/70 hover:bg-aurora/15 transition-all cursor-pointer group"
            title="Click to open Yatra AI Text Assistant"
          >
            <YatraAiSymbol
              size="sm"
              withPulse={true}
              onClick={() => setChatOpen(true)}
              title="Yatra AI - Click to launch text assistant"
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs font-bold text-parchment group-hover:text-aurora transition-colors">
                  Yatra AI
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-aurora animate-pulse" />
              </div>
              <p className="text-[10px] text-aurora font-medium leading-tight">Text Assistant</p>
            </div>
          </div>

          <Link to="/trips/new">
            <Button size="lg" className="shadow-md shadow-saffron/20">
              <PlusCircle className="mr-2 h-4 w-4" /> Plan New Trip
            </Button>
          </Link>
          <Link to="/ai">
            <Button size="lg" variant="outline" className="border-aurora/40 text-aurora hover:bg-aurora/10">
              <Sparkles className="mr-2 h-4 w-4" /> Yatra AI Suite
            </Button>
          </Link>
        </div>
      </div>

      {/* Budget Highlights & KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5 border border-border/40">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Total Planned Budget</span>
            <DollarSign className="h-4 w-4 text-saffron" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-saffron">
            {money(animatedSpend, user.currency)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Cap: {money(totalCap, user.currency)} ({Math.min(100, Math.round((totalPlannedSpend / (totalCap || 1)) * 100))}% allocated)
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/40">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Next Departure</span>
            <Clock className="h-4 w-4 text-aurora" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-parchment">
            {upcoming ? `${daysUntil} Days` : 'No Trips'}
          </p>
          <p className="mt-1 text-xs text-muted truncate">
            {upcoming ? upcoming.name : 'Start by planning a trip'}
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/40">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Active Trips</span>
            <Compass className="h-4 w-4 text-[#a78bfa]" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-parchment">{mine.length}</p>
          <p className="mt-1 text-xs text-muted">
            {mine.filter((t) => tripStatus(t.start_date, t.end_date) === 'upcoming').length} upcoming · {mine.filter((t) => tripStatus(t.start_date, t.end_date) === 'past').length} completed
          </p>
        </div>

        <div className="glass rounded-2xl p-5 border border-border/40">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Saved Destinations</span>
            <MapPin className="h-4 w-4 text-coral" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-parchment">
            {world.savedDestinations.filter((s) => s.user_id === user.id).length}
          </p>
          <Link to="/profile" className="mt-1 inline-block text-xs text-aurora hover:underline">
            View in wishlist →
          </Link>
        </div>
      </div>

      {/* Yatra AI Circular Symbol & Text Assistant Showcase Card */}
      <div className="glass relative overflow-hidden rounded-3xl p-6 border border-border/50 shadow-lg bg-gradient-to-r from-white/[0.04] via-aurora/[0.05] to-saffron/[0.04]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Prominent Circular Shape Symbol */}
            <div
              className="cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
              onClick={() => setChatOpen(true)}
              title="Click the circular symbol to open Yatra AI Text Assistant"
            >
              <YatraAiSymbol
                size="lg"
                withPulse={true}
                onClick={() => setChatOpen(true)}
                title="Yatra AI - Click to launch text assistant"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-aurora font-semibold">
                  Intelligent Travel Assistant
                </span>
                <span className="flex items-center gap-1 rounded-full bg-aurora/20 px-2 py-0.5 text-[10px] font-mono text-aurora font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-aurora animate-ping" />
                  Active
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-parchment flex items-center gap-2">
                Yatra AI Text Assistant
              </h2>
              <p className="mt-1 text-xs text-muted max-w-xl leading-relaxed">
                Click the circular symbol to chat with your intelligent travel text assistant. Ask about multi-city pacing, budget reductions, local experiences, or packing checklists.
              </p>
            </div>
          </div>

          {/* Quick Prompts & Open Button */}
          <div className="flex flex-col sm:items-end gap-2.5 w-full md:w-auto">
            <Button
              size="md"
              className="bg-gradient-to-r from-saffron to-aurora text-black font-bold shadow-md hover:opacity-95"
              onClick={() => setChatOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4 text-black" /> Open Yatra AI
            </Button>
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {['Plan 7 days in Japan', 'Budget backpacking tips', 'Best street food'].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="rounded-full border border-border/50 bg-white/5 px-2.5 py-1 text-[11px] text-muted hover:text-parchment hover:border-aurora/60 hover:bg-white/10 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List of Recent Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Recent Trips</h2>
            <p className="text-xs text-muted">Your active, upcoming, and past travel plans</p>
          </div>
          <Link to="/trips" className="text-xs text-saffron hover:underline flex items-center gap-1 font-medium">
            View all trips ({mine.length}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mine.slice(0, 3).map((t) => {
            const stopsCount = world.stops.filter((s) => s.trip_id === t.id).length;
            const spend = spendFor(t.id);
            const status = tripStatus(t.start_date, t.end_date);
            return (
              <div
                key={t.id}
                className="glass group relative overflow-hidden rounded-2xl border border-border/50 transition-all hover:border-saffron/40 flex flex-col justify-between"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={t.cover_url}
                    alt={t.name}
                    onError={(e) => onImgError(e, t.name)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                      status === 'upcoming'
                        ? 'bg-aurora/20 text-aurora border border-aurora/40'
                        : status === 'ongoing'
                        ? 'bg-saffron/20 text-saffron border border-saffron/40'
                        : 'bg-white/10 text-muted'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-parchment group-hover:text-saffron transition-colors">
                      {t.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {format(new Date(t.start_date), 'dd MMM yyyy')} → {format(new Date(t.end_date), 'dd MMM yyyy')}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                      <span>{stopsCount} {stopsCount === 1 ? 'stop' : 'stops'}</span>
                      <span>·</span>
                      <span className="font-mono text-saffron font-medium">{money(spend.total, user.currency)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                    <Link to={`/trips/${t.id}`} className="text-saffron hover:underline font-medium">
                      View Itinerary →
                    </Link>
                    <Link to={`/trips/${t.id}/build`} className="text-muted hover:text-parchment">
                      Edit Stops
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Destinations (Popular Cities) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Recommended Destinations</h2>
            <p className="text-xs text-muted">Popular cities ready to add to your next trip</p>
          </div>
          <Link to="/cities" className="text-xs text-saffron hover:underline flex items-center gap-1 font-medium">
            Explore all cities <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {recs.map((c) => (
            <Link
              key={c.id}
              to="/cities"
              className="glass group overflow-hidden rounded-2xl border border-border/40 hover:border-saffron/50 transition-all flex flex-col"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  onError={(e) => onImgError(e, c.name)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-saffron">
                  Cost {c.cost_index}/5
                </span>
              </div>
              <div className="p-2.5">
                <p className="font-display text-sm font-bold text-parchment group-hover:text-saffron truncate">
                  {c.name}
                </p>
                <p className="text-[11px] text-muted truncate">{c.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Interactive Trip Map */}
      <section className="glass rounded-3xl p-6 border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Your Travel Map</h2>
            <p className="text-xs text-muted">Interactive visualization of all your planned destinations</p>
          </div>
          <span className="font-mono text-xs text-saffron">{allPoints.length} Destinations mapped</span>
        </div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-white/5" />}>
          <TripMap points={allPoints} className="h-72 w-full overflow-hidden rounded-2xl" />
        </Suspense>
      </section>

      {/* Quick Action Hub */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link to="/trips/new">
          <Button size="sm"><PlusCircle className="mr-1.5 h-4 w-4" />Plan New Trip</Button>
        </Link>
        <Link to="/cities">
          <Button size="sm" variant="outline"><MapPin className="mr-1.5 h-4 w-4" />Browse Cities</Button>
        </Link>
        <Link to="/activities">
          <Button size="sm" variant="outline"><Compass className="mr-1.5 h-4 w-4" />Find Activities</Button>
        </Link>
        <Link to="/ai">
          <Button size="sm" variant="solid" className="bg-aurora/20 text-aurora hover:bg-aurora/30">
            <Sparkles className="mr-1.5 h-4 w-4" />Yatra AI Travel Assistant
          </Button>
        </Link>
      </div>
    </div>
  );
}
