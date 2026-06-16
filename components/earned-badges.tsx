'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ALL_BADGES, computeEarnedBadgeIds } from '@/lib/badges';

// Streak day each streak-badge unlocks at — drives the "days to go" hint.
const STREAK_BADGE_THRESHOLDS: Record<string, number> = {
  first_blood: 1, one_week: 7, fortnight: 14, threshold: 30,
  iron_60: 60, diamond_mind: 90, centurion: 100, iron_will: 180, legend: 365,
};

/**
 * Earned-badges showcase. Self-contained — loads progress from localStorage,
 * so it can live on any page (Account tab). Mirrors the old dashboard block.
 */
export function EarnedBadges() {
  const [mounted, setMounted] = useState(false);
  const [earnedIds, setEarnedIds] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const stats = JSON.parse(localStorage.getItem('seedguard_stats') || '{}');
      const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]');
      const streak = Number(stats.currentStreak) || 0;
      setCurrentStreak(streak);
      setEarnedIds(computeEarnedBadgeIds({
        streak,
        totalDays: Number(stats.totalDays) || 0,
        relapses: Number(stats.relapses) || 0,
        entryCount: Array.isArray(history) ? history.length : 0,
      }));
    } catch {}
  }, []);

  if (!mounted) return null;

  const earnedBadges = ALL_BADGES.filter((b) => earnedIds.includes(b.id));
  if (earnedBadges.length === 0) return null;

  const nextToUnlock = ALL_BADGES
    .filter((b) => !earnedIds.includes(b.id))
    .map((badge) => ({
      badge,
      daysLeft: STREAK_BADGE_THRESHOLDS[badge.id] != null
        ? Math.max(0, STREAK_BADGE_THRESHOLDS[badge.id] - currentStreak)
        : null,
    }))
    .sort((a, b) => {
      if (a.daysLeft === null && b.daysLeft === null) return 0;
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    })
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-gold/20 bg-background/50 backdrop-blur-sm p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gold neon-text-gold">
          🏅 Earned Badges
        </h3>
        <Link href="/achievements" className="flex items-center gap-1 text-xs font-bold text-gold/70 hover:text-gold uppercase tracking-wider transition-colors">
          All Achievements <ChevronRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {earnedBadges.map((badge) => (
          <div
            key={badge.id}
            title={badge.description}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gold/25 bg-gold/10 hover:bg-gold/20 transition-all cursor-default"
          >
            <span className="text-lg">{badge.emoji}</span>
            <div>
              <p className="text-xs font-bold text-gold leading-none">{badge.name}</p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>

      {nextToUnlock.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gold/10 space-y-2">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-bold">Next to unlock</p>
          <div className="flex flex-wrap gap-2">
            {nextToUnlock.map(({ badge, daysLeft }) => (
              <div
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-muted/20 bg-muted/10 opacity-60 cursor-default"
              >
                <span className="text-lg grayscale">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground leading-none">{badge.name}</p>
                  {daysLeft !== null && (
                    <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                      {daysLeft === 0 ? 'Almost there!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
