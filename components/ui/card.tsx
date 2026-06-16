import { cn } from '@/lib/cn';
import { ACCENT, type Accent } from './colors';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent color for the border + hover. Omit for a neutral primary-tinted card. */
  accent?: Accent;
  /** Add a neon glow box-shadow in the accent color. */
  glow?: boolean;
  /** Lift + glow on hover (for clickable/interactive cards). */
  interactive?: boolean;
  /** Padding scale. Defaults to 'md'. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 md:p-8',
};

/**
 * The one card shell used across the whole app. Glass background, themed
 * border, optional neon glow. Replaces hand-rolled
 * `rounded-xl border border-X/20 bg-background/50 backdrop-blur-sm` blocks.
 */
export function Card({
  accent = 'primary',
  glow = false,
  interactive = false,
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  const tokens = ACCENT[accent];
  return (
    <div
      className={cn(
        'rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-300',
        tokens.border,
        PADDING[padding],
        glow && tokens.neonBox,
        interactive && cn('hover:-translate-y-0.5', tokens.borderHover, `hover:shadow-lg`),
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
