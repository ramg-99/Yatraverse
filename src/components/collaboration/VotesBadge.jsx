import { useMemo } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { useWorldStore } from '@/store/useWorldStore.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { cn } from '@/lib/utils.js';

export function VotesBadge({ tripId, stopActivityId, activityId, onAiResolve }) {
  const world = useWorldStore();
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || 'u_demo';

  const votes = world.votes || [];

  // Filter votes for this activity
  const actVotes = useMemo(() => {
    return votes.filter(
      (v) =>
        v.trip_id === tripId &&
        ((stopActivityId && v.stop_activity_id === stopActivityId) ||
          (!stopActivityId && v.activity_id === activityId))
    );
  }, [votes, tripId, stopActivityId, activityId]);

  const upvotes = actVotes.filter((v) => v.value > 0);
  const downvotes = actVotes.filter((v) => v.value < 0);
  const score = upvotes.length - downvotes.length;

  const myVote = actVotes.find((v) => v.user_id === currentUserId)?.value || 0;

  const handleVote = (e, val) => {
    e.stopPropagation();
    world.castVote(tripId, stopActivityId, activityId, currentUserId, val);
  };

  // Get names of upvoters & downvoters for tooltip
  const upNames = upvotes
    .map((v) => world.users.find((u) => u.id === v.user_id)?.name?.split(' ')[0] || 'Member')
    .join(', ');
  const downNames = downvotes
    .map((v) => world.users.find((u) => u.id === v.user_id)?.name?.split(' ')[0] || 'Member')
    .join(', ');

  const hasConflict = downvotes.length >= 2 || score < 0;

  return (
    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
      {/* Group Conflict Indicator if heavily downvoted */}
      {hasConflict && (
        <span
          className="inline-flex items-center gap-1 rounded-md bg-coral/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-coral border border-coral/40"
          title={`Group Conflict: ${downvotes.length} members voted against (${downNames})`}
        >
          <AlertCircle className="h-2.5 w-2.5 stroke-[2.5]" />
          <span>-{downvotes.length} Conflict</span>
        </span>
      )}

      {/* Upvote Button */}
      <button
        type="button"
        onClick={(e) => handleVote(e, 1)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-mono font-semibold transition-all cursor-pointer',
          myVote === 1
            ? 'bg-amber-400/25 text-amber-400 border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.3)] scale-105'
            : 'bg-white/5 text-muted hover:text-parchment hover:bg-white/10 border border-border/40'
        )}
        title={upNames ? `Upvoted by: ${upNames}` : 'Upvote this experience'}
      >
        <ThumbsUp className={cn('h-3 w-3', myVote === 1 && 'fill-amber-400')} />
        <span>{upvotes.length}</span>
      </button>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={(e) => handleVote(e, -1)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-mono font-semibold transition-all cursor-pointer',
          myVote === -1
            ? 'bg-coral/25 text-coral border border-coral/60 shadow-[0_0_8px_rgba(239,68,68,0.3)] scale-105'
            : 'bg-white/5 text-muted hover:text-parchment hover:bg-white/10 border border-border/40'
        )}
        title={downNames ? `Downvoted by: ${downNames}` : 'Downvote this experience'}
      >
        <ThumbsDown className={cn('h-3 w-3', myVote === -1 && 'fill-coral')} />
        <span>{downvotes.length}</span>
      </button>

      {/* Net Score Pill */}
      <span
        className={cn(
          'min-w-[22px] rounded-md px-1 py-0.5 text-center font-mono text-[10px] font-bold',
          score > 0
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : score < 0
            ? 'bg-coral/20 text-coral border border-coral/30'
            : 'bg-white/5 text-muted border border-border/40'
        )}
        title={`Net Score: ${score > 0 ? '+' + score : score}`}
      >
        {score > 0 ? `+${score}` : score}
      </span>
    </div>
  );
}
