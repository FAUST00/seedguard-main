'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Flame, Trophy, Medal, Crown, RefreshCw, Loader2, Globe, Users, Calendar, Clock } from 'lucide-react';
import { ImageBanner } from '@/components/synth-background';
import { LeaderboardRowSkeleton } from '@/components/skeleton';
import { ProfileCard } from '@/components/profile-card';
import { useToast } from '@/components/toast';
import {
  getGlobalLeaderboard, getFriendsLeaderboard,
  getWeeklyLeaderboard, getMonthlyLeaderboard,
  fmtDate, daysSince, streakTier,
  type StreakEntry,
} from '@/lib/streaks';
import { syncProfileStreak } from '@/lib/social';
import { getUser } from '@/lib/sync';
import { supabase } from '@/lib/supabase';
import { ART } from '@/lib/assets';
import { EmptyState } from '@/components/ui';

type View = 'friends' | 'global' | 'weekly' | 'monthly';

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/20 border-2 border-gold/60 neon-box-gold flex-shrink-0" aria-label="1st place">
      <Crown className="w-5 h-5 text-gold flame-glow" aria-hidden />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-300/10 border-2 border-zinc-300/50 flex-shrink-0" aria-label="2nd place">
      <Medal className="w-5 h-5 text-zinc-300" aria-hidden />
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-600/10 border-2 border-amber-600/50 flex-shrink-0" aria-label="3rd place">
      <Medal className="w-5 h-5 text-amber-500" aria-hidden />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/20 border border-muted/30 flex-shrink-0">
      <span className="text-sm font-extrabold text-muted-foreground tabular-nums">#{rank}</span>
    </div>
  );
}

// ── Flame row ────────────────────────────────────────────────────────────────
function FlameRow({ days }: { days: number }) {
  const { flames, color } = streakTier(days);
  if (flames === 0) return null;
  return (
    <div className="flex gap-0.5" aria-label={`${flames} out of 5 flames`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame key={i} className={`w-3.5 h-3.5 ${i < flames ? `${color} flame-glow` : 'text-muted/25'}`} aria-hidden />
      ))}
    </div>
  );
}

// ── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderboardRow({ entry, rank }: { entry: StreakEntry; rank: number }) {
  const tier = streakTier(entry.current_streak);
  const stale = daysSince(entry.last_active ?? null);
  const initial = (entry.username ?? '?').charAt(0).toUpperCase();

  const rankBorder =
    rank === 1 ? 'border-gold/40' :
    rank === 2 ? 'border-zinc-300/30' :
    rank === 3 ? 'border-amber-600/30' :
    'border-muted/20';

  return (
    <li className={`rounded-2xl border ${rankBorder} glass-effect p-4 flex items-center gap-3 neon-hover transition-all duration-200 ${entry.isMe ? 'ring-1 ring-primary/40' : ''}`}>
      <RankBadge rank={rank} />

      <ProfileCard entry={entry}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 flex-shrink-0 ${tier.color}`}
          style={{ borderColor: 'hsl(var(--primary) / 0.45)' }}
        >
          {entry.avatar_url ? (
            <img src={entry.avatar_url} alt="" className="w-full h-full rounded-full object-cover" loading="lazy" />
          ) : initial}
        </div>
      </ProfileCard>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-sm truncate ${entry.isMe ? 'neon-text-pink text-primary' : ''}`}>{entry.username}</span>
          {entry.isMe && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold uppercase tracking-wider">You</span>
          )}
          {tier.label && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-muted/20 ${tier.color} uppercase tracking-wider font-semibold`}>{tier.label}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <FlameRow days={entry.current_streak} />
          <span className="text-xs text-muted-foreground tabular-nums">Best: {entry.best_streak}d</span>
          {entry.streak_start && (
            <span className="text-xs text-muted-foreground">Since {fmtDate(entry.streak_start)}</span>
          )}
          {stale >= 3 && !entry.isMe && (
            <span className="text-[10px] text-muted-foreground/60">Updated {stale}d ago</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`text-2xl md:text-3xl font-extrabold tabular-nums leading-none ${tier.color} ${rank <= 3 ? (rank === 1 ? 'neon-text-gold' : 'neon-text-pink') : ''}`}>
          {entry.current_streak}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">days</p>
      </div>
    </li>
  );
}

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS: { id: View; label: string; icon: typeof Globe; desc: string }[] = [
  { id: 'friends', label: 'Friends', icon: Users,    desc: 'Your circle ranked by current streak.' },
  { id: 'weekly',  label: 'This Week', icon: Clock,  desc: 'Warriors active in the last 7 days.' },
  { id: 'monthly', label: 'Monthly',  icon: Calendar, desc: 'Warriors active in the last 30 days.' },
  { id: 'global',  label: 'All Time', icon: Globe,   desc: 'Top 50 warriors site-wide, all time.' },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StreaksPage() {
  const { toast } = useToast();
  const [view, setView] = useState<View>('friends');
  const [entries, setEntries] = useState<StreakEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      let data: StreakEntry[];
      if (view === 'global')        data = await getGlobalLeaderboard();
      else if (view === 'weekly')   data = await getWeeklyLeaderboard();
      else if (view === 'monthly')  data = await getMonthlyLeaderboard();
      else                          data = await getFriendsLeaderboard();
      setEntries(data);
    } catch {}
  }, [view]);

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      await syncProfileStreak();
      let data: StreakEntry[];
      if (view === 'global')        data = await getGlobalLeaderboard();
      else if (view === 'weekly')   data = await getWeeklyLeaderboard();
      else if (view === 'monthly')  data = await getMonthlyLeaderboard();
      else                          data = await getFriendsLeaderboard();
      setEntries(data);
    } catch (err: unknown) {
      toast((err as Error).message ?? 'Failed to load leaderboard.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [view, toast]);

  useEffect(() => {
    getUser().then((u) => setLoggedIn(!!u));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const fetchEntriesRef = useRef(fetchEntries);
  useEffect(() => { fetchEntriesRef.current = fetchEntries; }, [fetchEntries]);

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchEntriesRef.current();
      })
      .subscribe();
    const interval = setInterval(() => { fetchEntriesRef.current(); }, 60_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const myEntry = entries.find((e) => e.isMe);
  const activeTab = TABS.find((t) => t.id === view)!;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-6 page-entry">
      <ImageBanner src={ART.laSunset} className="mb-2">
        <div className="p-6 md:p-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-widest uppercase italic neon-text-gold text-gold flex items-center gap-3">
              <Trophy className="w-8 h-8" aria-hidden />
              Streaks
            </h1>
            <p className="text-muted-foreground text-base mt-1">{activeTab.desc}</p>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            aria-label="Refresh leaderboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/30 text-gold bg-gold/10 hover:bg-gold/20 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <RefreshCw className="w-4 h-4" aria-hidden />}
            Refresh
          </button>
        </div>
      </ImageBanner>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="tablist" aria-label="Leaderboard scope">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`
              flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all border
              ${view === id
                ? 'bg-gold/20 text-gold border-gold/40 neon-box-gold'
                : 'text-muted-foreground border-muted/20 hover:text-foreground hover:bg-muted/20'}
            `}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {/* Weekly/Monthly context banner */}
      {(view === 'weekly' || view === 'monthly') && (
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-xs text-muted-foreground">
          <span className="text-secondary font-semibold">
            {view === 'weekly' ? '📅 This Week' : '🗓️ This Month'}:
          </span>{' '}
          Shows everyone who has been active in the last {view === 'weekly' ? '7' : '30'} days, ranked by their current streak.
          A fresh start still earns you a spot here.
        </div>
      )}

      {/* My rank card */}
      {loggedIn && myEntry && !loading && (
        <div className="rounded-2xl border border-primary/30 glass-effect p-4 flex items-center gap-4 neon-box-pink animate-scale-in">
          <RankBadge rank={myEntry.rank} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Your rank</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold neon-text-pink text-primary">{myEntry.username}</span>
              <FlameRow days={myEntry.current_streak} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-extrabold neon-text-pink text-primary tabular-nums">{myEntry.current_streak}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">days</p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <ul className="space-y-3" aria-label="Loading leaderboard">
          {Array.from({ length: 6 }).map((_, i) => <li key={i}><LeaderboardRowSkeleton /></li>)}
        </ul>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-muted/30">
          {view === 'friends' ? (
            <EmptyState
              Icon={Users}
              accent="gold"
              title="No friends yet"
              description="Add friends in the Social tab to see their streaks ranked here."
            />
          ) : (
            <EmptyState
              Icon={Flame}
              accent="gold"
              title="No data yet"
              description="Be the first — create an account and start your streak to claim the top spot."
            />
          )}
        </div>
      ) : (
        <>
          <ul className="space-y-3" role="list" aria-label={`${activeTab.label} leaderboard`}>
            {entries.map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={entry.rank} />
            ))}
          </ul>

          <div className="rounded-xl border border-muted/15 bg-muted/5 p-4 flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
            <span><strong className="text-foreground">{entries.length}</strong> {view === 'global' ? 'users ranked' : view === 'friends' ? 'friends tracked' : 'warriors'}</span>
            <span>Top streak: <strong className={streakTier(entries[0]?.current_streak ?? 0).color}>{entries[0]?.current_streak ?? 0} days</strong></span>
            <span>Avg: <strong className="text-foreground">{Math.round(entries.reduce((s, e) => s + e.current_streak, 0) / (entries.length || 1))} days</strong></span>
          </div>
        </>
      )}

      <div className="rounded-xl border border-muted/15 bg-muted/5 p-5 text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold text-foreground uppercase tracking-wider text-xs">How it updates</p>
        <p>Your streak syncs every time you open this tab or the Dashboard. Friends appear once connected in the Social tab. Weekly and Monthly boards reset automatically — a fresh start still earns you a place.</p>
      </div>
    </div>
  );
}
