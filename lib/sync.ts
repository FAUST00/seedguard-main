/**
 * lib/sync.ts - SeedGuard cloud sync via Supabase (client-side only)
 */
import { supabase } from './supabase';

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

// ── Streak ────────────────────────────────────────────────────────────

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

// ── Stats ─────────────────────────────────────────────────────────────

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

// ── History Entries ───────────────────────────────────────────────────
// Uses the 'entries' table: id, user_id, type, note, date, created_at
// The local entry id is stored in the 'local_id' column so we can
// efficiently delete by it without scanning all rows.

export interface HistoryEntry {
  id: string;           // local timestamp id
  date: string;         // display date string
  type: 'victory' | 'relapse';
  note?: string;
}

export async function saveHistoryEntryToCloud(entry: HistoryEntry): Promise<void> {
  // Always get a fresh auth check — don't rely on cached user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('entries').insert({
    user_id: user.id,
    local_id: entry.id,
    type: entry.type,
    note: entry.note ?? '',
    date: entry.date,
  });
  if (error) throw error;
}

export async function deleteHistoryEntryFromCloud(localId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Efficient: delete directly by local_id + user_id — no full table scan
  await supabase
    .from('entries')
    .delete()
    .eq('user_id', user.id)
    .eq('local_id', localId);
}

export async function getHistoryFromCloud(): Promise<HistoryEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('entries')
    .select('local_id, type, note, date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.local_id,
    type: row.type as 'victory' | 'relapse',
    note: row.note,
    date: row.date,
  }));
}

// ── Profile ───────────────────────────────────────────────────────────

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

// ── Main syncWithCloud (streak + stats) ───────────────────────────────

export async function syncWithCloud(force = false): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const streakStart = typeof window !== 'undefined'
      ? localStorage.getItem('seedguard_streak_start')
      : null;
    if (streakStart) {
      const cloudStart = await getStreakFromCloud();
      if (force || cloudStart !== streakStart) {
        await saveStreakToCloud(streakStart);
      }
    }
    const statsRaw = typeof window !== 'undefined'
      ? localStorage.getItem('seedguard_stats')
      : null;
    if (statsRaw) await saveStatsToCloud(JSON.parse(statsRaw));
  } catch (err) {
    console.warn('[syncWithCloud] silent fail:', err);
  }
}

// ── Migration (local → cloud, called once after first login) ──────────

export async function migrateLocalToCloud(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');
  const results: string[] = [];

  const streakStart = localStorage.getItem('seedguard_streak_start');
  if (streakStart) {
    await saveStreakToCloud(streakStart);
    results.push('✅ Streak imported');
  }

  const statsRaw = localStorage.getItem('seedguard_stats');
  if (statsRaw) {
    await saveStatsToCloud(JSON.parse(statsRaw));
    results.push('✅ Stats imported');
  }

  const historyRaw = localStorage.getItem('seedguard_history');
  if (historyRaw) {
    const entries: HistoryEntry[] = JSON.parse(historyRaw);
    // Only migrate entries that don't already exist in cloud
    const existing = await getHistoryFromCloud();
    const existingIds = new Set(existing.map((e) => e.id));
    const toMigrate = entries.filter((e) => !existingIds.has(e.id));
    for (const entry of toMigrate) {
      await saveHistoryEntryToCloud(entry);
    }
    if (toMigrate.length > 0) results.push(`✅ ${toMigrate.length} history entries imported`);
  }

  const accountRaw = localStorage.getItem('seedguard_account')
    || localStorage.getItem('seedguard_profile');
  if (accountRaw) {
    const account = JSON.parse(accountRaw);
    await updateProfile({ username: account.username ?? account.name });
    results.push('✅ Profile imported');
  }

  if (results.length === 0) results.push('ℹ️ No local data found to import');
  return results;
}
