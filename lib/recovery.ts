/**
 * Recovery analytics — pure helpers for the data-viz widgets.
 *
 * Everything keys off UTC yyyy-mm-dd strings to match how mood is stored
 * (`seedguard_mood_${new Date().toISOString().slice(0,10)}`), so day lookups
 * line up exactly and we avoid local/UTC drift.
 */

const DAY_MS = 86_400_000;

function ymd(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatCell {
  date: string;      // yyyy-mm-dd (UTC)
  level: HeatLevel;  // 0 none · 1 relapse · 2 tracked · 3 clean · 4 clean+checked-in
  relapse: boolean;
  label: string;     // human-readable for tooltip
}

export interface RecoveryInputs {
  streakStart: Date | null;
  firstDay: Date | null;
  currentStreak: number;
  longestStreak: number;
  relapses: number;
  totalDays: number;
  moodDates: Set<string>;     // days with a mood logged
  relapseDates: Set<string>;  // days with a relapse logged
  recentMoodCount: number;    // mood check-ins in the last 14 days
}

/** Build a Monday-aligned GitHub-style heatmap grid of the most recent `weeks` weeks. */
export function buildHeatmap(weeks: number, inp: RecoveryInputs): HeatCell[] {
  const total = weeks * 7;
  const nowMs = Date.now();
  const todayYmd = ymd(nowMs);
  const firstYmd = inp.firstDay ? ymd(inp.firstDay.getTime()) : null;
  const streakYmd = inp.streakStart ? ymd(inp.streakStart.getTime()) : null;
  // Align grid start to the Monday of the current week so row 0 is always Monday.
  const todayDow = (new Date(nowMs).getDay() + 6) % 7; // 0=Mon … 6=Sun
  const thisMonday = nowMs - todayDow * DAY_MS;
  const startMs = thisMonday - (weeks - 1) * 7 * DAY_MS;

  const cells: HeatCell[] = [];
  for (let i = 0; i < total; i++) {
    const key = ymd(startMs + i * DAY_MS);
    const tracked = firstYmd ? key >= firstYmd : false;
    const relapse = inp.relapseDates.has(key);
    let level: HeatLevel = 0;
    if (key <= todayYmd && tracked) {
      const clean = streakYmd ? key >= streakYmd : false;
      if (relapse) level = 1;
      else if (inp.moodDates.has(key)) level = 4;
      else if (clean) level = 3;
      else level = 2;
    }
    cells.push({ date: key, level, relapse, label: new Date(key).toDateString() });
  }
  return cells;
}

/**
 * Composite recovery score, 0–100. Weighted blend of momentum (current
 * streak), longevity (best ever), cleanliness (relapse ratio), and
 * consistency (recent check-ins).
 */
export function recoveryScore(inp: Pick<RecoveryInputs,
  'currentStreak' | 'longestStreak' | 'relapses' | 'totalDays' | 'recentMoodCount'>): number {
  const streak = Math.max(0, inp.currentStreak);
  const longest = Math.max(0, inp.longestStreak);
  const totalDays = Math.max(1, inp.totalDays);
  const relapses = Math.max(0, inp.relapses);

  const momentum = Math.min(1, streak / 90) * 40;
  const longevity = Math.min(1, longest / 90) * 20;
  const cleanliness = Math.max(0, 1 - relapses / totalDays) * 25;
  const consistency = Math.min(1, inp.recentMoodCount / 14) * 15;

  return Math.round(momentum + longevity + cleanliness + consistency);
}

export function scoreTier(score: number): { label: string; accent: 'destructive' | 'gold' | 'secondary' | 'primary' } {
  if (score >= 80) return { label: 'Thriving', accent: 'secondary' };
  if (score >= 55) return { label: 'Strong', accent: 'primary' };
  if (score >= 30) return { label: 'Building', accent: 'gold' };
  return { label: 'Early Days', accent: 'destructive' };
}

/** Mood values for the last 7 days (0 = no entry that day). */
export function weeklyMood(moodByDate: Map<string, number>): { day: string; value: number }[] {
  const out: { day: string; value: number }[] = [];
  const nowMs = Date.now();
  for (let i = 6; i >= 0; i--) {
    const key = ymd(nowMs - i * DAY_MS);
    const d = new Date(key);
    out.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), value: moodByDate.get(key) ?? 0 });
  }
  return out;
}

/** Read all recovery inputs from localStorage (client only). */
export function loadRecoveryInputs(): RecoveryInputs {
  const empty: RecoveryInputs = {
    streakStart: null, firstDay: null, currentStreak: 0, longestStreak: 0,
    relapses: 0, totalDays: 0, moodDates: new Set(), relapseDates: new Set(), recentMoodCount: 0,
  };
  if (typeof window === 'undefined') return empty;

  try {
    const stats = JSON.parse(localStorage.getItem('seedguard_stats') || '{}');
    const ss = localStorage.getItem('seedguard_streak_start');
    const fd = localStorage.getItem('seedguard_first_day');
    const history = JSON.parse(localStorage.getItem('seedguard_history') || '[]') as { date?: string; type?: string }[];

    // Mood dates from per-day keys
    const moodDates = new Set<string>();
    const moodByDate = new Map<string, number>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('seedguard_mood_')) {
        const date = k.replace('seedguard_mood_', '');
        moodDates.add(date);
        moodByDate.set(date, Number(localStorage.getItem(k)) || 0);
      }
    }

    // Relapse dates — best-effort parse of locale date strings
    const relapseDates = new Set<string>();
    for (const e of Array.isArray(history) ? history : []) {
      if (e?.type === 'relapse' && e.date) {
        const t = new Date(e.date).getTime();
        if (!Number.isNaN(t)) relapseDates.add(ymd(t));
      }
    }

    // Recent mood count (last 14 days)
    let recentMoodCount = 0;
    const nowMs = Date.now();
    for (let i = 0; i < 14; i++) {
      if (moodDates.has(ymd(nowMs - i * DAY_MS))) recentMoodCount++;
    }

    const streakStartDate = ss ? new Date(ss) : null;
    // firstDay should never be later than streakStart — if it is (e.g. the key
    // was written on a newer build install date rather than the real start), fall
    // back to streakStart so the heatmap covers the full current streak.
    let firstDayDate = fd ? new Date(fd) : null;
    if (streakStartDate) {
      if (!firstDayDate || firstDayDate > streakStartDate) {
        firstDayDate = streakStartDate;
      }
    }

    return {
      streakStart: streakStartDate,
      firstDay: firstDayDate,
      currentStreak: Number(stats.currentStreak) || 0,
      longestStreak: Number(stats.longestStreak) || 0,
      relapses: Number(stats.relapses) || 0,
      totalDays: Number(stats.totalDays) || 0,
      moodDates,
      relapseDates,
      recentMoodCount,
    };
  } catch {
    return empty;
  }
}

/** Map of yyyy-mm-dd → mood value, for the weekly trend widget. */
export function loadMoodByDate(): Map<string, number> {
  const m = new Map<string, number>();
  if (typeof window === 'undefined') return m;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('seedguard_mood_')) {
        m.set(k.replace('seedguard_mood_', ''), Number(localStorage.getItem(k)) || 0);
      }
    }
  } catch {}
  return m;
}
