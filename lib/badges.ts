export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_blood',   name: 'First Blood',        emoji: '⚡', description: 'Complete your first full day' },
  { id: 'one_week',      name: 'One Week Warrior',   emoji: '🔥', description: 'Reach a 7-day streak' },
  { id: 'fortnight',     name: 'Fortnight',          emoji: '💪', description: 'Reach a 14-day streak' },
  { id: 'threshold',     name: 'The Threshold',      emoji: '🏆', description: 'Reach a 30-day streak' },
  { id: 'iron_60',       name: 'Iron Sixty',         emoji: '⚔️', description: 'Reach a 60-day streak' },
  { id: 'diamond_mind',  name: 'Diamond Mind',       emoji: '💎', description: 'Reach a 90-day streak' },
  { id: 'centurion',     name: 'Centurion',          emoji: '🛡️', description: 'Reach a 100-day streak' },
  { id: 'iron_will',     name: 'Iron Will',          emoji: '🗡️', description: 'Reach a 180-day streak' },
  { id: 'legend',        name: 'Legend',             emoji: '👑', description: 'Reach a 365-day streak' },
  { id: 'comeback_king', name: 'Comeback King',      emoji: '🔄', description: 'Build a new streak after a relapse' },
  { id: 'clean_slate',   name: 'Clean Slate',        emoji: '✨', description: '10+ days tracked, zero relapses' },
  { id: 'historian',     name: 'Historian',          emoji: '📖', description: 'Log 20 journal entries' },
];

export interface BadgeStats {
  streak: number;
  totalDays: number;
  relapses: number;
  entryCount: number;
}

export function computeEarnedBadgeIds(stats: BadgeStats): string[] {
  const earned: string[] = [];
  if (stats.streak >= 1 || stats.totalDays >= 1)  earned.push('first_blood');
  if (stats.streak >= 7)                           earned.push('one_week');
  if (stats.streak >= 14)                          earned.push('fortnight');
  if (stats.streak >= 30)                          earned.push('threshold');
  if (stats.streak >= 60)                          earned.push('iron_60');
  if (stats.streak >= 90)                          earned.push('diamond_mind');
  if (stats.streak >= 100)                         earned.push('centurion');
  if (stats.streak >= 180)                         earned.push('iron_will');
  if (stats.streak >= 365)                         earned.push('legend');
  if (stats.relapses > 0 && stats.streak >= 1)    earned.push('comeback_king');
  if (stats.totalDays >= 10 && stats.relapses === 0) earned.push('clean_slate');
  if (stats.entryCount >= 20)                      earned.push('historian');
  return earned;
}
