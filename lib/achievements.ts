/**
 * Achievement system — a tiered layer on top of the existing badge/XP work.
 *
 * Each achievement has a numeric goal and a progress() selector over the
 * user's stats, so the UI can show "earned" state AND partial progress bars
 * for locked ones. Everything is derived from stats — no extra source of truth.
 */

import type { Accent } from '@/components/ui/colors';
import { computeEarnedBadgeIds } from '@/lib/badges';
import { computeXp, levelFromXp } from '@/lib/xp';
import { getQuestXp } from '@/lib/quests';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type Category = 'streak' | 'consistency' | 'recovery' | 'mastery';

export interface AchievementStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  relapses: number;
  entryCount: number;
  moodCheckins: number;
  level: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: Tier;
  category: Category;
  goal: number;
  unit: string;
  progress: (s: AchievementStats) => number;
}

/** Visual tokens per tier — accent drives the shared color map. */
export const TIER_META: Record<Tier, { label: string; accent: Accent; ring: string }> = {
  bronze:   { label: 'Bronze',   accent: 'gold',        ring: 'ring-amber-700/50' },
  silver:   { label: 'Silver',   accent: 'secondary',   ring: 'ring-slate-300/40' },
  gold:     { label: 'Gold',     accent: 'gold',        ring: 'ring-gold/50' },
  platinum: { label: 'Platinum', accent: 'primary',     ring: 'ring-primary/50' },
};

export const CATEGORY_META: Record<Category, { label: string; accent: Accent }> = {
  streak:      { label: 'Streak',      accent: 'primary' },
  consistency: { label: 'Consistency', accent: 'secondary' },
  recovery:    { label: 'Recovery',    accent: 'accent' },
  mastery:     { label: 'Mastery',     accent: 'gold' },
};

export const ACHIEVEMENTS: Achievement[] = [
  // ── Streak (longest streak ever — permanent) ──
  { id: 'streak_1',   name: 'First Day',     description: 'Complete your first full day',  emoji: '⚡', tier: 'bronze',   category: 'streak', goal: 1,   unit: 'days', progress: (s) => s.longestStreak },
  { id: 'streak_7',   name: 'Week Warrior',  description: 'Reach a 7-day streak',          emoji: '🔥', tier: 'silver',   category: 'streak', goal: 7,   unit: 'days', progress: (s) => s.longestStreak },
  { id: 'streak_30',  name: 'Month Master',  description: 'Reach a 30-day streak',         emoji: '🏆', tier: 'gold',     category: 'streak', goal: 30,  unit: 'days', progress: (s) => s.longestStreak },
  { id: 'streak_90',  name: 'Diamond Mind',  description: 'Reach a 90-day streak',         emoji: '💎', tier: 'platinum', category: 'streak', goal: 90,  unit: 'days', progress: (s) => s.longestStreak },
  { id: 'streak_365', name: 'Legend',        description: 'Reach a 365-day streak',        emoji: '👑', tier: 'platinum', category: 'streak', goal: 365, unit: 'days', progress: (s) => s.longestStreak },

  // ── Consistency (entries + mood check-ins) ──
  { id: 'log_1',   name: 'First Log',  description: 'Log your first journal entry',   emoji: '📝', tier: 'bronze', category: 'consistency', goal: 1,  unit: 'entries',   progress: (s) => s.entryCount },
  { id: 'log_10',  name: 'Journaler',  description: 'Log 10 journal entries',         emoji: '📖', tier: 'silver', category: 'consistency', goal: 10, unit: 'entries',   progress: (s) => s.entryCount },
  { id: 'log_50',  name: 'Chronicler', description: 'Log 50 journal entries',         emoji: '📚', tier: 'gold',   category: 'consistency', goal: 50, unit: 'entries',   progress: (s) => s.entryCount },
  { id: 'mood_7',  name: 'Self-Aware', description: 'Check in your mood 7 times',      emoji: '🧭', tier: 'silver', category: 'consistency', goal: 7,  unit: 'check-ins', progress: (s) => s.moodCheckins },
  { id: 'mood_30', name: 'Mindful',    description: 'Check in your mood 30 times',     emoji: '🪷', tier: 'gold',   category: 'consistency', goal: 30, unit: 'check-ins', progress: (s) => s.moodCheckins },

  // ── Recovery (total days tracked) ──
  { id: 'track_30',  name: 'Committed',         description: 'Track 30 total days',  emoji: '🌱', tier: 'silver', category: 'recovery', goal: 30,  unit: 'days', progress: (s) => s.totalDays },
  { id: 'track_100', name: 'Centurion Tracker', description: 'Track 100 total days', emoji: '🛡️', tier: 'gold',   category: 'recovery', goal: 100, unit: 'days', progress: (s) => s.totalDays },
  { id: 'track_365', name: 'Year of Growth',    description: 'Track 365 total days', emoji: '🌳', tier: 'platinum', category: 'recovery', goal: 365, unit: 'days', progress: (s) => s.totalDays },

  // ── Mastery (XP level) ──
  { id: 'level_5',  name: 'Disciplined', description: 'Reach Level 5',  emoji: '🥉', tier: 'bronze',   category: 'mastery', goal: 5,  unit: 'level', progress: (s) => s.level },
  { id: 'level_10', name: 'Forged',      description: 'Reach Level 10', emoji: '🥈', tier: 'silver',   category: 'mastery', goal: 10, unit: 'level', progress: (s) => s.level },
  { id: 'level_25', name: 'Ascendant',   description: 'Reach Level 25', emoji: '🥇', tier: 'platinum', category: 'mastery', goal: 25, unit: 'level', progress: (s) => s.level },
];

export function isEarned(a: Achievement, s: AchievementStats): boolean {
  return a.progress(s) >= a.goal;
}

export function earnedCount(s: AchievementStats): number {
  return ACHIEVEMENTS.filter((a) => isEarned(a, s)).length;
}

/** Build achievement stats from localStorage (client only). */
export function loadAchievementStats(): AchievementStats {
  const empty: AchievementStats = {
    currentStreak: 0, longestStreak: 0, totalDays: 0, relapses: 0,
    entryCount: 0, moodCheckins: 0, level: 1,
  };
  if (typeof window === 'undefined') return empty;

  try {
    const stats = JSON.parse(localStorage.getItem('seedguard_stats') || '{}');
    const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]');
    const currentStreak = Number(stats.currentStreak) || 0;
    const longestStreak = Number(stats.longestStreak) || 0;
    const totalDays = Number(stats.totalDays) || 0;
    const relapses = Number(stats.relapses) || 0;
    const entryCount = Array.isArray(history) ? history.length : 0;

    let moodCheckins = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('seedguard_mood_')) moodCheckins++;
    }

    const badgeCount = computeEarnedBadgeIds({ streak: currentStreak, totalDays, relapses, entryCount }).length;
    const level = levelFromXp(
      computeXp({ totalDays, longestStreak, entryCount, badgeCount, questXp: getQuestXp() }),
    ).level;

    return { currentStreak, longestStreak, totalDays, relapses, entryCount, moodCheckins, level };
  } catch {
    return empty;
  }
}
