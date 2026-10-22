import { useMemo, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ThumbsDown, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { useWorldStore } from '@/store/useWorldStore.js';
import { money } from '@/lib/utils.js';
import { onImgError } from '@/lib/image.js';

export function AiConsensusModal({ isOpen, onClose, tripId }) {
  const world = useWorldStore();
  const [swappedIds, setSwappedIds] = useState([]);

  // Find all conflicts in this trip
  const conflicts = useMemo(() => {
    if (!tripId) return [];

    const tripStops = world.stops.filter((s) => s.trip_id === tripId);
    const stopIds = tripStops.map((s) => s.id);
    const tripStopActs = world.stopActivities.filter((sa) => stopIds.includes(sa.stop_id));

    const votes = world.votes || [];

    const list = [];

    tripStopActs.forEach((sa) => {
      const act = world.activities.find((a) => a.id === sa.activity_id);
      const stop = tripStops.find((s) => s.id === sa.stop_id);
      const city = world.cities.find((c) => c.id === (stop?.city_id || stop?.cityId));

      const saVotes = votes.filter(
        (v) => v.trip_id === tripId && v.stop_activity_id === sa.id
      );

      const up = saVotes.filter((v) => v.value > 0);
      const down = saVotes.filter((v) => v.value < 0);
      const score = up.length - down.length;

      // If score is negative or at least 2 members voted against
      if (score < 0 || down.length >= 2) {
        // Find alternative activities in the same city not yet assigned
        const assignedActIds = tripStopActs.map((x) => x.activity_id);
        const alternatives = world.activities.filter(
          (a) => a.cityId === city?.id && !assignedActIds.includes(a.id)
        );

        // Best alternative (highest rating / popular)
        const bestAlt = alternatives.sort((a, b) => b.rating - a.rating)[0] || world.activities.find((a) => a.cityId === city?.id && a.id !== act?.id);

        const downNames = down
          .map((v) => world.users.find((u) => u.id === v.user_id)?.name?.split(' ')[0] || 'Member')
          .join(', ');

        list.push({
          stopActivity: sa,
          currentActivity: act,
          stop,
          city,
          upvotes: up.length,
          downvotes: down.length,
          downNames,
          score,
          recommendedAlt: bestAlt,
          rationale: `${down.length} of ${up.length + down.length} crew members voted against "${act?.name}". Based on group preference for experiential outings in ${city?.name || 'this city'}, Yatra AI recommends swapping it for "${bestAlt?.name}".`,
        });
      }
    });

    return list;
  }, [tripId, world.stops, world.stopActivities, world.votes, world.activities, world.cities, world.users]);

  if (!isOpen) return null;

  const handleSwap = (conflict) => {
    if (!conflict.recommendedAlt) return;

    // Update stopActivity with new activity ID
    const updatedStopActivities = world.stopActivities.map((sa) => {
      if (sa.id === conflict.stopActivity.id) {
        return {
          ...sa,
          activity_id: conflict.recommendedAlt.id,
          cost_override: conflict.recommendedAlt.cost,
        };
      }
      return sa;
    });

    world.setStopActivities(updatedStopActivities);

    // Cast a consensus upvote for the new activity from demo user
    world.castVote(tripId, conflict.stopActivity.id, conflict.recommendedAlt.id, 'u_demo', 1);

    setSwappedIds((prev) => [...prev, conflict.stopActivity.id]);
    toast.success(`Consensus applied! Swapped to ${conflict.recommendedAlt.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass relative w-full max-w-2xl rounded-3xl border border-aurora/40 bg-surface/95 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted hover:bg-white/10 hover:text-parchment transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora/20 to-teal-500/20 text-aurora border border-aurora/40 shadow-glow">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-parchment">
                AI Group Consensus Resolver
              </h2>
              <span className="rounded-full bg-aurora/20 px-2 py-0.5 font-mono text-[10px] font-bold text-aurora">
                Gemini Optimizer
              </span>
            </div>
            <p className="text-xs text-muted">
              Yatra AI analyzes voting dissent and proposes crowd-pleasing alternatives
            </p>
          </div>
        </div>

        {/* Conflict List */}
        {conflicts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <h3 className="font-display text-lg font-bold text-parchment">
              Complete Group Harmony!
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              No itinerary items currently have negative votes. Your crew agrees on all planned experiences!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {conflicts.map((item) => {
              const isResolved = swappedIds.includes(item.stopActivity.id);

              return (
                <div
                  key={item.stopActivity.id}
                  className={`rounded-2xl border p-4.5 transition-all ${
                    isResolved
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-coral/40 bg-coral/5 shadow-xs'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral/20 text-coral">
                        <ThumbsDown className="h-3 w-3" />
                      </span>
                      <span className="font-mono text-xs font-bold text-coral">
                        Dissent Detected ({item.downvotes} against: {item.downNames})
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted">
                      {item.city?.name} · {item.stop?.start_date}
                    </span>
                  </div>

                  {/* AI Explanation Banner */}
                  <div className="rounded-xl border border-aurora/30 bg-aurora/10 p-3 mb-4 text-xs text-parchment leading-relaxed flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-aurora shrink-0 mt-0.5" />
                    <span>{item.rationale}</span>
                  </div>

                  {/* Comparison Side-by-Side Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Rejected Item */}
                    <div className="rounded-xl border border-border/50 bg-surface/50 p-3 text-xs opacity-70">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-coral font-bold block mb-1">
                        Current (Rejected by Group)
                      </span>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.currentActivity?.image}
                          alt=""
                          onError={(e) => onImgError(e, item.currentActivity?.name)}
                          className="h-10 w-10 rounded-lg object-cover grayscale"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-parchment truncate line-through">
                            {item.currentActivity?.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted">
                            Cost: {money(item.currentActivity?.cost || 0)} · Rating: {item.currentActivity?.rating}★
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Proposed Alternative */}
                    <div className="rounded-xl border border-aurora/50 bg-aurora/15 p-3 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-aurora font-bold block mb-1">
                        ✨ AI Recommended Swap
                      </span>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.recommendedAlt?.image}
                          alt=""
                          onError={(e) => onImgError(e, item.recommendedAlt?.name)}
                          className="h-10 w-10 rounded-lg object-cover border border-aurora/40"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-parchment truncate text-aurora">
                            {item.recommendedAlt?.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted">
                            Cost: {money(item.recommendedAlt?.cost || 0)} · Rating: {item.recommendedAlt?.rating}★
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swap Action Button */}
                  <div className="flex justify-end">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Consensus Resolved
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSwap(item)}
                        className="bg-aurora text-slate-950 font-bold hover:bg-aurora/90 shadow-glow"
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Apply Consensus Swap
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
