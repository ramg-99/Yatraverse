import { Activity, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export function TripPaceOverview({ overview, onAutoRebalance }) {
  if (!overview) return null;

  const {
    averageScore,
    overallStatus,
    relaxedCount,
    balancedCount,
    exhaustingCount,
    balancePercent,
    overloadedDays,
  } = overview;

  return (
    <div className="glass rounded-3xl border border-border/60 p-5 shadow-sm space-y-3.5 bg-gradient-to-br from-surface via-surface to-accent/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-aurora font-semibold flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>Trip Pace Meter & Burnout Guard</span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                overallStatus === 'exhausting'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {balancePercent}% Balanced
            </span>
          </div>

          <h2 className="mt-1 font-display text-lg font-bold text-parchment flex items-center gap-2">
            <span>Overall Rhythm:</span>
            <span
              className={
                overallStatus === 'exhausting'
                  ? 'text-rose-400'
                  : overallStatus === 'relaxed'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }
            >
              {overallStatus === 'exhausting'
                ? 'High Burnout Risk'
                : overallStatus === 'relaxed'
                ? 'Gentle & Relaxing'
                : 'Well-Paced Adventure'}
            </span>
            <span className="font-mono text-xs text-muted font-normal">
              (Avg {averageScore}h daily exertion)
            </span>
          </h2>
        </div>

        {/* Action Button */}
        {exhaustingCount > 0 && onAutoRebalance && (
          <Button
            size="sm"
            onClick={onAutoRebalance}
            className="bg-saffron text-slate-950 font-bold hover:brightness-105 shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Auto-Rebalance Overloaded Days
          </Button>
        )}
      </div>

      {/* Segmented Pace Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${(relaxedCount / (relaxedCount + balancedCount + exhaustingCount || 1)) * 100}%` }}
            title={`${relaxedCount} Relaxed Days`}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${(balancedCount / (relaxedCount + balancedCount + exhaustingCount || 1)) * 100}%` }}
            title={`${balancedCount} Balanced Days`}
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{ width: `${(exhaustingCount / (relaxedCount + balancedCount + exhaustingCount || 1)) * 100}%` }}
            title={`${exhaustingCount} Overloaded Days`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-muted font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{relaxedCount} Relaxed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{balancedCount} Balanced</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{exhaustingCount} Overloaded</span>
            </span>
          </div>

          <div>
            {exhaustingCount > 0 ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Day {overloadedDays.map((d) => d.dayIndex + 1).join(', ')} flagged for rest</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Zero burnout days detected</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
