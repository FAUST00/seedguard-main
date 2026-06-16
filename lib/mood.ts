/** Daily mood check-in scale + the localStorage key for today's entry. */
export interface Mood {
  emoji: string;
  label: string;
  value: number;
}

export const MOODS: Mood[] = [
  { emoji: '😤', label: 'Struggling', value: 1 },
  { emoji: '😐', label: 'Neutral',    value: 2 },
  { emoji: '🙂', label: 'Okay',       value: 3 },
  { emoji: '😊', label: 'Good',       value: 4 },
  { emoji: '🔥', label: 'Thriving',   value: 5 },
];

/** localStorage key for today's mood (UTC day, matching lib/recovery). */
export function todayMoodKey(): string {
  return `seedguard_mood_${new Date().toISOString().slice(0, 10)}`;
}
