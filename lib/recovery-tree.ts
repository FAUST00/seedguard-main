/**
 * Recovery Tree — a visual growth metaphor for the current streak, separate
 * from the Achievements tier system (SPARK/STEEL/SURGE/APEX). Achievements
 * are discrete milestone badges; the Recovery Tree is a continuous growth
 * visual tied only to the current streak, used on the Dashboard and the
 * dedicated Growth Journey page.
 */

export interface TreeStage {
  id: string;
  name: string;
  minDays: number;
  blurb: string;
  trunkHeight: number;   // px, base 0
  trunkWidth: number;
  canopyRadius: number;
  canopyCount: number;   // number of canopy lobes
  accent: 'seed' | 'green' | 'gold' | 'legendary';
  hasBlossoms: boolean;
  hasRoots: boolean;
  glow: boolean;
}

export const TREE_STAGES: TreeStage[] = [
  { id: 'seed',         name: 'Seed',              minDays: 0,   blurb: 'Every recovery starts here. Planted and waiting.',          trunkHeight: 0,  trunkWidth: 0,  canopyRadius: 7,  canopyCount: 0, accent: 'seed',      hasBlossoms: false, hasRoots: false, glow: false },
  { id: 'sprout',       name: 'Sprout',            minDays: 7,   blurb: 'The first week is the hardest. You broke through.',          trunkHeight: 18, trunkWidth: 3,  canopyRadius: 10, canopyCount: 1, accent: 'green',     hasBlossoms: false, hasRoots: false, glow: false },
  { id: 'young-plant',  name: 'Young Plant',       minDays: 14,  blurb: 'Two weeks of consistency. Roots are taking hold.',           trunkHeight: 30, trunkWidth: 4,  canopyRadius: 16, canopyCount: 1, accent: 'green',     hasBlossoms: false, hasRoots: false, glow: false },
  { id: 'growing-tree', name: 'Growing Tree',      minDays: 30,  blurb: 'A full month. This is no longer fragile.',                   trunkHeight: 46, trunkWidth: 6,  canopyRadius: 24, canopyCount: 3, accent: 'green',     hasBlossoms: false, hasRoots: true,  glow: false },
  { id: 'mature-tree',  name: 'Mature Tree',       minDays: 60,  blurb: 'Two months. The structure is strong and self-sustaining.',   trunkHeight: 58, trunkWidth: 8,  canopyRadius: 32, canopyCount: 4, accent: 'green',     hasBlossoms: false, hasRoots: true,  glow: false },
  { id: 'flourishing',  name: 'Flourishing Tree',  minDays: 90,  blurb: 'Ninety days. It is not just surviving, it is thriving.',     trunkHeight: 64, trunkWidth: 9,  canopyRadius: 38, canopyCount: 5, accent: 'gold',      hasBlossoms: true,  hasRoots: true,  glow: false },
  { id: 'ancient-tree', name: 'Ancient Tree',      minDays: 180, blurb: 'Six months. Few make it this far. You are rare.',           trunkHeight: 72, trunkWidth: 11, canopyRadius: 44, canopyCount: 6, accent: 'gold',      hasBlossoms: true,  hasRoots: true,  glow: true  },
  { id: 'legendary',    name: 'Legendary Tree',    minDays: 365, blurb: 'A full year. This is mastery. You are the proof it works.',  trunkHeight: 80, trunkWidth: 13, canopyRadius: 50, canopyCount: 7, accent: 'legendary', hasBlossoms: true,  hasRoots: true,  glow: true  },
];

export function getStageIndex(days: number): number {
  let idx = 0;
  for (let i = 0; i < TREE_STAGES.length; i++) {
    if (days >= TREE_STAGES[i].minDays) idx = i;
  }
  return idx;
}

export function getStage(days: number): TreeStage {
  return TREE_STAGES[getStageIndex(days)];
}

export function getNextStage(days: number): TreeStage | null {
  const idx = getStageIndex(days);
  return idx < TREE_STAGES.length - 1 ? TREE_STAGES[idx + 1] : null;
}

/** Days remaining until the next stage, or null if already at the final stage. */
export function daysToNextStage(days: number): number | null {
  const next = getNextStage(days);
  return next ? next.minDays - days : null;
}
