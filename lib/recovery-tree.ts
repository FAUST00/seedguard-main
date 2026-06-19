/**
 * Recovery Tree — a visual growth metaphor for the current streak, separate
 * from the Achievements tier system (SPARK/STEEL/SURGE/APEX). Achievements
 * are discrete milestone badges; the Recovery Tree is a continuous living
 * scene tied only to the current streak, used on the Dashboard (compact),
 * the Emergency Toolkit banner (compact), and the dedicated Growth Journey
 * page (full layered scene).
 */

export type Particle = 'fireflies' | 'aurora' | 'lanterns' | 'spores';
export type Creature = 'butterfly' | 'butterfly2' | 'bird' | 'bird2' | 'deer';

export interface TreeStage {
  id: string;
  name: string;
  minDays: number;
  blurb: string;
  // Compact-component visuals (Dashboard widget, Emergency Toolkit banner)
  trunkHeight: number;
  trunkWidth: number;
  canopyRadius: number;
  canopyCount: number;
  accent: 'seed' | 'green' | 'gold' | 'legendary' | 'world';
  hasBlossoms: boolean;
  hasRoots: boolean;
  glow: boolean;
  // Full-scene visuals (Growth Journey page only)
  sky: [string, string]; // [top, bottom] gradient colors
  grassDensity: 0 | 1 | 2 | 3 | 4 | 5;
  water: 'none' | 'stream' | 'waterfall';
  bioluminescent: boolean;
  rootsGlow: boolean;
  particles: Particle[];
  creatures: Creature[];
}

export const TREE_STAGES: TreeStage[] = [
  {
    id: 'seed', name: 'Seed', minDays: 0,
    blurb: 'Every recovery starts here. Planted and waiting.',
    trunkHeight: 0, trunkWidth: 0, canopyRadius: 7, canopyCount: 0, accent: 'seed',
    hasBlossoms: false, hasRoots: false, glow: false,
    sky: ['#2a2440', '#100c1f'], grassDensity: 0, water: 'none',
    bioluminescent: false, rootsGlow: false, particles: [], creatures: [],
  },
  {
    id: 'sprout', name: 'Sprout', minDays: 7,
    blurb: 'The first week is the hardest. You broke through.',
    trunkHeight: 18, trunkWidth: 3, canopyRadius: 10, canopyCount: 1, accent: 'green',
    hasBlossoms: false, hasRoots: false, glow: false,
    sky: ['#3a3a6b', '#1a1530'], grassDensity: 1, water: 'none',
    bioluminescent: false, rootsGlow: false, particles: [], creatures: [],
  },
  {
    id: 'young-plant', name: 'Young Plant', minDays: 14,
    blurb: 'Two weeks of consistency. Roots are taking hold.',
    trunkHeight: 30, trunkWidth: 4, canopyRadius: 16, canopyCount: 1, accent: 'green',
    hasBlossoms: false, hasRoots: false, glow: false,
    sky: ['#4a5a8a', '#202040'], grassDensity: 2, water: 'none',
    bioluminescent: false, rootsGlow: false, particles: [], creatures: [],
  },
  {
    id: 'growing-tree', name: 'Growing Tree', minDays: 30,
    blurb: 'A full month. This is no longer fragile.',
    trunkHeight: 46, trunkWidth: 6, canopyRadius: 24, canopyCount: 3, accent: 'green',
    hasBlossoms: false, hasRoots: true, glow: false,
    sky: ['#6f8fc0', '#28284a'], grassDensity: 3, water: 'stream',
    bioluminescent: false, rootsGlow: false, particles: [], creatures: ['butterfly'],
  },
  {
    id: 'healthy-tree', name: 'Healthy Tree', minDays: 60,
    blurb: 'Two months. The structure is strong and self-sustaining.',
    trunkHeight: 58, trunkWidth: 8, canopyRadius: 32, canopyCount: 4, accent: 'green',
    hasBlossoms: false, hasRoots: true, glow: false,
    sky: ['#8fb8d8', '#2c3a5a'], grassDensity: 4, water: 'stream',
    bioluminescent: false, rootsGlow: false, particles: [], creatures: ['butterfly', 'butterfly2', 'bird'],
  },
  {
    id: 'mature-tree', name: 'Mature Tree', minDays: 90,
    blurb: 'Ninety days. It is not just surviving, it is thriving.',
    trunkHeight: 64, trunkWidth: 9, canopyRadius: 38, canopyCount: 5, accent: 'gold',
    hasBlossoms: true, hasRoots: true, glow: false,
    sky: ['#e8a064', '#3a2c4a'], grassDensity: 5, water: 'waterfall',
    bioluminescent: false, rootsGlow: false, particles: ['fireflies'], creatures: ['butterfly', 'butterfly2', 'bird', 'bird2'],
  },
  {
    id: 'ancient-tree', name: 'Ancient Tree', minDays: 180,
    blurb: 'Six months. Few make it this far. You are rare.',
    trunkHeight: 72, trunkWidth: 11, canopyRadius: 44, canopyCount: 6, accent: 'gold',
    hasBlossoms: true, hasRoots: true, glow: true,
    sky: ['#3a3a6a', '#0c0c1c'], grassDensity: 5, water: 'waterfall',
    bioluminescent: false, rootsGlow: false, particles: ['fireflies'], creatures: ['butterfly', 'butterfly2', 'bird', 'bird2', 'deer'],
  },
  {
    id: 'legendary-tree', name: 'Legendary Tree', minDays: 365,
    blurb: 'A full year. This is mastery. You are the proof it works.',
    trunkHeight: 80, trunkWidth: 13, canopyRadius: 50, canopyCount: 7, accent: 'legendary',
    hasBlossoms: true, hasRoots: true, glow: true,
    sky: ['#1a1438', '#06040f'], grassDensity: 5, water: 'waterfall',
    bioluminescent: true, rootsGlow: false, particles: ['fireflies', 'aurora', 'lanterns'],
    creatures: ['butterfly', 'butterfly2', 'bird', 'bird2', 'deer'],
  },
  {
    id: 'world-tree', name: 'World Tree', minDays: 730,
    blurb: 'Two years and beyond. You are the proof it works, on a scale few ever reach.',
    trunkHeight: 96, trunkWidth: 17, canopyRadius: 60, canopyCount: 7, accent: 'world',
    hasBlossoms: true, hasRoots: true, glow: true,
    sky: ['#241a44', '#04030c'], grassDensity: 5, water: 'waterfall',
    bioluminescent: true, rootsGlow: true, particles: ['fireflies', 'aurora', 'lanterns', 'spores'],
    creatures: ['butterfly', 'butterfly2', 'bird', 'bird2', 'deer'],
  },
];

/** Micro-unlocks between (and including) full stage transitions — keeps a
 * reward arriving every 1-4 weeks early on instead of long silent gaps. */
export interface Unlock {
  day: number;
  stageId?: string; // present when this unlock IS a full stage transition
  items: string[];
}

export const UNLOCKS: Unlock[] = [
  { day: 3,   items: ['First grass blades'] },
  { day: 7,   stageId: 'sprout',       items: ['Sprout stage', 'Morning dew sparkle'] },
  { day: 10,  items: ['Flower bud forms'] },
  { day: 14,  stageId: 'young-plant',  items: ['Young Plant stage', 'First bloom'] },
  { day: 21,  items: ['Second butterfly'] },
  { day: 30,  stageId: 'growing-tree', items: ['Growing Tree stage', 'New branches', 'Butterflies', 'River expansion'] },
  { day: 45,  items: ['River widens'] },
  { day: 60,  stageId: 'healthy-tree', items: ['Healthy Tree stage', 'First bird', 'Denser grass'] },
  { day: 75,  items: ['Second bird'] },
  { day: 90,  stageId: 'mature-tree',  items: ['Mature Tree stage', 'Blossoms', 'Waterfall', 'Fireflies at dusk'] },
  { day: 120, items: ['Waterfall upgrade', 'Golden hour lighting'] },
  { day: 150, items: ['Deer appears'] },
  { day: 180, stageId: 'ancient-tree', items: ['Ancient Tree stage', 'Mist', 'Stars visible'] },
  { day: 270, items: ['Bioluminescent moss'] },
  { day: 365, stageId: 'legendary-tree', items: ['Legendary Tree stage', 'Aurora', 'Floating lanterns'] },
  { day: 450, items: ['More lanterns'] },
  { day: 545, items: ['Firefly swarm upgrade'] },
  { day: 730, stageId: 'world-tree',   items: ['World Tree stage', 'Glowing roots', 'Ocean horizon', 'Falling light spores'] },
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

/** Days remaining until the next full stage, or null if already at the final stage. */
export function daysToNextStage(days: number): number | null {
  const next = getNextStage(days);
  return next ? next.minDays - days : null;
}

/** The nearest upcoming unlock (stage or micro-unlock), or null if every unlock is reached. */
export function getNextUnlock(days: number): { daysLeft: number; unlock: Unlock } | null {
  const next = UNLOCKS.find((u) => u.day > days);
  return next ? { daysLeft: next.day - days, unlock: next } : null;
}
