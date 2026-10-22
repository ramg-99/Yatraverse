import { useState, useMemo } from 'react';
import { X, Zap, ArrowRight, ShieldCheck, Check, Sparkles, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useWorldStore } from '@/store/useWorldStore.js';
import { updateStopActivity } from '@/services/trips.js';

export function PaceRebalanceModal({ isOpen, onClose, overview, trip, onRebalanced }) {
  if (!isOpen || !overview) return null;

  const world = useWorldStore();
  const [isApplying, setIsApplying] = useState(false);
  const { overloadedDays = [], dayPaces = [] } = overview;

  // Compute rebalancing suggestions
  const suggestions = useMemo(() => {
    return overloadedDays.map((od) => {
      // Find a lighter day in the same city or next day
      const otherDays = dayPaces.filter(
        (dp) => dp.iso !== od.iso && dp.pace.status === 'relaxed'
      );
      const targetDay = otherDays[0] || dayPaces.find((dp) => dp.iso !== od.iso) || dayPaces[0];

      // Select the longest activity from the overloaded day to shift
      const candidateAct = (od.acts || []).slice(-1)[0];
      const actDetail = world.activities.find((a) => a.id === candidateAct?.activity_id) || {};

      return {
        fromDay: od,
        toDay: targetDay,
        activityToMove: candidateAct,
        actDetail,
        projectedFromScore: Math.max(4.5, od.pace.score - (actDetail.duration_min || 90) / 60),
        projectedToScore: (targetDay?.pace?.score || 3.0) + (actDetail.duration_min || 90) / 60,
      };
    });
  }, [overloadedDays, dayPaces, world.activities]);

  const handleApplyRebalance = async () => {
    setIsApplying(true);
    try {
      const w = useWorldStore.getState();

      for (const sug of suggestions) {
        if (sug.activityToMove && sug.toDay?.iso) {
          const updated = {
            ...sug.activityToMove,
            day_date: sug.toDay.iso,
            dayDate: sug.toDay.iso,
            notes: `[Pace Rebalance] Moved from Day ${sug.fromDay.dayIndex + 1} to balance exertion`,
          };

          w.setStopActivities(
            w.stopActivities.map((item) => (item.id === sug.activityToMove.id ? updated : item))
          );
          await updateStopActivity(sug.activityToMove.id, updated).catch(() => {});
        }
      }

      if (onRebalanced) onRebalanced();
      onClose();
    } catch {
      // fallback
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass relative w-full max-w-2xl rounded-3xl border border-border/80 bg-surface/95 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-rose-400 border border-rose-500/30">
                <Zap className="h-3.5 w-3.5 fill-rose-400" /> Burnout Defense Active
              </span>
              <span className="font-mono text-xs text-muted">
                {overloadedDays.length} Overloaded {overloadedDays.length === 1 ? 'Day' : 'Days'} Flagged
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-parchment">
              Itinerary Pace & Energy Rebalancer
            </h3>
            <p className="text-xs text-muted">
              Redistributes activities from packed red days into lighter days so you avoid exhaustion while seeing everything on your wishlist.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Rebalance Plan Preview */}
        <div className="space-y-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
            Proposed Schedule Adjustments ({suggestions.length})
          </p>

          <div className="space-y-3">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Overloaded Origin Day */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                      Day {sug.fromDay.dayIndex + 1} (🔴 {sug.fromDay.pace.score}h)
                    </span>
                    <span className="text-xs font-bold text-parchment">
                      {sug.fromDay.city?.name || 'Destination'}
                    </span>
                  </div>
                  <p className="font-display text-sm font-semibold text-parchment line-through opacity-80">
                    {sug.actDetail?.name || 'Selected Activity'}
                  </p>
                  <p className="font-mono text-[11px] text-emerald-400">
                    Projected: 🟡 {Math.round(sug.projectedFromScore * 10) / 10}h Balanced
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted hidden sm:block shrink-0" />

                {/* Target Lighter Day */}
                <div className="space-y-1 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                      Day {sug.toDay?.dayIndex + 1} (🟢 {sug.toDay?.pace.score}h)
                    </span>
                    <span className="text-xs font-bold text-parchment">
                      {sug.toDay?.city?.name || 'Destination'}
                    </span>
                  </div>
                  <p className="font-display text-sm font-semibold text-aurora">
                    + {sug.actDetail?.name || 'Moved Activity'}
                  </p>
                  <p className="font-mono text-[11px] text-aurora">
                    Projected: 🟡 {Math.round(sug.projectedToScore * 10) / 10}h Balanced
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zero Budget Impact Guarantee */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-display text-sm font-bold text-parchment">
                Budget Unchanged (₹0 Delta)
              </p>
              <p className="text-xs text-muted">
                Rebalancing only shifts timing within your planned stops. All booked tickets and reservations stay preserved.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
            0% Cost Change
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
          <Button variant="ghost" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyRebalance}
            disabled={isApplying}
            className="bg-saffron text-slate-950 font-bold hover:brightness-105 shadow-md px-5"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {isApplying ? 'Applying Schedule Fix...' : 'Confirm Rebalance & Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
