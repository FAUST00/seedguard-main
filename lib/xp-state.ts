/**
 * Canonical live XP.
 *
 * The dashboard is the single authority that computes total XP (from the live
 * streak/stats + banked quest XP). It publishes the result here so every other
 * XP display — notably the sidebar level bar — mirrors the exact same number
 * instead of recomputing from possibly-stale localStorage and drifting.
 */

const KEY = 'seedguard_total_xp';
export const XP_EVENT = 'seedguard:xp';

/** Publish the authoritative total XP and notify mirrors. */
export function setLiveXp(xp: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, String(Math.max(0, Math.round(xp))));
    window.dispatchEvent(new CustomEvent(XP_EVENT));
  } catch {}
}

/** Read the canonical total XP, or null if it hasn't been published yet. */
export function getLiveXp(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
