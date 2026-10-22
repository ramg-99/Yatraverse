import { Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function PaceMeterBadge({ pace, onRebalance }) {
  if (!pace) return null;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Pace Pill */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold border transition-all ${pace.bg} ${pace.border} ${pace.text}`}
        title={`Pace Score: ${pace.score}/10 (${pace.activeHours}h activities + ${pace.travelHours}h transit)`}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pace.color }} />
        <span>{pace.badge}</span>
        <span className="text-[10px] opacity-80 font-normal">({pace.score}h)</span>
      </div>

      {/* Burnout Risk Quick Fix Button */}
      {pace.isOverloaded && onRebalance && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRebalance();
          }}
          className="inline-flex items-center gap-1 rounded-full bg-rose-500/25 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-300 border border-rose-500/40 hover:bg-rose-500/35 transition-colors cursor-pointer"
          title="Day is overloaded with activities. Rebalance to reduce burnout risk."
        >
          <Zap className="h-2.5 w-2.5 fill-rose-400 text-rose-400" />
          <span>Rebalance ⚡</span>
        </button>
      )}
    </div>
  );
}
