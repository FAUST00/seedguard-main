/**
 * Two-way accountability via Supabase.
 *
 * Each user designates one friend as their partner (one row in
 * `accountability`). "Mutual" = both point at each other. Check-in data is
 * read from the partner's world-readable profiles.gamification_json, so no
 * extra check-in table is needed. Nudges reuse the existing DM system.
 *
 * Every call is defensive: no-ops / returns null when logged out or before the
 * accountability migration has been run.
 */

import { supabase } from './supabase';
import { getUser } from './sync';
import { sendMessage } from './social';
import { checkinStreakFrom } from './partner';

export interface CloudPartner {
  partnerId: string;
  username: string;
  avatarUrl: string | null;
  checkinStreak: number;
  checkedInToday: boolean;
  mutual: boolean;
}

export async function setCloudPartner(partnerId: string): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    await supabase.from('accountability').upsert({
      user_id: user.id,
      partner_id: partnerId,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // table may not exist yet
  }
}

export async function clearCloudPartner(): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;
    await supabase.from('accountability').delete().eq('user_id', user.id);
  } catch {}
}

export async function getMyCloudPartner(): Promise<CloudPartner | null> {
  try {
    const user = await getUser();
    if (!user) return null;

    const { data: row, error } = await supabase
      .from('accountability')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error || !row?.partner_id) return null;
    const partnerId = row.partner_id as string;

    // Partner's public profile + synced check-ins
    const { data: prof } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, gamification_json')
      .eq('id', partnerId)
      .maybeSingle();

    let checkins: string[] = [];
    try {
      const blob = prof?.gamification_json ? JSON.parse(prof.gamification_json) : null;
      if (Array.isArray(blob?.partnerCheckins)) checkins = blob.partnerCheckins;
    } catch {}

    // Mutual? RLS only lets us read the partner's row when they picked us.
    const { data: back } = await supabase
      .from('accountability')
      .select('partner_id')
      .eq('user_id', partnerId)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    return {
      partnerId,
      username: prof?.username ?? 'Partner',
      avatarUrl: prof?.avatar_url ?? null,
      checkinStreak: checkinStreakFrom(checkins),
      checkedInToday: checkins.includes(today),
      mutual: back?.partner_id === user.id,
    };
  } catch {
    return null;
  }
}

/** Send a canned accountability nudge to the partner via DM. */
export async function nudgePartner(partnerId: string): Promise<void> {
  await sendMessage(partnerId, '👊 Accountability nudge — how’s your streak holding up today?');
}
