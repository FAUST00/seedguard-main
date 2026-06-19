'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/ui';
import { RecoveryTree } from '@/components/recovery-tree';
import { TREE_STAGES, getStageIndex, daysToNextStage } from '@/lib/recovery-tree';

export default function GrowthJourneyPage() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('seedguard_stats');
      if (raw) {
        const { currentStreak } = JSON.parse(raw);
        if (typeof currentStreak === 'number') setDays(currentStreak);
      }
    } catch {}
  }, []);

  const currentIdx = getStageIndex(days);
  const toNext = daysToNextStage(days);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-8 page-entry">
      <PageHeader
        title="Growth Journey"
        accent="secondary"
        subtitle="Every clean day is a season of growth. Watch what you're building."
      />

      <div className="rounded-2xl border border-secondary/25 bg-background/60 backdrop-blur-sm p-8 flex flex-col items-center text-center animate-scale-in">
        <RecoveryTree stage={TREE_STAGES[currentIdx]} variant="full" />
        <p className="text-2xl font-display font-black text-secondary neon-text-cyan mt-2">{TREE_STAGES[currentIdx].name}</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">{TREE_STAGES[currentIdx].blurb}</p>
        {toNext !== null ? (
          <p className="text-xs text-muted-foreground/60 mt-3">
            {toNext} day{toNext !== 1 ? 's' : ''} until <span className="text-secondary font-bold">{TREE_STAGES[currentIdx + 1].name}</span>
          </p>
        ) : (
          <p className="text-xs text-gold font-bold mt-3 uppercase tracking-wider">Final stage reached. Legendary.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary neon-text-cyan">Timeline</h2>
        {TREE_STAGES.map((stage, i) => {
          const reached = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={stage.id}
              className={cn(
                'rounded-xl border p-4 flex items-center gap-4 transition-all',
                isCurrent ? 'border-secondary/50 bg-secondary/10 neon-box-cyan' : reached ? 'border-secondary/20 bg-background/40' : 'border-muted/20 bg-background/20 opacity-60',
              )}
            >
              <div className={cn('flex-shrink-0', !reached && 'grayscale opacity-50')}>
                <RecoveryTree stage={stage} variant="compact" className="!w-16 !h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('font-bold text-sm', reached ? 'text-foreground' : 'text-muted-foreground')}>{stage.name}</p>
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">Day {stage.minDays}+</span>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">You are here</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">{stage.blurb}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
