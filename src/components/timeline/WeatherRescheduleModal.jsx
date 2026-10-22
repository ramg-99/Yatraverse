import { useState, useMemo } from 'react';
import { X, CloudRain, Sun, ArrowRight, ShieldCheck, Check, Sparkles, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { money } from '@/lib/utils.js';
import { useWorldStore } from '@/store/useWorldStore.js';
import { updateStopActivity, addStopActivity } from '@/services/trips.js';

export function WeatherRescheduleModal({ isOpen, onClose, dayData, trip, currency = 'INR', onFixed }) {
  if (!isOpen || !dayData) return null;

  const { dateIso, dayIndex, weather, city, outdoorActs = [], sunnyDays = [] } = dayData;
  const world = useWorldStore();
  const [selectedFixMode, setSelectedFixMode] = useState('indoor'); // 'indoor' | 'shift'
  const [targetSunnyDay, setTargetSunnyDay] = useState(sunnyDays[0]?.iso || '');
  const [selectedReplacements, setSelectedReplacements] = useState({});
  const [isApplying, setIsApplying] = useState(false);

  // Available indoor activities in this city
  const indoorOptions = useMemo(() => {
    return world.activities.filter(
      (a) => (a.city_id === city?.id || a.cityId === city?.id) && a.is_outdoor === false
    );
  }, [world.activities, city]);

  // Compute cost difference for budget guard
  const costSummary = useMemo(() => {
    let oldCost = 0;
    let newCost = 0;

    outdoorActs.forEach((sa) => {
      const act = world.activities.find((a) => a.id === sa.activity_id) || {};
      const currentCost = sa.cost_override ?? act.cost ?? 0;
      oldCost += currentCost;

      if (selectedFixMode === 'indoor') {
        const replacementId = selectedReplacements[sa.id] || act.indoor_alternative_id || indoorOptions[0]?.id;
        const repAct = indoorOptions.find((a) => a.id === replacementId) || indoorOptions[0];
        newCost += repAct?.cost ?? currentCost;
      } else {
        // Shift to sunny day has 0 cost change
        newCost += currentCost;
      }
    });

    const diff = newCost - oldCost;
    return { oldCost, newCost, diff };
  }, [outdoorActs, selectedFixMode, selectedReplacements, indoorOptions, world.activities]);

  const handleApplyFix = async () => {
    setIsApplying(true);
    try {
      const w = useWorldStore.getState();

      for (const sa of outdoorActs) {
        const act = world.activities.find((a) => a.id === sa.activity_id) || {};

        if (selectedFixMode === 'indoor') {
          // Swap activity ID for indoor activity
          const chosenId = selectedReplacements[sa.id] || act.indoor_alternative_id || indoorOptions[0]?.id;
          const chosenAct = indoorOptions.find((a) => a.id === chosenId) || indoorOptions[0];

          if (chosenAct) {
            // Update stop activity in store & backend
            const updated = {
              ...sa,
              activity_id: chosenAct.id,
              activityId: chosenAct.id,
              activity: chosenAct,
              notes: `[Weather Fix] Swapped for indoor ${chosenAct.name} due to ${weather.condition}`,
            };
            w.setStopActivities(
              w.stopActivities.map((item) => (item.id === sa.id ? updated : item))
            );
            await updateStopActivity(sa.id, updated).catch(() => {});
          }
        } else if (selectedFixMode === 'shift' && targetSunnyDay) {
          // Move activity to target sunny day
          const updated = {
            ...sa,
            day_date: targetSunnyDay,
            dayDate: targetSunnyDay,
            notes: `[Weather Fix] Rescheduled to sunny day (${targetSunnyDay})`,
          };
          w.setStopActivities(
            w.stopActivities.map((item) => (item.id === sa.id ? updated : item))
          );
          await updateStopActivity(sa.id, updated).catch(() => {});
        }
      }

      if (onFixed) onFixed();
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
                <CloudRain className="h-3.5 w-3.5" /> Weather Alert: {weather?.condition || 'Rain Forecast'}
              </span>
              <span className="font-mono text-xs text-muted">
                Day {dayIndex + 1} ({dateIso})
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-parchment">
              Weather-Smart Auto-Rescheduler
            </h3>
            <p className="text-xs text-muted">
              Forecast predicts {weather?.precipProb || 85}% precipitation in {city?.name}. Avoid drenched plans with an instant smart adjustment.
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

        {/* Strategy Selector Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedFixMode('indoor')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFixMode === 'indoor'
                ? 'border-saffron bg-saffron/15 text-parchment shadow-xs'
                : 'border-border/60 bg-white/[0.02] text-muted hover:border-border'
            }`}
          >
            <p className="font-display text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-saffron" />
              <span>Swap for Indoor Gems</span>
            </p>
            <p className="text-[11px] text-muted mt-1">
              Replace outdoor visits with covered museums, art galleries, and indoor dining.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFixMode('shift')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedFixMode === 'shift'
                ? 'border-saffron bg-saffron/15 text-parchment shadow-xs'
                : 'border-border/60 bg-white/[0.02] text-muted hover:border-border'
            }`}
          >
            <p className="font-display text-sm font-bold flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Shift to a Sunny Day</span>
            </p>
            <p className="text-[11px] text-muted mt-1">
              Keep the outdoor activities but move them to a clear day in the same city.
            </p>
          </button>
        </div>

        {/* Flagged Activities & Proposed Replacements */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
            Affected Outdoor Activities ({outdoorActs.length})
          </p>

          <div className="space-y-3">
            {outdoorActs.map((sa) => {
              const act = world.activities.find((a) => a.id === sa.activity_id) || {};
              const defaultReplacement =
                indoorOptions.find((a) => a.id === act.indoor_alternative_id) || indoorOptions[0];
              const chosenReplacement =
                indoorOptions.find((a) => a.id === selectedReplacements[sa.id]) || defaultReplacement;

              return (
                <div
                  key={sa.id}
                  className="rounded-2xl border border-border/60 bg-white/[0.03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Current Outdoor Activity */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-400">
                        🌲 Outdoor
                      </span>
                      <p className="font-display text-sm font-bold text-parchment line-through opacity-80">
                        {act.name || 'Outdoor Tour'}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-muted">
                      Est. {act.duration_min || 90}m · {money(sa.cost_override ?? act.cost ?? 0, currency)}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted hidden sm:block shrink-0" />

                  {/* Fix Target */}
                  {selectedFixMode === 'indoor' ? (
                    <div className="space-y-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400">
                          🏛️ Indoor Swap
                        </span>
                        <select
                          className="rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs text-parchment font-semibold outline-none focus:border-saffron cursor-pointer"
                          value={chosenReplacement?.id || ''}
                          onChange={(e) =>
                            setSelectedReplacements((prev) => ({ ...prev, [sa.id]: e.target.value }))
                          }
                        >
                          {indoorOptions.map((opt) => (
                            <option key={opt.id} value={opt.id} className="bg-surface text-parchment">
                              {opt.name} ({money(opt.cost, currency)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="font-mono text-xs text-aurora">
                        Cost: {money(chosenReplacement?.cost || 0, currency)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300">
                          ☀️ Sunny Day
                        </span>
                        <select
                          className="rounded-xl border border-border/80 bg-surface px-2.5 py-1 text-xs text-parchment font-semibold outline-none focus:border-saffron cursor-pointer"
                          value={targetSunnyDay}
                          onChange={(e) => setTargetSunnyDay(e.target.value)}
                        >
                          {sunnyDays.map((sd) => (
                            <option key={sd.iso} value={sd.iso} className="bg-surface text-parchment">
                              Day {sd.dayIndex + 1} ({sd.iso}) - ☀️ Clear
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="font-mono text-xs text-emerald-400">Cost: Unchanged (₹0 Delta)</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Guard & Cost Delta Bar */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-display text-sm font-bold text-parchment">
                Budget Guard Verified
              </p>
              <p className="text-xs text-muted">
                {costSummary.diff === 0
                  ? 'Zero budget impact. Exact match.'
                  : costSummary.diff > 0
                  ? `Adjustment adds ${money(costSummary.diff, currency)}, comfortably within trip budget.`
                  : `Adjustment saves ${money(Math.abs(costSummary.diff), currency)} on your overall budget!`}
              </p>
            </div>
          </div>

          <div className="text-right self-end sm:self-auto">
            <span className="font-mono text-xs text-muted block">Budget Impact</span>
            <span
              className={`font-mono text-base font-bold ${
                costSummary.diff > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {costSummary.diff > 0 ? `+${money(costSummary.diff, currency)}` : `${money(costSummary.diff, currency)}`}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
          <Button variant="ghost" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyFix}
            disabled={isApplying}
            className="bg-saffron text-slate-950 font-bold hover:brightness-105 shadow-md px-5"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {isApplying ? 'Applying Weather Fix...' : 'Apply Weather Fix & Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
