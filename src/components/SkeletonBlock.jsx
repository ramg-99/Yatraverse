import { cn } from '@/lib/utils.js';

export function SkeletonBlock({ className }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/10', className)} />;
}

export function SkeletonPage() {
  return (
    <div className="grid gap-4 p-4 md:p-8">
      <SkeletonBlock className="h-10 w-1/3" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <p className="font-display text-xl text-coral">The atlas flickered.</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-4 text-sm text-saffron underline">
          Try the jump again
        </button>
      ) : null}
    </div>
  );
}
