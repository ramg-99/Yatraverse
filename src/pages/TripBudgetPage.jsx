import { useMemo, useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useSettingsStore } from '@/store/useSettingsStore.js';
import { spendFor, daysOf } from '@/lib/tripView.js';
import { BudgetGauge } from '@/components/charts/BudgetGauge.jsx';
import { convert } from '@/lib/fx.js';
import { money } from '@/lib/utils.js';
import { Button } from '@/components/ui/button.jsx';

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
  const trip = useWorldStore((s) => s.trips.find((t) => t.id === id));
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const [cut, setCut] = useState(0);
  const spend = useMemo(() => (trip ? spendFor(trip.id) : { byCat: {}, total: 0 }), [trip]);
  if (!trip) return <p>No budget.</p>;

  const stay = spend.byCat.stay * (1 - cut / 100);
  const total = spend.total - spend.byCat.stay + stay;
  const pie = Object.entries({ ...spend.byCat, stay }).map(([name, value]) => ({ name, value: convert(value, currency) }));
  const days = daysOf(trip.start_date, trip.end_date);
  const over = total > trip.budget_cap;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Budget burn</h1>
        <div className="flex gap-2">
          {['INR', 'USD', 'EUR'].map((c) => (
            <Button key={c} size="sm" variant={currency === c ? 'solid' : 'outline'} onClick={() => setCurrency(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>
      <BudgetGauge used={total} cap={trip.budget_cap} />
      <p className="font-mono">
        Avg / day {money(convert(total / days, currency), currency)} · cap {money(convert(trip.budget_cap, currency), currency)}
      </p>
      {over ? (
        <p className="rounded-xl bg-coral/20 p-3 text-sm text-coral">
          Overbudget days flagged. Suggestion: drop stay {cut || 15}% or swap two dining nights for hawker meals.
        </p>
      ) : null}
      <label className="block text-sm">
        What-if: reduce stay by {cut}%
        <input type="range" min="0" max="40" value={cut} onChange={(e) => setCut(Number(e.target.value))} className="ml-3 w-48" />
      </label>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {pie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={pie}>
                <XAxis dataKey="name" stroke="#9aa3c7" />
                <YAxis stroke="#9aa3c7" />
                <Tooltip />
                <Bar dataKey="value" fill="#FFB02E" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
