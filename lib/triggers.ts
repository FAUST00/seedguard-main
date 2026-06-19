/** Relapse trigger categories — captured on relapse logging, feeds the Recovery Insights analytics page. */
export const RELAPSE_TRIGGERS = [
  'Stress',
  'Anxiety',
  'Loneliness',
  'Boredom',
  'Social Media',
  'Dating/Rejection',
  'Insomnia',
  'Explicit Content',
  'Lack of Sleep',
  'Depression',
  'Other',
] as const;

export type RelapseTrigger = (typeof RELAPSE_TRIGGERS)[number];
