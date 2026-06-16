/**
 * XP & level system.
 *
 * XP is derived deterministically from existing progress stats (so it can
 * never desync), plus a small cumulative bonus from completed daily quests.
 * No new source of truth for the core number — just a motivating lens on
 * the work the user has already done.
 */

export interface XpInputs {
  totalDays: number;
  longestStreak: number;
  entryCount: number;
  badgeCount: number;
  /** Cumulative XP banked from completed daily quests. */
  questXp?: number;
}

/** One-time bonus granted the first time a streak milestone is reached. */
const MILESTONE_BONUS: Record<number, number> = {
  7: 50, 14: 100, 30: 250, 60: 400, 90: 750, 100: 1000, 180: 1500, 365: 3000,
};

export const XP_PER_DAY = 10;
export const XP_PER_ENTRY = 5;
export const XP_PER_BADGE = 100;

export function computeXp(i: XpInputs): number {
  let xp = 0;
  xp += Math.max(0, i.totalDays) * XP_PER_DAY;
  xp += Math.max(0, i.entryCount) * XP_PER_ENTRY;
  xp += Math.max(0, i.badgeCount) * XP_PER_BADGE;
  for (const dayStr of Object.keys(MILESTONE_BONUS)) {
    const day = Number(dayStr);
    if (i.longestStreak >= day) xp += MILESTONE_BONUS[day];
  }
  xp += Math.max(0, i.questXp ?? 0);
  return xp;
}

/** Rank flavor titles by level band. */
export const RANKS: { min: number; title: string }[] = [
  { min: 1,  title: 'Initiate' },
  { min: 5,  title: 'Disciplined' },
  { min: 10, title: 'Forged' },
  { min: 18, title: 'Ironclad' },
  { min: 28, title: 'Ascendant' },
  { min: 40, title: 'Legend' },
];

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  pct: number; // 0..1 progress to next level
}

/** Cumulative XP required to *reach* a level. Quadratic curve. */
function xpToReach(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, totalXp);
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
  const base = xpToReach(level);
  const next = xpToReach(level + 1);
  const xpIntoLevel = xp - base;
  const xpForNextLevel = next - base;
  const pct = xpForNextLevel === 0 ? 1 : Math.min(1, Math.max(0, xpIntoLevel / xpForNextLevel));
  const rank = [...RANKS].reverse().find((r) => level >= r.min) ?? RANKS[0];
  return { level, title: rank.title, totalXp: xp, xpIntoLevel, xpForNextLevel, pct };
}
