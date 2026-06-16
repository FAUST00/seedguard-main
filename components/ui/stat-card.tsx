import { cn } from '@/lib/cn';
import { ACCENT, type Accent } from './colors';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: Accent;
  Icon?: LucideIcon;
  /** Stagger index for entry animation. */
  index?: number;
}

/**
 * Metric tile used in dashboard / streaks stat grids.
 *
 * Replaces the old inline version that built classes dynamically
 * (`border-${color}/20`, `text-${color}`…) which Tailwind purged, leaving
 * the cards colorless. All colors now come from the static ACCENT map.
 */
export function StatCard({ label, value, sub, accent = 'primary', Icon, index = 0 }: StatCardProps) {
  const t = ACCENT[accent];
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm p-5',
        'transition-all duration-300 animate-scale-in',
        t.border,
        t.borderHover,
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          t.gradientFrom,
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={cn('text-3xl font-bold', t.text, t.neonText)}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-full p-2', t.bgSoft)}>
            <Icon className={cn('w-5 h-5', t.text)} aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
