import { useMemo, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart as PieIcon, BarChart3, AlertTriangle, CheckCircle2, ArrowRight, DollarSign, SlidersHorizontal, MapPin, Hotel } from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { spendFor, daysOf } from '@/lib/tripView.js';
import { BudgetGauge } from '@/components/charts/BudgetGauge.jsx';
import { convert } from '@/lib/fx.js';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';
import { Button } from '@/components/ui/button.jsx';
import { SettleUpTab } from '@/components/collaboration/SettleUpTab.jsx';
import { BookStaysModal } from '@/components/booking/BookStaysModal.jsx';

const PieChart = lazy(() => import('recharts').then((m) => ({ default: m.PieChart })));
const Pie = lazy(() => import('recharts').then((m) => ({ default: m.Pie })));
const Cell = lazy(() => import('recharts').then((m) => ({ default: m.Cell })));
const BarChart = lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const Bar = lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const XAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const Tooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));

const COLORS = ['#FFB02E', '#2DD4BF', '#FF6B6B', '#a78bfa'];

export default function TripBudgetPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const world = useWorldStore();
  const trips = world.trips;
  const trip = trips.find((t) => t.id === id) || trips[0];

  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const [stayReduction, setStayReduction] = useState(0);
  const [activeBudgetTab, setActiveBudgetTab] = useState('radar'); // 'radar' | 'settle'
  const [bookingCity, setBookingCity] = useState(null);

  const spend = useMemo(
    () => (trip ? spendFor(trip.id) : { byCat: {}, total: 0, cityBreakdown: [] }),
    [trip, world.stops, world.stopActivities, world.expenses]
  );

  if (!trip) {
    return (
      <div className="glass rounded-3xl p-8 text-center max-w-md mx-auto my-12">
        <h2 className="font-display text-2xl font-bold">Trip Not Found</h2>
        <p className="mt-2 text-xs text-muted">Please select an existing trip to inspect its budget.</p>
        <Link to="/trips" className="mt-4 inline-block">
          <Button size="sm">Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  // Adjust stay category with what-if slider
  const stayCost = (spend.byCat.stay || 0) * (1 - stayReduction / 100);
  const transportCost = spend.byCat.transport || 0;
  const activitiesCost = spend.byCat.activities || 0;
  const mealsCost = spend.byCat.meals || 0;

  const totalCalculated = transportCost + stayCost + activitiesCost + mealsCost;
  const totalConverted = convert(totalCalculated, currency);
  const capConverted = convert(trip.budget_cap || 150000, currency);

  const daysCount = Math.max(1, daysOf(trip.start_date, trip.end_date));
  const avgCostPerDay = totalConverted / daysCount;

  const isOverBudget = totalConverted > capConverted;

  const chartData = [
    { name: 'Transport', value: Math.round(convert(transportCost, currency)) },
    { name: 'Stay', value: Math.round(convert(stayCost, currency)) },
    { name: 'Activities', value: Math.round(convert(activitiesCost, currency)) },
    { name: 'Meals', value: Math.round(convert(mealsCost, currency)) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Trip Budget & Cost Breakdown
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-display text-3xl font-bold tracking-tight text-parchment">
              Trip Budget: {trip.name}
            </h1>
            {/* Trip switcher */}
            <select
              aria-label="Switch Trip"
              className="rounded-xl border border-border/50 bg-ink px-2.5 py-1 text-xs text-saffron outline-none cursor-pointer"
              value={trip.id}
              onChange={(e) => nav(`/trips/${e.target.value}/budget`)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-ink text-parchment">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted mt-1">
            Financial summary and category allocation for your {daysCount}-day itinerary.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Currency:</span>
          <div className="flex rounded-xl border border-border/50 bg-white/5 p-1 gap-1">
            {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  currency === c
                    ? 'bg-saffron text-ink font-semibold'
                    : 'text-muted hover:text-parchment'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation: Radar & Allocations vs Settle Up & Splits */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveBudgetTab('radar')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeBudgetTab === 'radar'
              ? 'bg-saffron text-slate-950 shadow-glow'
              : 'text-muted hover:text-parchment hover:bg-white/5 border border-border/50'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Radar & Allocations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBudgetTab('settle')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeBudgetTab === 'settle'
              ? 'bg-saffron text-slate-950 shadow-glow'
              : 'text-muted hover:text-parchment hover:bg-white/5 border border-border/50'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>🤝 Settle Up & Auto Splits</span>
          <span className="rounded-full bg-aurora/20 px-2 py-0.5 font-mono text-[9px] font-bold text-aurora">
            Crew Live
          </span>
        </button>
      </div>

      {/* Settle Up Tab Content */}
      {activeBudgetTab === 'settle' && (
        <SettleUpTab tripId={trip.id} />
      )}

      {/* Radar & Allocations Content */}
      {activeBudgetTab === 'radar' && (
        <>
          {/* Overbudget Alert Banner */}
          {isOverBudget ? (
            <div className="flex items-start gap-3 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-coral">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-sm">Overbudget Alert Flagged</p>
            <p>
              Your estimated expenses ({money(totalConverted, currency)}) exceed your budget cap of{' '}
              {money(capConverted, currency)} by {money(totalConverted - capConverted, currency)}.
            </p>
            <p className="text-coral/80 pt-1">
              💡 Tip: Use the "What-If" slider below to simulate reducing accommodation spending or swap paid experiences.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-aurora/40 bg-aurora/10 p-3.5 text-aurora text-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Trip expenses are well within your planned budget cap ({money(totalConverted, currency)} / {money(capConverted, currency)}).
          </span>
        </div>
      )}

      {/* KPI Highlights: Budget Gauge & Averages */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-3xl p-5 border border-border/50 shadow-md">
          <p className="text-xs text-muted">Total Estimated Cost</p>
          <p className="mt-2 font-mono text-3xl font-bold text-saffron">
            {money(totalConverted, currency)}
          </p>
          <p className="mt-1 text-xs text-muted">Cap: {money(capConverted, currency)}</p>
        </div>

        <div className="glass rounded-3xl p-5 border border-border/50 shadow-md">
          <p className="text-xs text-muted">Average Cost Per Day</p>
          <p className="mt-2 font-mono text-3xl font-bold text-aurora">
            {money(avgCostPerDay, currency)}
          </p>
          <p className="mt-1 text-xs text-muted">Calculated over {daysCount} itinerary days</p>
        </div>

        <div className="glass rounded-3xl p-5 border border-border/50 shadow-md">
          <p className="text-xs text-muted">Budget Utilization</p>
          <p className="mt-2 font-mono text-3xl font-bold text-parchment">
            {Math.round((totalConverted / (capConverted || 1)) * 100)}%
          </p>
          <p className="mt-1 text-xs text-muted">
            {isOverBudget ? 'Over allocated by ' + Math.round(((totalConverted - capConverted) / capConverted) * 100) + '%' : 'Healthy margin'}
          </p>
        </div>
      </div>

      {/* Budget Progress Gauge */}
      <div className="glass rounded-3xl p-5 border border-border/50 shadow-md">
        <h2 className="font-display text-base font-bold text-parchment mb-3">Budget Utilization Gauge</h2>
        <BudgetGauge used={totalConverted} cap={capConverted} />
      </div>

      {/* What-If Simulation Slider */}
      <div className="glass rounded-3xl p-5 border border-border/40 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-parchment flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-saffron" />
              What-If Analysis: Adjust Stay Expenses
            </h3>
            <p className="text-xs text-muted">Simulate savings by choosing budget hotels or holiday rentals</p>
          </div>
          <span className="font-mono text-sm text-saffron font-bold">-{stayReduction}% on Stay</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={stayReduction}
          onChange={(e) => setStayReduction(Number(e.target.value))}
          className="mt-4 w-full accent-saffron"
        />
      </div>

      {/* Category Cost Breakdown Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {chartData.map((c, i) => (
          <div key={c.name} className="glass rounded-2xl p-4 border border-border/40">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-xs font-semibold text-parchment">{c.name}</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-parchment">
              {money(c.value, currency)}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {Math.round((c.value / (totalConverted || 1)) * 100)}% of total spend
            </p>
          </div>
        ))}
      </div>

      {/* Interactive Recharts: Pie & Bar Charts */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-md">
        <h2 className="font-display text-xl font-bold text-parchment mb-4">Financial Visualizations</h2>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-mono text-muted mb-2 text-center">Category Breakdown (Pie Chart)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => money(val, currency)}
                      contentStyle={{ backgroundColor: '#0e1118', borderColor: '#242b3d', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-muted mb-2 text-center">Category Expenses (Bar Chart)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#9aa3c7" fontSize={11} />
                    <YAxis stroke="#9aa3c7" fontSize={11} />
                    <Tooltip
                      formatter={(val) => money(val, currency)}
                      contentStyle={{ backgroundColor: '#0e1118', borderColor: '#242b3d', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" fill="#FFB02E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Suspense>
      </div>

      {/* City-by-City Budget Breakdown for Input Cities */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-aurora font-semibold">
                Input Cities Allocation
              </span>
              <span className="rounded-full bg-saffron/20 px-2 py-0.5 font-mono text-[10px] text-saffron font-bold">
                {spend.cityBreakdown?.length || 0} {spend.cityBreakdown?.length === 1 ? 'City' : 'Cities'}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-parchment">
              City-by-City Budget Breakdown
            </h2>
            <p className="text-xs text-muted">
              Estimated budget dynamically generated from your input cities, duration of stay, and daily cost index.
            </p>
          </div>

          <Link to={`/trips/${trip.id}/build`}>
            <Button size="sm" variant="outline" className="text-xs">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-saffron" /> Manage Cities in Builder
            </Button>
          </Link>
        </div>

        {(!spend.cityBreakdown || spend.cityBreakdown.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center text-xs text-muted space-y-2">
            <p className="text-sm font-semibold text-parchment">No Input Cities Added Yet</p>
            <p>Add destinations to this trip in the Itinerary Builder to automatically calculate your city-by-city budget.</p>
            <Link to={`/trips/${trip.id}/build`} className="inline-block pt-2">
              <Button size="sm">Add Input Cities →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spend.cityBreakdown.map((item, idx) => {
              const cityTotalConverted = convert(item.total, currency);
              const percent = Math.round((item.total / (spend.total || 1)) * 100);

              return (
                <div
                  key={item.stop?.id || idx}
                  className="glass group overflow-hidden rounded-2xl border border-border/40 transition-all hover:border-saffron/40 flex flex-col justify-between"
                >
                  <div>
                    {/* City Image Header */}
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={item.city?.image}
                        alt={item.city?.name || 'City'}
                        onError={(e) => onImgError(e, item.city?.name)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-saffron font-bold">
                        Cost Index: {item.costIndex}/5
                      </div>
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <div>
                          <p className="font-display text-base font-bold text-parchment flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-aurora" />
                            {item.city?.name || 'Destination'}
                          </p>
                          <p className="text-[10px] text-muted">{item.city?.country}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-parchment">
                          {item.days} {item.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-muted">
                        <span className="flex items-center gap-1.5">🏨 Stay / Hotel:</span>
                        <span className="font-mono text-parchment font-medium">{money(convert(item.stay, currency), currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted">
                        <span className="flex items-center gap-1.5">🍽️ Meals & Dining:</span>
                        <span className="font-mono text-parchment font-medium">{money(convert(item.meals, currency), currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted">
                        <span className="flex items-center gap-1.5">🚕 Transport & Transit:</span>
                        <span className="font-mono text-parchment font-medium">{money(convert(item.transport, currency), currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-muted">
                        <span className="flex items-center gap-1.5">🎯 Activities & Tours:</span>
                        <span className="font-mono text-parchment font-medium">{money(convert(item.activities, currency), currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* City Total Footer */}
                  <div className="p-3.5 pt-2 border-t border-border/30 flex items-center justify-between bg-white/[0.02]">
                    <div>
                      <span className="text-[10px] text-muted uppercase font-mono">City Total</span>
                      <p className="font-mono text-base font-bold text-saffron">{money(cityTotalConverted, currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingCity(item.city)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-saffron/15 text-saffron text-xs font-semibold hover:bg-saffron hover:text-slate-950 transition-all cursor-pointer"
                        title="Book Hotels & Dining in this city"
                      >
                        <Hotel className="h-3.5 w-3.5" />
                        <span>Book Stay / Eats</span>
                      </button>
                      <span className="rounded-full bg-saffron/15 px-2 py-0.5 font-mono text-[10px] text-saffron font-bold">
                        {percent}% of trip
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {/* Book Stays & Dining Modal */}
      <BookStaysModal
        isOpen={Boolean(bookingCity)}
        onClose={() => setBookingCity(null)}
        city={bookingCity}
        trip={trip}
      />

      {/* Action links */}
      <div className="flex gap-3 text-xs">
        <Link to={`/trips/${trip.id}`} className="text-saffron hover:underline font-medium">
          ← Back to Itinerary View
        </Link>
        <span className="text-muted">·</span>
        <Link to={`/trips/${trip.id}/build`} className="text-muted hover:text-parchment">
          Edit Stops in Builder
        </Link>
      </div>
    </div>
  );
}
