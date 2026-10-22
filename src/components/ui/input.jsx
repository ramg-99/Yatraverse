import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-surface px-3 font-sans text-sm font-medium text-parchment placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-saffron/50 shadow-sm transition-colors',
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[96px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-parchment placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-saffron/50 shadow-sm transition-colors',
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-parchment', className)} {...props}>
      {children}
    </label>
  );
}
