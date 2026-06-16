/**
 * Cross-device sync for the gamification layer (XP, quests, challenges,
 * accountability partner).
 *
 * Stored as a single JSON blob in profiles.gamification_json so it needs only
 * one additive column (see supabase/gamification.sql). Every call is wrapped
 * in try/catch and no-ops when logged out or when the column doesn't exist yet
 * — localStorage stays the source of truth, so the app works before the SQL
 * migration is run.
 */

import { supabase } from './supabase';
import { getUser } from './sync';
import { QUEST_EVENT } from './quests';
import type { Partner } from './partner';

const QUEST_XP_KEY = 'seedguard_quest_xp';
const PARTNER_KEY = 'seedguard_partner';
const CHECKIN_KEY = 'seedguard_partner_checkins';
const CHALLENGE_PREFIX = 'seedguard_challenge_';

interface GamificationBlob {
  questXp: number;
  partner: Partner | null;
  partnerCheckins: string[];
  challengeClaims: string[]; // claimed week keys
  updatedAt: string;
}

function getLocalBlob(): GamificationBlob {
  const challengeClaims: string[] = [];
  let partner: Partner | null = null;
  let partnerCheckins: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CHALLENGE_PREFIX) && localStorage.getItem(k) === '1') {
        challengeClaims.push(k.slice(CHALLENGE_PREFIX.length));
      }
    }
    partner = JSON.parse(localStorage.getItem(PARTNER_KEY) || 'null');
    partnerCheckins = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '[]');
  } catch {}
  return {
    questXp: Number(localStorage.getItem(QUEST_XP_KEY) || '0') || 0,
    partner,
    partnerCheckins: Array.isArray(partnerCheckins) ? partnerCheckins : [],
    challengeClaims,
    updatedAt: new Date().toISOString(),
  };
}

/** Merge remote into local (non-destructive) and persist the result locally. */
function applyMerged(local: GamificationBlob, remote: Partial<GamificationBlob>): GamificationBlob {
  const merged: GamificationBlob = {
    questXp: Math.max(local.questXp, Number(remote.questXp) || 0),
    partner: local.partner ?? remote.partner ?? null,
    partnerCheckins: Array.from(new Set([...local.partnerCheckins, ...(remote.partnerCheckins ?? [])])).sort(),
    challengeClaims: Array.from(new Set([...local.challengeClaims, ...(remote.challengeClaims ?? [])])),
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(QUEST_XP_KEY, String(merged.questXp));
    if (merged.partner) localStorage.setItem(PARTNER_KEY, JSON.stringify(merged.partner));
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(merged.partnerCheckins));
    for (const wk of merged.challengeClaims) localStorage.setItem(`${CHALLENGE_PREFIX}${wk}`, '1');
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
      // Nothing remote yet — seed it from local.
      await pushGamification();
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
