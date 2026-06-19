/**
 * Emergency Recovery Toolkit — the expanded version of the old single
 * breathing-exercise modal. Breathing and the motivational quote are the
 * two tools that already existed; everything else here is new, but all of
 * it lives inside the same "I'm Struggling" modal, not a separate page.
 */

export type IntensityTier = 'mild' | 'moderate' | 'intense';

export type ToolId =
  | 'breathing' | 'motivation' | 'delay' | 'walk'
  | 'workout' | 'coldshower' | 'journal' | 'coach' | 'partner';

export interface ToolDef {
  id: ToolId;
  name: string;
  emoji: string;
  description: string;
  tiers: IntensityTier[];
}

export const TOOLS: ToolDef[] = [
  { id: 'breathing',  name: 'Breathing Exercise',       emoji: '🌬️', description: '4-7-8 breathing to calm your nervous system.',            tiers: ['mild', 'moderate'] },
  { id: 'motivation',  name: 'Recovery Motivation',      emoji: '💬', description: 'A quote to remind you why you started.',                  tiers: ['mild'] },
  { id: 'delay',       name: '15-Minute Delay Timer',    emoji: '⏳', description: 'Urges peak and fade. Just outlast this one.',              tiers: ['moderate', 'intense'] },
  { id: 'walk',        name: 'Walk Challenge',           emoji: '🚶', description: 'Leave the room. Change your environment, change your state.', tiers: ['moderate', 'intense'] },
  { id: 'workout',     name: 'Quick Workout Generator',  emoji: '💪', description: 'Burn off the energy with a short bodyweight set.',        tiers: ['moderate'] },
  { id: 'coldshower',  name: 'Cold Shower Challenge',    emoji: '🚿', description: 'A fast reset for your nervous system and your head.',     tiers: ['intense'] },
  { id: 'journal',     name: 'Emergency Journal',        emoji: '📓', description: 'Write down what is actually happening right now.',        tiers: ['intense'] },
  { id: 'coach',       name: 'Recovery Coach',           emoji: '🤖', description: 'Talk it through with your AI recovery coach.',            tiers: ['intense'] },
  { id: 'partner',     name: 'Accountability Partner',   emoji: '🤝', description: 'Reach out to someone who has your back.',                 tiers: ['intense'] },
];

export function intensityTier(score: number): IntensityTier {
  if (score <= 3) return 'mild';
  if (score <= 6) return 'moderate';
  return 'intense';
}

export function intensityLabel(score: number): string {
  const tier = intensityTier(score);
  return tier === 'mild' ? 'Mild' : tier === 'moderate' ? 'Moderate' : 'Intense';
}

export function recommendedTools(score: number): ToolDef[] {
  const tier = intensityTier(score);
  return TOOLS.filter((t) => t.tiers.includes(tier));
}

export function getTool(id: ToolId): ToolDef {
  return TOOLS.find((t) => t.id === id)!;
}

// ── Quick Workout Generator ──────────────────────────────────────────────
export const WORKOUTS: string[][] = [
  ['20 push-ups', '30 air squats', '30-second plank'],
  ['15 burpees', '20 lunges (each leg)', '40 jumping jacks'],
  ['25 sit-ups', '20 push-ups', '1-minute wall sit'],
  ['30 mountain climbers', '15 tricep dips', '30-second plank'],
  ['20 squat jumps', '15 push-ups', '40 high knees'],
];

export function randomWorkout(): string[] {
  return WORKOUTS[Math.floor(Math.random() * WORKOUTS.length)];
}

// ── Walk Challenge ───────────────────────────────────────────────────────
export const WALK_CHALLENGE_STEPS = [
  'Put your shoes on.',
  'Step outside, even just to the front door or a balcony.',
  'Walk for at least 10 minutes, no destination needed.',
  'Notice five things you can see, hear, or feel as you walk.',
];

// ── Cold Shower Challenge ────────────────────────────────────────────────
export const COLD_SHOWER_STEPS = [
  'Start the shower cold, or finish your normal shower with 30-60 seconds of cold water.',
  'Breathe slowly through the shock, do not gasp or tense up.',
  'Stay in until the urge to jump out fades, usually 20-30 seconds.',
  'Notice how much clearer your head feels right after.',
];
