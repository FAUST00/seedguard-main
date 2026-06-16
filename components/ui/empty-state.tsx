import { cn } from '@/lib/cn';
import { ACCENT, type Accent } from './colors';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  Icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  accent?: Accent;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Friendly empty state for lists/feeds with no data yet. Keeps "nothing here"
 * moments on-brand and encouraging instead of blank.
 */
export function EmptyState({ Icon, emoji, title, description, accent = 'primary', action, className }: EmptyStateProps) {
  const t = ACCENT[accent];
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      <div className={cn('flex items-center justify-center w-16 h-16 rounded-full mb-4', t.bgSoft)}>
        {emoji ? <span className="text-3xl">{emoji}</span> : Icon ? <Icon className={cn('w-8 h-8', t.text)} aria-hidden /> : null}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
