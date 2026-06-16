/**
 * Cross-device sync for the gamification layer (XP, quests, challenges,
 * accountability partner, seen achievements).
 *
 * Stored as a single JSON blob in profiles.gamification_json (one additive
 * column — see supabase/gamification.sql). Every call is wrapped in try/catch
 * and no-ops when logged out or before the column exists, so localStorage stays
 * the source of truth and the app works before the migration is run.
 *
 * Quest/challenge XP is RECOMPUTED from the merged completion history on every
 * sync (not max-merged), so XP earned on different devices the same day sums
 * exactly and can never double-count, regardless of sync order.
 */

import { supabase } from './supabase';
import { getUser } from './sync';
import { QUEST_EVENT, DAILY_QUESTS } from './quests';
import { activeChallenge } from './challenges';
import type { Partner } from './partner';

const QUEST_XP_KEY = 'seedguard_quest_xp';
const PARTNER_KEY = 'seedguard_partner';
const CHECKIN_KEY = 'seedguard_partner_checkins';
const CHALLENGE_PREFIX = 'seedguard_challenge_';
const QUESTS_PREFIX = 'seedguard_quests_';
const ACH_SEEN_KEY = 'seedguard_ach_seen';
const QUEST_DAY_CAP = 400; // bound blob size; ~13 months of daily history

interface GamificationBlob {
  partner: Partner | null;
  partnerCheckins: string[];
  challengeClaims: string[];               // claimed week keys
  questDays: Record<string, string[]>;     // date -> completed quest ids
  achSeen: string[];                        // achievement ids already celebrated
  updatedAt: string;
}

/** Sum of all bonus XP implied by quest-day completions + claimed challenges. */
function computeBonusXp(questDays: Record<string, string[]>, claims: string[]): number {
  const xpById = new Map(DAILY_QUESTS.map((q) => [q.id, q.xp]));
  let xp = 0;
  for (const ids of Object.values(questDays)) {
    for (const id of ids) xp += xpById.get(id) ?? 0;
  }
  for (const wk of claims) {
    try { xp += activeChallenge(new Date(wk)).xp; } catch {}
  }
  return xp;
}

function readQuestDays(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(QUESTS_PREFIX)) {
        const date = k.slice(QUESTS_PREFIX.length);
        const ids = JSON.parse(localStorage.getItem(k) || '[]');
        if (Array.isArray(ids) && ids.length) out[date] = ids;
      }
    }
  } catch {}
  return out;
}

/** Keep only the most recent QUEST_DAY_CAP days. */
function capDays(days: Record<string, string[]>): Record<string, string[]> {
  const keys = Object.keys(days).sort().slice(-QUEST_DAY_CAP);
  const out: Record<string, string[]> = {};
  for (const k of keys) out[k] = days[k];
  return out;
}

function getLocalBlob(): GamificationBlob {
  const challengeClaims: string[] = [];
  let partner: Partner | null = null;
  let partnerCheckins: string[] = [];
  let achSeen: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CHALLENGE_PREFIX) && localStorage.getItem(k) === '1') {
        challengeClaims.push(k.slice(CHALLENGE_PREFIX.length));
      }
    }
    partner = JSON.parse(localStorage.getItem(PARTNER_KEY) || 'null');
    partnerCheckins = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '[]');
    achSeen = JSON.parse(localStorage.getItem(ACH_SEEN_KEY) || '[]');
  } catch {}
  return {
    partner,
    partnerCheckins: Array.isArray(partnerCheckins) ? partnerCheckins : [],
    challengeClaims,
    questDays: capDays(readQuestDays()),
    achSeen: Array.isArray(achSeen) ? achSeen : [],
    updatedAt: new Date().toISOString(),
  };
}

/** Merge remote into local (non-destructive) and persist the result locally. */
function applyMerged(local: GamificationBlob, remote: Partial<GamificationBlob>): GamificationBlob {
  // Per-date union of quest completions.
  const questDays: Record<string, string[]> = { ...local.questDays };
  const remoteDays = remote.questDays ?? {};
  for (const [date, ids] of Object.entries(remoteDays)) {
    questDays[date] = Array.from(new Set([...(questDays[date] ?? []), ...ids]));
  }
  const cappedDays = capDays(questDays);

  const merged: GamificationBlob = {
    partner: local.partner ?? remote.partner ?? null,
    partnerCheckins: Array.from(new Set([...local.partnerCheckins, ...(remote.partnerCheckins ?? [])])).sort(),
    challengeClaims: Array.from(new Set([...local.challengeClaims, ...(remote.challengeClaims ?? [])])),
    questDays: cappedDays,
    achSeen: Array.from(new Set([...local.achSeen, ...(remote.achSeen ?? [])])),
    updatedAt: new Date().toISOString(),
  };
  try {
    if (merged.partner) localStorage.setItem(PARTNER_KEY, JSON.stringify(merged.partner));
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(merged.partnerCheckins));
    localStorage.setItem(ACH_SEEN_KEY, JSON.stringify(merged.achSeen));
    for (const wk of merged.challengeClaims) localStorage.setItem(`${CHALLENGE_PREFIX}${wk}`, '1');
    for (const [date, ids] of Object.entries(cappedDays)) {
      localStorage.setItem(`${QUESTS_PREFIX}${date}`, JSON.stringify(ids));
    }
    // Recompute exact bonus XP from the merged history.
    localStorage.setItem(QUEST_XP_KEY, String(computeBonusXp(cappedDays, merged.challengeClaims)));
  } catch {}
  return merged;
}

/** Push the local gamification blob to the cloud. Safe no-op when logged out. */
export async function pushGamification(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const user = await getUser();
    if (!user) return;
    const blob = getLocalBlob();
    await supabase.from('profiles').upsert({
      id: user.id,
      gamification_json: JSON.stringify(blob),
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Column may not exist yet, or offline — localStorage remains the truth.
  }
}

/**
 * Pull the cloud blob, merge it into localStorage, and push the merged result
 * back so both sides converge. Fires QUEST_EVENT so widgets recompute.
 */
export async function pullGamification(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const user = await getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('gamification_json')
      .eq('id', user.id)
      .single();
    if (error || !data?.gamification_json) {
      await pushGamification(); // seed from local
      return;
    }
    const remote = JSON.parse(data.gamification_json) as Partial<GamificationBlob>;
    applyMerged(getLocalBlob(), remote);
    window.dispatchEvent(new CustomEvent(QUEST_EVENT));
    await pushGamification();
  } catch {
    // No-op — local stays authoritative.
  }
}
