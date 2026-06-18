'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card, PageHeader, ACCENT } from '@/components/ui';
import {
  ACHIEVEMENTS, CATEGORY_META, TIER_META, isEarned, earnedCount,
  loadAchievementStats, type Achievement, type AchievementStats, type Category,
} from '@/lib/achievements';

const CATEGORY_ORDER: Category[] = ['streak', 'consistency', 'recovery', 'mastery'];

type Filter = 'all' | 'progress';

function AchievementTile({ a, stats }: { a: Achievement; stats: AchievementStats }) {
  const earned = isEarned(a, stats);
  const current = Math.min(a.progress(stats), a.goal);
  const pct = Math.min(1, current / a.goal);
  const tier = TIER_META[a.tier];
  const t = ACCENT[tier.accent];

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 transition-all overflow-hidden',
        earned ? cn('bg-background/60', t.border, 'ring-1', tier.ring) : 'border-muted/20 bg-background/30',
      )}
    >
      {/* Left accent strip on earned tiles */}
      {earned && (
        <div className={cn('absolute left-0 top-0 bottom-0 w-[3px]', t.bgSoft)} />
      )}

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
            <p className={cn('font-bold text-sm truncate', earned ? 'text-foreground' : 'text-muted-foreground')}>
              {a.name}
            </p>
            <span className={cn(
              'text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0',
              earned ? cn(t.bgSoft, t.text) : 'bg-muted/20 text-muted-foreground/50',
            )}>
              {tier.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">{a.description}</p>

          {!earned && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-[width] duration-700', t.barFill)}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground/60 mt-1 tabular-nums">
                {current} / {a.goal} {a.unit}
              </p>
            </div>
          )}
          {earned && (
            <p className={cn('text-[10px] font-bold uppercase tracking-wider mt-1.5 animate-pulse', t.text)}>
              ✓ Unlocked
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [collapsed, setCollapsed] = useState<Set<Category>>(new Set());
  const [barPct, setBarPct] = useState(0);

  useEffect(() => {
    const s = loadAchievementStats();
    setStats(s);
    // Auto-collapse categories that are 100% complete
    const autoCollapse = new Set<Category>();
    CATEGORY_ORDER.forEach((cat) => {
      const items = ACHIEVEMENTS.filter((a) => a.category === cat);
      if (items.every((a) => isEarned(a, s))) autoCollapse.add(cat);
    });
    setCollapsed(autoCollapse);
  }, []);

  // Animate progress bar from 0 → real value on mount
  useEffect(() => {
    if (stats === null) return;
    const pct = Math.round((earnedCount(stats) / ACHIEVEMENTS.length) * 100);
    const id = setTimeout(() => setBarPct(pct), 80);
    return () => clearTimeout(id);
  }, [stats]);

  const s = stats ?? {
    currentStreak: 0, longestStreak: 0, totalDays: 0,
    relapses: 0, entryCount: 0, moodCheckins: 0, level: 1,
  };
  const earned = stats ? earnedCount(s) : 0;
  const total = ACHIEVEMENTS.length;
  const pct = Math.round((earned / total) * 100);

  function toggleCollapse(cat: Category) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const lockedCount = total - earned;
  const allInProgressDone = filter === 'progress' && lockedCount === 0;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-6 page-entry">
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

      {/* Overall progress bar — animates from 0 on mount */}
      <Card accent="gold" padding="md" className="animate-scale-in">
        <div className="h-3 w-full rounded-full bg-muted/30 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-gold to-primary transition-[width] duration-700"
            style={{ width: `${barPct}%`, filter: 'drop-shadow(0 0 6px hsl(var(--gold)/0.5))' }}
          />
        </div>
      </Card>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'progress'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all',
              filter === f
                ? 'border-gold/50 bg-gold/15 text-gold'
                : 'border-muted/30 bg-muted/10 text-muted-foreground hover:border-muted/50 hover:text-foreground',
            )}
          >
            {f === 'all' ? 'All' : 'In Progress'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
          {earned} unlocked · {lockedCount} remaining
        </span>
      </div>

      {/* "In Progress" with everything done → trophy empty state */}
      {allInProgressDone && (
        <div className="text-center py-24 space-y-4">
          <div className="text-7xl">🏆</div>
          <p className="text-2xl font-display font-black text-gold neon-text-gold tracking-wider">
            ALL ACHIEVEMENTS UNLOCKED
          </p>
          <p className="text-sm text-muted-foreground">
            You've completed every challenge. Legendary.
          </p>
        </div>
      )}

      {/* Category sections */}
      {!allInProgressDone && CATEGORY_ORDER.map((cat) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === cat);
        const catEarnedItems = items.filter((a) => isEarned(a, s));
        const catLockedItems = items.filter((a) => !isEarned(a, s));
        const allCatDone = catEarnedItems.length === items.length;
        const isCollapsed = collapsed.has(cat);
        const meta = CATEGORY_META[cat];
        const t = ACCENT[meta.accent];

        // "In Progress" filter: skip categories that are fully done
        if (filter === 'progress' && allCatDone) return null;

        // Tile order: locked (actionable) first, earned second
        const visibleTiles = filter === 'progress'
          ? catLockedItems
          : [...catLockedItems, ...catEarnedItems];

        return (
          <section key={cat} className="space-y-3">
            {/* Collapsible section header */}
            <button
              onClick={() => toggleCollapse(cat)}
              aria-expanded={!isCollapsed}
              className="w-full flex items-center justify-between group py-1"
            >
              <div className="flex items-center gap-2.5">
                <h2 className={cn('text-sm font-bold uppercase tracking-wider', t.text, t.neonText)}>
                  {meta.label}
                </h2>
                {allCatDone && (
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                    t.bgSoft, t.text,
                  )}>
                    Complete ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {catEarnedItems.length}/{items.length}
                </span>
                <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                  {isCollapsed
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronUp className="w-4 h-4" />
                  }
                </span>
              </div>
            </button>

            {/* Collapsed: compact earned summary chip */}
            {isCollapsed && (
              <button
                onClick={() => toggleCollapse(cat)}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 flex items-center gap-3 transition-all',
                  t.border, t.bgSoft, 'hover:opacity-80',
                )}
              >
                <span className="text-lg">🏅</span>
                <span className={cn('text-xs font-bold', t.text)}>
                  {catEarnedItems.length} achievement{catEarnedItems.length !== 1 ? 's' : ''} unlocked
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground/50">tap to expand</span>
              </button>
            )}

            {/* Expanded content */}
            {!isCollapsed && (
              <div className="space-y-3">
                {/* "In Progress" mode: earned summary chip instead of full tiles */}
                {filter === 'progress' && catEarnedItems.length > 0 && (
                  <div className={cn(
                    'rounded-xl border px-4 py-2.5 flex items-center gap-2',
                    t.border, 'bg-background/20',
                  )}>
                    <span className="text-sm">🏅</span>
                    <span className="text-[11px] text-muted-foreground/70">
                      {catEarnedItems.length} already unlocked in this category
                    </span>
                  </div>
                )}

                {visibleTiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visibleTiles.map((a) => (
                      <AchievementTile key={a.id} a={a} stats={s} />
                    ))}
                  </div>
                )}

                {/* Category complete banner */}
                {allCatDone && filter === 'all' && (
                  <div className={cn(
                    'rounded-xl border px-4 py-2.5 flex items-center justify-center gap-2',
                    t.border, t.bgSoft,
                  )}>
                    <Trophy className={cn('w-3.5 h-3.5', t.text)} />
                    <span className={cn('text-[11px] font-bold uppercase tracking-wider', t.text)}>
                      Category complete — well done
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
