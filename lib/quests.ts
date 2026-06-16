/**
 * Daily quests — a small, resettable engagement loop.
 *
 * Completion state is stored per-day so quests reset at midnight. Each quest
 * banks XP exactly once into a cumulative counter that feeds the XP system
 * (see lib/xp.ts). All access is localStorage-guarded for SSR safety.
 */

export interface QuestDef {
  id: string;
  label: string;
  xp: number;
  emoji: string;
}

export const DAILY_QUESTS: QuestDef[] = [
  { id: 'hold',    label: 'Hold your streak today',         xp: 25, emoji: '🛡️' },
  { id: 'checkin', label: 'Log your daily mood',            xp: 15, emoji: '🧭' },
  { id: 'wisdom',  label: "Read today's wisdom",            xp: 10, emoji: '📜' },
  { id: 'breathe', label: 'Complete a breathing session',   xp: 20, emoji: '🌬️' },
];

/** Fired on the window whenever quest state changes, so widgets can re-read. */
export const QUEST_EVENT = 'seedguard:quests';

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function doneKey(): string {
  return `seedguard_quests_${dayStamp()}`;
}

const QUEST_XP_KEY = 'seedguard_quest_xp';

export function getCompletedQuestIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(doneKey()) || '[]') as string[];
  } catch {
    return [];
  }
}

export function getQuestXp(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(QUEST_XP_KEY) || '0') || 0;
}

/**
 * Mark a quest complete for today. Idempotent — banks its XP only once per day.
 * Returns the XP awarded (0 if it was already done).
 */
export function completeQuest(id: string): number {
  if (typeof window === 'undefined') return 0;
  const quest = DAILY_QUESTS.find((q) => q.id === id);
  if (!quest) return 0;

  const done = getCompletedQuestIds();
  if (done.includes(id)) return 0;

  const next = [...done, id];
  localStorage.setItem(doneKey(), JSON.stringify(next));
  localStorage.setItem(QUEST_XP_KEY, String(getQuestXp() + quest.xp));

  window.dispatchEvent(new CustomEvent(QUEST_EVENT));
  return quest.xp;
}
