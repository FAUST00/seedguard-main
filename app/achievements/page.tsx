'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Card, PageHeader, SectionHeading, ACCENT } from '@/components/ui';
import {
  ACHIEVEMENTS, CATEGORY_META, TIER_META, isEarned, earnedCount,
  loadAchievementStats, type Achievement, type AchievementStats, type Category,
} from '@/lib/achievements';

const CATEGORY_ORDER: Category[] = ['streak', 'consistency', 'recovery', 'mastery'];

function AchievementTile({ a, stats }: { a: Achievement; stats: AchievementStats }) {
  const earned = isEarned(a, stats);
  const current = Math.min(a.progress(stats), a.goal);
  const pct = Math.min(1, current / a.goal);
  const tier = TIER_META[a.tier];
  const t = ACCENT[tier.accent];

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 transition-all',
        earned ? cn('bg-background/60', t.border, 'ring-1', tier.ring) : 'border-muted/20 bg-background/30',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0 transition-all',
            earned ? cn(t.bgSoft, tier.ring, 'ring-1') : 'bg-muted/15 grayscale opacity-50',
          )}
        >
          {a.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn('font-bold text-sm truncate', earned ? 'text-foreground' : 'text-muted-foreground')}>{a.name}</p>
            <span className={cn('text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0', earned ? cn(t.bgSoft, t.text) : 'bg-muted/20 text-muted-foreground/50')}>
              {tier.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">{a.description}</p>

          {!earned && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div className={cn('h-full rounded-full transition-[width] duration-700', t.barFill)} style={{ width: `${pct * 100}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground/60 mt-1 tabular-nums">{current} / {a.goal} {a.unit}</p>
            </div>
          )}
          {earned && (
            <p className={cn('text-[10px] font-bold uppercase tracking-wider mt-1.5', t.text)}>✓ Unlocked</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [stats, setStats] = useState<AchievementStats | null>(null);

  useEffect(() => {
    setStats(loadAchievementStats());
  }, []);

  const s = stats ?? { currentStreak: 0, longestStreak: 0, totalDays: 0, relapses: 0, entryCount: 0, moodCheckins: 0, level: 1 };
  const earned = stats ? earnedCount(s) : 0;
  const total = ACHIEVEMENTS.length;
  const pct = Math.round((earned / total) * 100);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 page-entry">
      <PageHeader
        title="Achievements"
        accent="gold"
        subtitle="Every tier you unlock is proof of the man you're becoming."
        actions={
          <div className="text-right">
            <p className="text-2xl font-display font-black text-gold neon-text-gold tabular-nums">{earned}/{total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{pct}% complete</p>
          </div>
        }
      />

      {/* Overall progress */}
      <Card accent="gold" padding="md" className="animate-scale-in">
        <div className="h-3 w-full rounded-full bg-muted/30 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-gold to-primary transition-[width] duration-700"
            style={{ width: `${pct}%`, filter: 'drop-shadow(0 0 6px hsl(var(--gold)/0.5))' }}
          />
        </div>
      </Card>

      {CATEGORY_ORDER.map((cat) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === cat);
        const catEarned = items.filter((a) => isEarned(a, s)).length;
        return (
          <section key={cat} className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeading accent={CATEGORY_META[cat].accent}>{CATEGORY_META[cat].label}</SectionHeading>
              <span className="text-[10px] text-muted-foreground tabular-nums">{catEarned}/{items.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((a) => <AchievementTile key={a.id} a={a} stats={s} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
