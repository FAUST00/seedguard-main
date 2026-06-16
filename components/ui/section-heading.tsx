import { cn } from '@/lib/cn';
import { ACCENT, type Accent } from './colors';
import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  children: React.ReactNode;
  accent?: Accent;
  Icon?: LucideIcon;
  className?: string;
}

/**
 * Consistent in-card section label: small, uppercase, wide tracking, neon.
 * Replaces the many ad-hoc `text-xs uppercase tracking-wider …` headings.
 */
export function SectionHeading({ children, accent = 'primary', Icon, className }: SectionHeadingProps) {
  const t = ACCENT[accent];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Icon && <Icon className={cn('w-4 h-4', t.text)} aria-hidden />}
      <h2 className={cn('text-sm font-bold uppercase tracking-wider', t.text, t.neonText)}>
        {children}
      </h2>
    </div>
  );
}
