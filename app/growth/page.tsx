'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/ui';
import { RecoveryTree } from '@/components/recovery-tree';
import { RecoveryTreeScene } from '@/components/recovery-tree-scene';
import { TREE_STAGES, getStageIndex, getNextUnlock } from '@/lib/recovery-tree';

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
  const stage = TREE_STAGES[currentIdx];
  const nextUnlock = getNextUnlock(days);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-8 page-entry">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-secondary transition-colors uppercase tracking-widest font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <PageHeader
        title="Growth Journey"
        accent="secondary"
        subtitle="Every clean day is a season of growth. Watch what you're building."
      />

      {/* Living scene */}
      <div className="rounded-2xl border border-secondary/25 overflow-hidden animate-scale-in">
        <RecoveryTreeScene stage={stage} />
        <div className="bg-background/80 backdrop-blur-sm p-6 text-center">
          <p className="text-2xl font-display font-black text-secondary neon-text-cyan">{stage.name}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">{stage.blurb}</p>
        </div>
      </div>

      {/* Next Evolution panel */}
      {nextUnlock ? (
        <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-foreground">Next evolution</p>
            <span className="text-xs text-secondary font-bold tabular-nums">
              {nextUnlock.daysLeft} day{nextUnlock.daysLeft !== 1 ? 's' : ''} left
            </span>
          </div>
          <div className="space-y-1.5">
            {nextUnlock.unlock.items.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 text-center animate-scale-in">
          <p className="font-bold text-gold uppercase tracking-wider text-sm">Every evolution unlocked. Legendary.</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary neon-text-cyan">Timeline</h2>
        {TREE_STAGES.map((s, i) => {
          const reached = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={s.id}
              className={cn(
                'rounded-xl border p-4 flex items-center gap-4 transition-all',
                isCurrent ? 'border-secondary/50 bg-secondary/10 neon-box-cyan' : reached ? 'border-secondary/20 bg-background/40' : 'border-muted/20 bg-background/20 opacity-60',
              )}
            >
              <div className={cn('flex-shrink-0', !reached && 'grayscale opacity-50')}>
                <RecoveryTree stage={s} variant="compact" className="!w-16 !h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('font-bold text-sm', reached ? 'text-foreground' : 'text-muted-foreground')}>{s.name}</p>
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">Day {s.minDays}+</span>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">You are here</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-snug">{s.blurb}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
