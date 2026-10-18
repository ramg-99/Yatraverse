import { cn } from '@/lib/utils.js';

/**
 * @param {{ used: number, cap: number, className?: string }} props
 */
export function BudgetGauge({ used, cap, className }) {
  const pct = Math.min(140, Math.round((used / Math.max(cap, 1)) * 100));
  const over = used > cap;
  return (
    <div className={cn('glass rounded-2xl p-5', className)}>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Fuel gauge</p>
      <p className="font-display text-3xl">{pct}%</p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all', over ? 'bg-coral' : 'bg-aurora')}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted">
        {over ? 'Overbudget — the constellation is running hot.' : 'Within envelope. Keep a night unplanned.'}
      </p>
    </div>
  );
}
