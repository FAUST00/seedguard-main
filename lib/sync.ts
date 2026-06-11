/**
 * lib/sync.ts
 * All Supabase auth + data sync for SeedGuard.
 */

import { supabase } from './supabase';

// ── Auth ──────────────────────────────────────────────────
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ── Streak ────────────────────────────────────────────────
export async function getStreakFromCloud(): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('streaks')
    .select('started_at')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data?.started_at ?? null;
}

export async function saveStreakToCloud(startDateISO: string) {
  const user = await getUser();
  if (!user) return;

  await supabase
    .from('streaks')
    .update({ active: false, ended_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('active', true);

  await supabase.from('streaks').insert({
    user_id: user.id,
    started_at: startDateISO,
    active: true,
  });
}

// ── Stats ─────────────────────────────────────────────────
export interface StatsPayload {
  currentStreak: number;
  totalDays: number;
  longestStreak: number;
  relapses: number;
}

export async function saveStatsToCloud(stats: StatsPayload) {
  const user = await getUser();
  if (!user) return;
  await supabase.from('profiles').upsert({
    id: user.id,
    stats_json: JSON.stringify(stats),
    updated_at: new Date().toISOString(),
  });
}

export async function logRelapseToCloud(note?: string) {
  const user = await getUser();
  if (!user) return;

  const { data: streak } = await supabase
    .from('streaks')
    .update({ active: false, ended_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('active', true)
    .select()
    .single();

  if (streak) {
    await supabase.from('history_logs').insert({
      user_id: user.id,
      streak_id: streak.id,
      started_at: streak.started_at,
      ended_at: streak.ended_at,
      note: note ?? null,
    });
  }
}

export async function getHistoryFromCloud() {
  const user = await getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('history_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('ended_at', { ascending: false });
  return data ?? [];
}

// ── Profile ───────────────────────────────────────────────
export async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function updateProfile(updates: { username?: string; avatar_url?: string }) {
  const user = await getUser();
  if (!user) return;
  await supabase.from('profiles').upsert({
    id: user.id,
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

// ── Main syncWithCloud (called by dashboard) ──────────────
export async function syncWithCloud(force = false): Promise<void> {
  try {
    const user = await getUser();
    if (!user) return;

    const streakStart =
      typeof window !== 'undefined' ? localStorage.getItem('seedguard_streak_start') : null;

    if (streakStart) {
      const cloudStart = await getStreakFromCloud();
      if (force || cloudStart !== streakStart) {
        await saveStreakToCloud(streakStart);
      }
    }

    const statsRaw =
      typeof window !== 'undefined' ? localStorage.getItem('seedguard_stats') : null;

    if (statsRaw) {
      await saveStatsToCloud(JSON.parse(statsRaw));
    }
  } catch (err) {
    console.warn('[syncWithCloud] failed silently:', err);
  }
}

// ── Migration ─────────────────────────────────────────────
export async function migrateLocalToCloud(): Promise<string[]> {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');

  const results: string[] = [];

  const streakStart = localStorage.getItem('seedguard_streak_start');
  if (streakStart) {
    await saveStreakToCloud(streakStart);
    results.push('✅ Streak imported');
  }

  const statsRaw = localStorage.getItem('seedguard_stats');
  if (statsRaw) {
    const stats = JSON.parse(statsRaw);
    await saveStatsToCloud(stats);
    const history = stats.history ?? stats.relapseLog ?? [];
    for (const item of history) {
      await supabase.from('history_logs').insert({
        user_id: user.id,
        started_at: item.startDate ?? item.started_at,
        ended_at: item.endDate ?? item.ended_at,
        note: item.note ?? null,
      });
    }
    results.push(`✅ ${history.length} history entries imported`);
  }

  const accountRaw =
    localStorage.getItem('seedguard_account') || localStorage.getItem('seedguard_profile');
  if (accountRaw) {
    const account = JSON.parse(accountRaw);
    await updateProfile({ username: account.username ?? account.name });
    results.push('✅ Profile imported');
  }

  if (results.length === 0) results.push('ℹ️ No local data found to import');
  return results;
}
