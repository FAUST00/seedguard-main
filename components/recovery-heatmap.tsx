'use client';

import { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { buildHeatmap, loadRecoveryInputs, type HeatCell, type HeatLevel } from '@/lib/recovery';

// Match Activity Heatmap: 15 weeks
const WEEKS = 15;

// Day-of-week labels starting Monday (grid is Monday-aligned via buildHeatmap)
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Literal Tailwind classes per level (JIT-safe — no interpolation)
const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: 'bg-muted/20',
  1: 'bg-destructive/70',
  2: 'bg-accent/30',
  3: 'bg-secondary/50',
  4: 'bg-secondary shadow-[0_0_6px_hsl(var(--secondary)/0.7)]',
};

/**
 * Recovery heatmap — mirrors the Activity Heatmap layout (day labels, month
 * labels, same cell size, same card style). Monday-aligned grid via buildHeatmap.
 */
export function RecoveryHeatmap() {
  const [cells, setCells] = useState<HeatCell[] | null>(null);

  useEffect(() => {
    setCells(buildHeatmap(WEEKS, loadRecoveryInputs()));
  }, []);

  // Group into week-columns (7 cells each, row 0 = Monday)
  const columns: HeatCell[][] = [];
  if (cells) {
    for (let c = 0; c < WEEKS; c++) columns.push(cells.slice(c * 7, c * 7 + 7));
  }

  // Derive month label for each column (show when the first day of the column
  // is the 1st of the month, or force the very first column to label its month)
  function monthLabel(col: HeatCell[], isFirst: boolean): string {
    if (!col.length) return '';
    const d = new Date(col[0].date);
    if (d.getDate() === 1 || isFirst) {
      return d.toLocaleString('default', { month: 'short' });
    }
    return '';
  }

  return (
    <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-secondary neon-text-cyan flex items-center gap-2">
          <CalendarDays className="w-4 h-4" aria-hidden />
          Recovery Heatmap
        </h3>
      </div>

      {!cells ? (
        <div className="h-28 skeleton rounded-lg" />
      ) : (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {/* Day-of-week labels column */}
            <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
              <div className="h-4" />{/* spacer to match month-label row */}
              {DAY_LABELS.map((l, i) => (
                <div key={i} className="w-3 h-3 text-[8px] text-muted-foreground/50 flex items-center justify-center">
                  {l}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {columns.map((week, ci) => (
              <div key={ci} className="flex flex-col gap-1 flex-shrink-0">
                {/* Month label row */}
                <div className="h-4 text-[8px] text-muted-foreground/50 flex items-end justify-center whitespace-nowrap">
                  {monthLabel(week, ci === 0)}
                </div>
                {/* Day cells */}
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.label}${cell.relapse ? ' — relapse logged' : cell.level >= 3 ? ' — clean' : cell.level === 2 ? ' — tracked' : ''}`}
                    className={`w-3 h-3 rounded-sm transition-all ${LEVEL_CLASS[cell.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-muted/20" />
            <span className="w-3 h-3 rounded-sm bg-accent/30" />
            <span className="w-3 h-3 rounded-sm bg-secondary/50" />
            <span className="w-3 h-3 rounded-sm bg-secondary" />
            <span>More</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-destructive/70" /> Relapse
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground/40">Last {WEEKS} weeks</p>
        </>
      )}
    </div>
  );
}
