/** Streak milestone days + the celebration copy shown when each is reached. */
export const MILESTONE_DAYS = [7, 14, 30, 60, 90, 100, 180, 365];

export const MILESTONE_MESSAGES: Record<number, { title: string; body: string }> = {
  7:   { title: '🔥 One Week!',        body: 'You survived the hardest stretch. The dopamine fog is lifting. Most men never make it here.' },
  14:  { title: '💪 Two Weeks!',       body: 'Flatline territory. You are still standing. The brain is rewiring itself right now.' },
  30:  { title: '🏆 30 Days!',         body: 'One month of total mastery. Testosterone is climbing. Mental clarity is arriving. This is real.' },
  60:  { title: '⚔️ 60 Days!',         body: 'Two months in. Your dopamine system is healing. Energy and focus are noticeably stronger.' },
  90:  { title: '💎 Diamond Mind!',    body: '90 days. This is the legendary threshold. You have rewired your brain. You are a different man.' },
  100: { title: '🛡️ Centurion!',       body: '100 days of iron discipline. Elite-level self-mastery. Less than 1% of men reach this.' },
  180: { title: '🗡️ Iron Will!',       body: 'Six months. Sustained transformation. The habits you\'ve built are now who you are.' },
  365: { title: '👑 Legend!',          body: 'One full year. You have achieved something that most men will never even attempt. Legendary.' },
};
