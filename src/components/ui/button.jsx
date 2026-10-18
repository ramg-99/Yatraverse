import { cn } from '@/lib/utils.js';

/**
 * @param {{ variant?: 'solid'|'ghost'|'outline'|'coral', size?: 'sm'|'md'|'lg', className?: string, children: import('react').ReactNode } & import('react').ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({
  variant = 'solid',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}) {
  const variants = {
    solid: 'bg-saffron text-ink hover:brightness-110 shadow-glow',
    ghost: 'bg-transparent hover:bg-white/5 text-parchment',
    outline: 'border border-border bg-transparent hover:border-saffron/60',
    coral: 'bg-coral text-white hover:brightness-110',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
