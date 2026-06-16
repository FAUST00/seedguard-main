/**
 * Weekly challenges — a rotating, higher-stakes goal that refreshes each week
 * and banks bonus XP into the shared pool (lib/xp via the quest-XP counter).
 *
 * Progress is computed from data the app already stores (mood keys, quest
 * completion, history, streak), so there's no separate bookkeeping to drift.
 */

import { DAILY_QUESTS, QUEST_EVENT } from '@/lib/quests';

const DAY_MS = 86_400_000;

function ymd(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** UTC Monday 00:00 of the week containing `now`. */
function mondayOf(now: Date): number {
  const dow = (now.getUTCDay() + 6) % 7; // 0 = Monday
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow);
}

/** yyyy-mm-dd for each day of the current week up to (and including) today. */
export function weekDatesSoFar(now = new Date()): string[] {
  const mon = mondayOf(now);
  const today = ymd(now.getTime());
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const k = ymd(mon + i * DAY_MS);
    if (k <= today) out.push(k);
  }
  return out;
}

/** Stable key identifying the current week (its Monday). */
export function weekKey(now = new Date()): string {
  return ymd(mondayOf(now));
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  goal: number;
  unit: string;
  xp: number;
  /** Current progress toward goal, read from localStorage. */
  progress: (week: string[]) => number;
}

function relapseDatesThisWeek(weekSet: Set<string>): Set<string> {
  const out = new Set<string>();
  if (typeof window === 'undefined') return out;
  try {
    const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]') as { date?: string; type?: string }[];
    for (const e of Array.isArray(history) ? history : []) {
      if (e?.type === 'relapse' && e.date) {
        const t = new Date(e.date).getTime();
        if (!Number.isNaN(t) && weekSet.has(ymd(t))) out.add(ymd(t));
      }
    }
  } catch {}
  return out;
}

function countKeys(week: string[], prefix: string, predicate?: (raw: string) => boolean): number {
  if (typeof window === 'undefined') return 0;
  let n = 0;
  for (const day of week) {
    const raw = localStorage.getItem(`${prefix}${day}`);
    if (raw != null && (!predicate || predicate(raw))) n++;
  }
  return n;
}

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'mood_week', title: 'Daily Check-In', emoji: '🧭',
    description: 'Log your mood every day this week', goal: 7, unit: 'days', xp: 100,
    progress: (week) => countKeys(week, 'seedguard_mood_'),
  },
  {
    id: 'quest_days', title: 'Quest Streak', emoji: '⚔️',
    description: 'Complete all daily quests on 5 days', goal: 5, unit: 'days', xp: 120,
    progress: (week) => countKeys(week, 'seedguard_quests_', (raw) => {
      try { return (JSON.parse(raw) as string[]).length >= DAILY_QUESTS.length; } catch { return false; }
    }),
  },
  {
    id: 'journal_week', title: 'Journal Week', emoji: '📖',
    description: 'Log 5 journal entries this week', goal: 5, unit: 'entries', xp: 90,
    progress: (week) => {
      if (typeof window === 'undefined') return 0;
      const set = new Set(week);
      try {
        const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]') as { date?: string }[];
        return (Array.isArray(history) ? history : []).filter((e) => {
          if (!e.date) return false;
          const t = new Date(e.date).getTime();
          return !Number.isNaN(t) && set.has(ymd(t));
        }).length;
      } catch { return 0; }
    },
  },
  {
    id: 'clean_week', title: 'Hold the Line', emoji: '🛡️',
    description: 'Stay clean every day this week', goal: 7, unit: 'days', xp: 150,
    progress: (week) => {
      const relapses = relapseDatesThisWeek(new Set(week));
      return week.filter((d) => !relapses.has(d)).length;
    },
  },
];

/** Deterministic challenge for the current week. */
export function activeChallenge(now = new Date()): Challenge {
  const weeksSinceEpoch = Math.floor(mondayOf(now) / (7 * DAY_MS));
  return WEEKLY_CHALLENGES[weeksSinceEpoch % WEEKLY_CHALLENGES.length];
}

const CLAIM_PREFIX = 'seedguard_challenge_';
const QUEST_XP_KEY = 'seedguard_quest_xp';

export function isChallengeClaimed(now = new Date()): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${CLAIM_PREFIX}${weekKey(now)}`) === '1';
}

/**
 * Bank the challenge reward once per week. Returns XP awarded (0 if already
 * claimed or not yet complete). Feeds the shared XP pool + fires QUEST_EVENT.
 */
export function claimChallenge(now = new Date()): number {
  if (typeof window === 'undefined') return 0;
  const c = activeChallenge(now);
  const done = c.progress(weekDatesSoFar(now)) >= c.goal;
  if (!done || isChallengeClaimed(now)) return 0;

  localStorage.setItem(`${CLAIM_PREFIX}${weekKey(now)}`, '1');
  const cur = Number(localStorage.getItem(QUEST_XP_KEY) || '0') || 0;
  localStorage.setItem(QUEST_XP_KEY, String(cur + c.xp));
  window.dispatchEvent(new CustomEvent(QUEST_EVENT));
  return c.xp;
}
