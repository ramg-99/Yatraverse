import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-ink/40 px-3 font-sans text-sm text-parchment placeholder:text-muted',
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
        'min-h-[96px] w-full rounded-xl border border-border bg-ink/40 px-3 py-2 text-sm text-parchment placeholder:text-muted',
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label className={cn('mb-1 block text-xs font-medium uppercase tracking-wide text-muted', className)} {...props}>
      {children}
    </label>
  );
}
