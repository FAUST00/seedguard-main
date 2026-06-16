/**
 * Accountability partner — a lightweight, local-first pairing.
 *
 * v1 is client-only: you name a partner and log daily check-ins to build a
 * shared cadence. Phase 4 (Supabase) can upgrade this to real two-way pairing
 * with notifications; the storage shape here is intentionally simple.
 */

const PARTNER_KEY = 'seedguard_partner';
const CHECKIN_KEY = 'seedguard_partner_checkins';

export interface Partner {
  name: string;
  since: string; // ISO date
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPartner(): Partner | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PARTNER_KEY);
    return raw ? (JSON.parse(raw) as Partner) : null;
  } catch {
    return null;
  }
}

export function setPartner(name: string): void {
  if (typeof window === 'undefined') return;
  const clean = name.trim().slice(0, 40);
  if (!clean) return;
  localStorage.setItem(PARTNER_KEY, JSON.stringify({ name: clean, since: today() }));
}

export function clearPartner(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PARTNER_KEY);
  localStorage.removeItem(CHECKIN_KEY);
}

export function getCheckins(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export function checkedInToday(): boolean {
  return getCheckins().includes(today());
}

/** Log today's check-in. Returns true if it was newly added. */
export function checkInToday(): boolean {
  if (typeof window === 'undefined') return false;
  const list = getCheckins();
  if (list.includes(today())) return false;
  localStorage.setItem(CHECKIN_KEY, JSON.stringify([...list, today()]));
  return true;
}

/** Consecutive-day check-in streak from an explicit check-in list (pure). */
export function checkinStreakFrom(checkins: string[]): number {
  const set = new Set(checkins);
  if (set.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Consecutive-day check-in streak ending today or yesterday. */
export function checkinStreak(): number {
  const set = new Set(getCheckins());
  if (set.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count if the most recent check-in was today or yesterday.
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
