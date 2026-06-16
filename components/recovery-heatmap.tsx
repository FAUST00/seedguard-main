'use client';

import { useState, useEffect } from 'react';
import { Card, SectionHeading } from '@/components/ui';
import { CalendarDays } from 'lucide-react';
import { buildHeatmap, loadRecoveryInputs, type HeatCell, type HeatLevel } from '@/lib/recovery';

const WEEKS = 18; // ~4 months

// Literal class strings per level (Tailwind-safe — see components/ui/colors.ts).
const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: 'bg-muted/15',
  1: 'bg-destructive/70',
  2: 'bg-accent/30',
  3: 'bg-secondary/50',
  4: 'bg-secondary shadow-[0_0_6px_hsl(var(--secondary)/0.7)]',
};

/**
 * GitHub-style recovery heatmap. Self-contained — reads progress from
 * localStorage once on mount. 7 rows (days) × WEEKS columns.
 */
export function RecoveryHeatmap() {
  const [cells, setCells] = useState<HeatCell[] | null>(null);

  useEffect(() => {
    setCells(buildHeatmap(WEEKS, loadRecoveryInputs()));
  }, []);

  // Group into week-columns (7 cells each).
  const columns: HeatCell[][] = [];
  if (cells) {
    for (let c = 0; c < WEEKS; c++) columns.push(cells.slice(c * 7, c * 7 + 7));
  }

  return (
    <Card accent="secondary" padding="md" className="animate-scale-in">
      <SectionHeading accent="secondary" Icon={CalendarDays} className="mb-4">Recovery Heatmap</SectionHeading>

      {!cells ? (
        <div className="h-28 skeleton rounded-lg" />
      ) : (
        <>
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-1 min-w-min">
              {columns.map((week, ci) => (
                <div key={ci} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      title={`${cell.label}${cell.relapse ? ' — relapse logged' : cell.level >= 3 ? ' — clean' : ''}`}
                      className={`w-2.5 h-2.5 rounded-[2px] ${LEVEL_CLASS[cell.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground/70">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-muted/15" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/30" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-secondary/50" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-secondary" />
            <span>More</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-destructive/70" /> Relapse
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
