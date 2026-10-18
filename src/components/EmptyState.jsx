import { Stamp } from 'lucide-react';
import { cn } from '@/lib/utils.js';

/**
 * @param {{ title: string, hint?: string, action?: import('react').ReactNode, className?: string }} props
 */
export function EmptyState({ title, hint, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed border-saffron/50 text-saffron animate-stamp">
          <Stamp className="h-10 w-10" />
        </div>
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      {hint ? <p className="max-w-sm text-sm text-muted">{hint}</p> : null}
      {action}
    </div>
  );
}
