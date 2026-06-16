import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'accent' | 'destructive' | 'gold' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Full literal class strings per variant (see colors.ts for why).
const VARIANT: Record<Variant, string> = {
  primary:     'border-2 border-primary/85 bg-primary/55 text-white hover:bg-primary/70 neon-box-pink',
  secondary:   'border-2 border-secondary/65 bg-secondary/25 text-secondary hover:bg-secondary/40',
  accent:      'border-2 border-accent/60 bg-accent/20 text-accent hover:bg-accent/35',
  destructive: 'border-2 border-destructive/60 bg-destructive/15 text-destructive hover:bg-destructive/30',
  gold:        'border-2 border-gold/65 bg-gold/20 text-gold hover:bg-gold/35',
  outline:     'border-2 border-white/30 bg-white/10 text-white hover:bg-white/20',
  ghost:       'border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2',
};

/**
 * Unified button. Consistent radius, weight, focus ring, active press,
 * and disabled state across every variant.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider',
        'transition-all duration-200 active:scale-95',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
