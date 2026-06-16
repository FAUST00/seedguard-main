import { cn } from '@/lib/cn';
import { ACCENT, type Accent } from './colors';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  accent?: Accent;
  /** Optional right-aligned actions (buttons, badges). */
  actions?: React.ReactNode;
}

/**
 * Standard page title block. Gives every page the same heading scale,
 * tracking, and neon treatment so they read as one app.
 */
export function PageHeader({ title, subtitle, accent = 'secondary', actions }: PageHeaderProps) {
  const t = ACCENT[accent];
  return (
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 className={cn('text-3xl md:text-4xl font-extrabold tracking-widest uppercase italic', t.text, t.neonText)}>
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground text-base mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
