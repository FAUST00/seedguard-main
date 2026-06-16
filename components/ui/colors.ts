/**
 * Accent color token map — the single source of truth for theme-colored UI.
 *
 * IMPORTANT: every value here is a COMPLETE, literal Tailwind class string.
 * This is deliberate. Tailwind's JIT compiler scans source statically, so
 * dynamically built classes like `border-${color}/20` are never generated
 * and silently render with no color. Keeping full literal strings in this map
 * guarantees Tailwind emits them. Never interpolate color names into classes.
 */
export type Accent = 'primary' | 'secondary' | 'accent' | 'destructive' | 'gold';

export interface AccentTokens {
  border: string;
  borderHover: string;
  bgSoft: string;
  bgHover: string;
  text: string;
  gradientFrom: string;
  barFill: string;  // strong solid fill for progress bars
  neonText: string; // '' when no neon utility exists for this accent
  neonBox: string;  // '' when no neon utility exists for this accent
}

export const ACCENT: Record<Accent, AccentTokens> = {
  primary: {
    border: 'border-primary/20',
    borderHover: 'hover:border-primary/50',
    bgSoft: 'bg-primary/10',
    bgHover: 'hover:bg-primary/20',
    text: 'text-primary',
    gradientFrom: 'from-primary/5',
    barFill: 'bg-primary/70',
    neonText: 'neon-text-pink',
    neonBox: 'neon-box-pink',
  },
  secondary: {
    border: 'border-secondary/20',
    borderHover: 'hover:border-secondary/50',
    bgSoft: 'bg-secondary/10',
    bgHover: 'hover:bg-secondary/20',
    text: 'text-secondary',
    gradientFrom: 'from-secondary/5',
    barFill: 'bg-secondary/70',
    neonText: 'neon-text-cyan',
    neonBox: 'neon-box-cyan',
  },
  accent: {
    border: 'border-accent/20',
    borderHover: 'hover:border-accent/50',
    bgSoft: 'bg-accent/10',
    bgHover: 'hover:bg-accent/20',
    text: 'text-accent',
    gradientFrom: 'from-accent/5',
    barFill: 'bg-accent/70',
    neonText: '',
    neonBox: '',
  },
  destructive: {
    border: 'border-destructive/20',
    borderHover: 'hover:border-destructive/50',
    bgSoft: 'bg-destructive/10',
    bgHover: 'hover:bg-destructive/20',
    text: 'text-destructive',
    gradientFrom: 'from-destructive/5',
    barFill: 'bg-destructive/70',
    neonText: '',
    neonBox: '',
  },
  gold: {
    border: 'border-gold/20',
    borderHover: 'hover:border-gold/50',
    bgSoft: 'bg-gold/10',
    bgHover: 'hover:bg-gold/20',
    text: 'text-gold',
    gradientFrom: 'from-gold/5',
    barFill: 'bg-gold/70',
    neonText: 'neon-text-gold',
    neonBox: 'neon-box-gold',
  },
};
