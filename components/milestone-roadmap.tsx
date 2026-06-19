'use client';

import { cn } from '@/lib/cn';
import { Card, SectionHeading } from '@/components/ui';
import { Map as MapIcon } from 'lucide-react';

const MILESTONES = [
  { day: 7,   emoji: '🔥', label: 'Week' },
  { day: 14,  emoji: '💪', label: 'Fortnight' },
  { day: 30,  emoji: '🏆', label: 'Month' },
  { day: 60,  emoji: '⚔️', label: '60' },
  { day: 90,  emoji: '💎', label: 'Diamond' },
  { day: 100, emoji: '🛡️', label: 'Centurion' },
  { day: 180, emoji: '🗡️', label: '180' },
  { day: 365, emoji: '👑', label: 'Legend' },
];

/**
 * Horizontal milestone roadmap. Shows reached / current-target / upcoming
 * nodes with a progress fill up to the current streak.
 */
export function MilestoneRoadmap({ currentStreak }: { currentStreak: number }) {
  const nextIdx = MILESTONES.findIndex((m) => m.day > currentStreak);
  const reachedCount = nextIdx === -1 ? MILESTONES.length : nextIdx;
  const fillPct = Math.min(100, (reachedCount / MILESTONES.length) * 100);

  return (
    <Card accent="gold" padding="md" className="animate-scale-in">
      <SectionHeading accent="gold" Icon={MapIcon} className="mb-5">Milestone Roadmap</SectionHeading>

      <div className="relative">
        {/* Track */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted/30" />
        <div className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-gold to-primary transition-[width] duration-700" style={{ width: `${fillPct}%` }} />

        <div className="relative flex justify-between">
          {MILESTONES.map((m, i) => {
            const reached = currentStreak >= m.day;
            const isNext = i === nextIdx;
            return (
              <div key={m.day} className="flex flex-col items-center gap-1.5" style={{ minWidth: 0 }}>
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm transition-all',
                    reached
                      ? 'border-gold bg-gold/20 neon-box-gold'
                      : isNext
                        ? 'border-primary bg-primary/15 animate-[pulse_2s_ease-in-out_infinite]'
                        : 'border-muted/40 bg-background/60 grayscale opacity-50',
                  )}
                  title={`Day ${m.day}`}
                >
                  {m.emoji}
                </div>
                <span className={cn('text-[9px] font-bold tabular-nums', reached ? 'text-gold' : isNext ? 'text-primary' : 'text-muted-foreground/50')}>
                  {m.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {nextIdx !== -1 && (
        <p className="mt-4 text-xs text-muted-foreground/70 text-center">
          Next: <span className="text-primary font-bold">Day {MILESTONES[nextIdx].day}</span>
          {' '}({MILESTONES[nextIdx].day - currentStreak} day{MILESTONES[nextIdx].day - currentStreak !== 1 ? 's' : ''} to go)
        </p>
      )}
    </Card>
  );
}
