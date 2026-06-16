'use client';

import { cn } from '@/lib/cn';
import type { LevelInfo } from '@/lib/xp';

interface XpBarProps {
  info: LevelInfo;
  /** 'full' = dashboard card; 'compact' = sidebar strip. */
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * Level + XP progress display. Presentational — the level math lives in
 * lib/xp.ts so this stays a pure render of whatever LevelInfo it's given.
 */
export function XpBar({ info, variant = 'full', className }: XpBarProps) {
  const { level, title, xpIntoLevel, xpForNextLevel, pct, totalXp } = info;

  if (variant === 'compact') {
    return (
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-secondary">Lv {level}</span>
          <span className="text-[9px] text-muted-foreground/70 tabular-nums">{xpIntoLevel}/{xpForNextLevel}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-[width] duration-700"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-secondary/25 bg-background/50 backdrop-blur-sm p-5', className)}>
      <div className="flex items-center gap-4">
        {/* Level medallion */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/30 to-primary/30 border border-secondary/40 flex flex-col items-center justify-center neon-box-cyan">
          <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/80 leading-none">Level</span>
          <span className="text-2xl font-display font-black text-secondary neon-text-cyan leading-none">{level}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <p className="font-bold text-foreground uppercase tracking-wider text-sm truncate">{title}</p>
            <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">{totalXp.toLocaleString()} XP</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted/40 overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary via-accent to-primary transition-[width] duration-700"
              style={{ width: `${pct * 100}%`, filter: 'drop-shadow(0 0 6px hsl(var(--secondary)/0.5))' }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground/70 tabular-nums">
            {xpIntoLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP to Level {level + 1}
          </p>
        </div>
      </div>
    </div>
  );
}
