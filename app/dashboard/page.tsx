'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame, TrendingUp, Award, Calendar, Clock, Users, ChevronRight,
  Quote, AlertTriangle, X, Wind, Lock, Cloud, Plus,
} from 'lucide-react';
import { syncWithCloud, getStreakFromCloud, getUser } from '@/lib/sync';
import { playSound } from '@/lib/sound';
import { ALL_BADGES, computeEarnedBadgeIds, type BadgeStats } from '@/lib/badges';
import { StatCard, PageHeader, SectionHeading } from '@/components/ui';
import { XpBar } from '@/components/xp-bar';
import { QuestBoard } from '@/components/quest-board';
import { computeXp, levelFromXp, type LevelInfo } from '@/lib/xp';
import { completeQuest, getQuestXp } from '@/lib/quests';
import { RecoveryHeatmap } from '@/components/recovery-heatmap';
import { RecoveryScore } from '@/components/recovery-score';
import { WeeklyTrend } from '@/components/weekly-trend';
import { MilestoneRoadmap } from '@/components/milestone-roadmap';
import { QUOTES, randomQuoteIndex } from '@/lib/quotes';
import { MILESTONE_DAYS, MILESTONE_MESSAGES } from '@/lib/milestones';
import { MOODS, todayMoodKey } from '@/lib/mood';
import { Confetti } from '@/components/confetti';
import { BreathingTimer } from '@/components/breathing-timer';
import { QuickLogSheet } from '@/components/quick-log-sheet';
import { WeeklyChallenge } from '@/components/weekly-challenge';
import { AccountabilityPartner } from '@/components/accountability-partner';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  currentStreak: number;
  totalDays: number;
  longestStreak: number;
  relapses: number;
}

interface TimerParts {
  days: number; hours: number; minutes: number; seconds: number;
}

function pad(n: number): string { return String(n).padStart(2, '0'); }


// ── Streak start resolver ──────────────────────────────────────────────────
async function resolveStreakStart(): Promise<Date> {
  try {
    const cloudStart = await getStreakFromCloud();
    if (cloudStart) {
      if (typeof window !== 'undefined') localStorage.setItem('seedguard_streak_start', cloudStart);
      return new Date(cloudStart);
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('seedguard_streak_start') : null;
    if (local) return new Date(local);

    const relapses = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('seedguard_relapses') || '[]' : '[]');
    if (relapses.length > 0) {
      const latest = [...relapses].sort((a: { relapse_time: string }, b: { relapse_time: string }) =>
        new Date(b.relapse_time).getTime() - new Date(a.relapse_time).getTime()
      )[0];
      const d = new Date(latest.relapse_time);
      localStorage.setItem('seedguard_streak_start', d.toISOString());
      return d;
    }
    const profile = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('seedguard_profile') || 'null' : 'null');
    if (profile?.created_at) {
      const d = new Date(profile.created_at);
      localStorage.setItem('seedguard_streak_start', d.toISOString());
      return d;
    }
  } catch {}
  const now = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem('seedguard_streak_start', now);
    localStorage.setItem('seedguard_first_day', now);
  }
  return new Date(now);
}

function getFirstDay(): Date {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('seedguard_first_day') : null;
  if (stored) return new Date(stored);
  const now = new Date().toISOString();
  if (typeof window !== 'undefined') localStorage.setItem('seedguard_first_day', now);
  return new Date(now);
}

// ── Progress ring ─────────────────────────────────────────────────────────
const CIRC = 2 * Math.PI * 88; // r=88

function getRingProgress(days: number): { prev: number; next: number; pct: number } {
  const next = MILESTONE_DAYS.find((m) => m > days) ?? MILESTONE_DAYS[MILESTONE_DAYS.length - 1];
  const prev = [...MILESTONE_DAYS].reverse().find((m) => m <= days) ?? 0;
  const pct = next === prev ? 1 : (days - prev) / (next - prev);
  return { prev, next, pct: Math.min(1, Math.max(0, pct)) };
}

// ── Main dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ currentStreak: 0, totalDays: 0, longestStreak: 0, relapses: 0 });
  const [timer, setTimer] = useState<TimerParts>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [showStreakEdit, setShowStreakEdit] = useState(false);
  const [editDateInput, setEditDateInput] = useState('');
  const [streakDisplayDate, setStreakDisplayDate] = useState('');
  const [isAnonMode, setIsAnonMode] = useState(false);
  const [showAnonExitConfirm, setShowAnonExitConfirm] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Quote
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const currentQuote = QUOTES[quoteIndex];
  useEffect(() => {
    const id = setInterval(() => setQuoteIndex((p) => randomQuoteIndex(p)), 3_600_000);
    return () => clearInterval(id);
  }, []);

  // Celebration modal
  const [celebration, setCelebration] = useState<{ day: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Urge surfing modal
  const [showUrge, setShowUrge] = useState(false);

  // Mood check-in
  const [showMood, setShowMood] = useState(false);
  const [todayMood, setTodayMood] = useState<number | null>(null);

  // Badges
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);

  // XP / level
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(() => levelFromXp(0));
  const [questBump, setQuestBump] = useState(0); // increments when a quest completes → recomputes XP

  const prevDaysRef = useRef(0);
  const streakStartRef = useRef<Date | null>(null);

  // Check onboarding + anon mode on first render
  useEffect(() => {
    const done = localStorage.getItem('seedguard_onboarded');
    if (!done) router.replace('/onboarding');
    setIsAnonMode(localStorage.getItem('seedguard_anon_mode') === '1');
  }, [router]);

  // Check today's mood
  useEffect(() => {
    const saved = localStorage.getItem(todayMoodKey());
    if (saved) setTodayMood(Number(saved));
    else {
      // Show mood prompt after a 3-second delay (feels natural, not abrupt)
      const id = setTimeout(() => setShowMood(true), 3000);
      return () => clearTimeout(id);
    }
  }, []);

  // Init streak + stats
  useEffect(() => {
    async function init() {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('seedguard_stats') : null;
        if (saved) setStats(JSON.parse(saved));
      } catch {}
      const user = await getUser();
      setHasAccount(!!(user || (typeof window !== 'undefined' && localStorage.getItem('seedguard_account'))));
      const start = await resolveStreakStart();
      streakStartRef.current = start;
      setStreakDisplayDate(start.toLocaleDateString());
      setLoading(false);
    }
    init();
  }, []);

  // Live timer
  useEffect(() => {
    const tick = () => {
      const start = streakStartRef.current;
      if (!start) return;
      const totalSec = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
      setTimer({
        days: Math.floor(totalSec / 86400),
        hours: Math.floor((totalSec % 86400) / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Sync stats + milestone check when day changes
  useEffect(() => {
    if (loading) return;
    const updated = (() => {
      const firstDay = getFirstDay();
      const totalDays = Math.floor((Date.now() - firstDay.getTime()) / 86400000);
      const longestStreak = Math.max(stats.longestStreak, timer.days);
      return { ...stats, currentStreak: timer.days, totalDays, longestStreak };
    })();
    setStats(updated);
    if (typeof window !== 'undefined') localStorage.setItem('seedguard_stats', JSON.stringify(updated));
    syncWithCloud().catch(() => {});

    // Milestone check
    const prev = prevDaysRef.current;
    const curr = timer.days;
    if (curr > prev && MILESTONE_DAYS.includes(curr)) {
      const celebrated = JSON.parse(localStorage.getItem('seedguard_celebrated') || '[]') as number[];
      if (!celebrated.includes(curr)) {
        playSound('milestone');
        setCelebration({ day: curr });
        setShowConfetti(true);
        localStorage.setItem('seedguard_celebrated', JSON.stringify([...celebrated, curr]));
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
    prevDaysRef.current = curr;

    // Update badges
    const historyRaw = typeof window !== 'undefined' ? localStorage.getItem('seedguard_history') : null;
    const entryCount = historyRaw ? (JSON.parse(historyRaw) as unknown[]).length : 0;
    const badgeStats: BadgeStats = {
      streak: curr,
      totalDays: updated.totalDays,
      relapses: updated.relapses,
      entryCount,
    };
    const badgeIds = computeEarnedBadgeIds(badgeStats);
    setEarnedBadgeIds(badgeIds);

    // XP / level — derived from progress + banked quest XP
    const xp = computeXp({
      totalDays: updated.totalDays,
      longestStreak: updated.longestStreak,
      entryCount,
      badgeCount: badgeIds.length,
      questXp: getQuestXp(),
    });
    setLevelInfo(levelFromXp(xp));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.days, loading, questBump]);

  // Just showing up and holding the streak completes the daily "hold" quest;
  // any quest completion bumps a counter so XP recomputes with fresh stats.
  useEffect(() => {
    if (loading) return;
    completeQuest('hold');
    const onQuest = () => setQuestBump((n) => n + 1);
    window.addEventListener('seedguard:quests', onQuest);
    return () => window.removeEventListener('seedguard:quests', onQuest);
  }, [loading]);

  const handleSaveStreak = async () => {
    if (!editDateInput) return;
    const d = new Date(editDateInput);
    if (isNaN(d.getTime())) return;
    if (typeof window !== 'undefined') localStorage.setItem('seedguard_streak_start', d.toISOString());
    streakStartRef.current = d;
    await syncWithCloud(true).catch(() => {});
    setStreakDisplayDate(d.toLocaleDateString());
    setShowStreakEdit(false);
    window.location.reload();
  };

  const handleMoodSelect = (value: number) => {
    setTodayMood(value);
    localStorage.setItem(todayMoodKey(), String(value));
    setShowMood(false);
    completeQuest('checkin');
  };

  const { prev: ringPrev, next: ringNext, pct: ringPct } = getRingProgress(timer.days);
  const earnedBadges = ALL_BADGES.filter((b) => earnedBadgeIds.includes(b.id));

  if (typeof window === 'undefined') return null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 page-entry">

      {/* ── Quick Log Sheet ───────────────────────────────────────────── */}
      {showQuickLog && <QuickLogSheet onClose={() => setShowQuickLog(false)} />}

      {/* ── Quick Log FAB (mobile) ────────────────────────────────────── */}
      <button
        onClick={() => setShowQuickLog(true)}
        aria-label="Quick log entry"
        className="fixed bottom-24 right-4 z-40 md:hidden w-14 h-14 rounded-full bg-primary/80 border-2 border-primary text-white flex items-center justify-center neon-box-pink shadow-xl hover:bg-primary transition-all active:scale-95"
      >
        <Plus className="w-7 h-7" aria-hidden />
      </button>

      {/* ── Anon mode banner ─────────────────────────────────────────── */}
      {isAnonMode && (
        <div className="rounded-xl border border-muted/30 bg-muted/10 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
            <Lock className="w-4 h-4 flex-shrink-0" aria-hidden />
            <span><strong className="text-foreground">Anonymous Mode</strong> — data stored on this device only.</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/account" className="text-xs px-3 py-1.5 rounded-lg border border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20 font-semibold transition-all flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Sign in to sync
            </Link>
            <button
              onClick={() => setShowAnonExitConfirm(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold transition-all"
            >
              Exit &amp; Reset
            </button>
          </div>
        </div>
      )}

      {/* ── Anon exit confirm modal ───────────────────────────────────── */}
      {showAnonExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAnonExitConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-destructive/40 bg-background/97 p-6 space-y-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden />
              <h3 className="font-bold text-destructive uppercase tracking-wider text-sm">Exit Anonymous Mode</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This will <strong className="text-foreground">permanently delete</strong> all your local streak data, history, and settings, then return you to the landing page. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const keys = Object.keys(localStorage).filter(k => k.startsWith('seedguard_'));
                  keys.forEach(k => localStorage.removeItem(k));
                  window.location.href = '/seedguard-main/';
                }}
                className="flex-1 py-2.5 rounded-xl bg-destructive/20 border border-destructive/50 text-destructive font-bold text-sm hover:bg-destructive/30 transition-all"
              >
                Yes, Exit &amp; Reset
              </button>
              <button onClick={() => setShowAnonExitConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-muted/40 text-muted-foreground text-sm hover:bg-muted/20 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti overlay */}
      {showConfetti && <Confetti />}

      {/* ── Milestone Celebration Modal ───────────────────────────────── */}
      {celebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setCelebration(null)}>
          <div
            className="relative w-full max-w-sm rounded-2xl border border-primary/40 bg-background/95 p-8 text-center space-y-4 neon-box-pink animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setCelebration(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <div className="text-5xl">{MILESTONE_MESSAGES[celebration.day]?.title.split(' ')[0]}</div>
            <h2 className="text-2xl font-extrabold neon-text-pink text-primary uppercase tracking-wider">
              {MILESTONE_MESSAGES[celebration.day]?.title.split(' ').slice(1).join(' ')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {MILESTONE_MESSAGES[celebration.day]?.body}
            </p>
            <div className="text-4xl font-display font-black text-primary neon-text-pink">Day {celebration.day}</div>
            <button
              onClick={() => setCelebration(null)}
              className="w-full py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-bold uppercase tracking-wider hover:bg-primary/30 transition-all"
            >
              Keep Going 🔥
            </button>
          </div>
        </div>
      )}

      {/* ── Mood Check-In Modal ───────────────────────────────────────── */}
      {showMood && !todayMood && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowMood(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-secondary/30 bg-background/97 p-6 space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-secondary neon-text-cyan text-sm">Daily Check-In</h3>
              <button onClick={() => setShowMood(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-foreground font-semibold">How are you feeling today?</p>
            <div className="flex justify-between gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleMoodSelect(m.value)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border border-muted/30 bg-muted/10 hover:bg-muted/25 hover:border-secondary/40 transition-all"
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center">Logged once per day — tracks your emotional journey.</p>
          </div>
        </div>
      )}

      {/* ── Urge Surfing Modal ────────────────────────────────────────── */}
      {showUrge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-destructive/40 bg-background/97 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-secondary" aria-hidden />
                <h3 className="font-bold uppercase tracking-wider text-secondary text-sm neon-text-cyan">Urge Surfing</h3>
              </div>
              <button onClick={() => setShowUrge(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              An urge lasts <strong className="text-foreground">90 seconds</strong> at peak intensity. Breathe through it. You have survived every urge so far — this one is no different.
            </p>

            <BreathingTimer />

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground italic text-center">
                &ldquo;{QUOTES[Math.floor(Math.random() * QUOTES.length)].text}&rdquo;
              </p>
            </div>

            <Link
              href="/history"
              onClick={() => setShowUrge(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/20 text-sm font-medium transition-all"
            >
              I made it — Log a Victory ✓
            </Link>
          </div>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <PageHeader
        title="Dashboard"
        subtitle={timer.days === 0
          ? 'Every journey starts with a single day. Today is that day.'
          : `Day ${timer.days} — every second you hold is a victory.`}
        actions={
          <>
            {todayMood && (
              <span className="text-lg" title={`Today's mood: ${MOODS.find((m) => m.value === todayMood)?.label}`}>
                {MOODS.find((m) => m.value === todayMood)?.emoji}
              </span>
            )}
            <button
              onClick={() => setShowUrge(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold uppercase tracking-wider text-xs transition-all"
            >
              <AlertTriangle className="w-4 h-4" aria-hidden />
              I&apos;m Struggling
            </button>
            {!hasAccount && (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all neon-text-pink">
                <Users className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </>
        }
      />

      {/* ── XP / Level ────────────────────────────────────────────────── */}
      <XpBar info={levelInfo} variant="full" className="animate-scale-in" />

      {/* ── SVG Progress Ring + Live Timer ────────────────────────────── */}
      <div className="rounded-xl border border-primary/30 bg-background/60 backdrop-blur-sm p-6 md:p-8 neon-box-pink animate-scale-in">
        <SectionHeading accent="primary" Icon={Clock} className="mb-6">Live Streak Timer</SectionHeading>

        <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-48 h-48">
            <svg className="-rotate-90 absolute inset-0 w-full h-full" viewBox="0 0 192 192">
              <circle cx="96" cy="96" r="88" fill="none" stroke="hsl(var(--primary)/0.12)" strokeWidth="10" />
              <circle
                cx="96" cy="96" r="88" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${ringPct * CIRC} ${CIRC}`}
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.7))', transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div className="relative z-10 text-center">
              <div className="text-5xl font-display font-black text-primary neon-text-pink leading-none">{timer.days}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">days</div>
              <div className="text-[10px] text-muted-foreground/50 mt-2">→ Day {ringNext}</div>
            </div>
          </div>

          {/* D/H/M/S */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[
                { value: timer.days, label: 'Days' },
                { value: pad(timer.hours), label: 'Hours' },
                { value: pad(timer.minutes), label: 'Minutes' },
                { value: pad(timer.seconds), label: 'Seconds' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-xl border border-primary/25 bg-background/80 py-4 px-2 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-primary neon-text-pink tabular-nums leading-none">{value}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground/60 text-center">
              Next milestone: <span className="text-primary font-bold">Day {ringNext}</span>
              {' '}({ringNext - timer.days} day{ringNext - timer.days !== 1 ? 's' : ''} away)
            </div>
          </div>
        </div>

        {/* Streak start / edit */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-primary/80">Started: {streakDisplayDate}</span>
          <button
            onClick={() => {
              setShowStreakEdit(v => !v);
              const s = localStorage.getItem('seedguard_streak_start');
              setEditDateInput(s ? new Date(s).toISOString().slice(0, 10) : '');
            }}
            className="text-xs px-3 py-1 rounded-lg border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
          >
            ✏️ Edit
          </button>
        </div>

        {showStreakEdit && (
          <div className="mt-3 p-4 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
            <p className="text-sm text-accent/80 font-medium">Set streak start date:</p>
            <input
              type="date"
              value={editDateInput}
              onChange={e => setEditDateInput(e.target.value)}
              className="w-full rounded-lg border border-accent/30 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveStreak} className="flex-1 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm font-bold hover:bg-primary/30 transition-all">Save</button>
              <button onClick={() => setShowStreakEdit(false)} className="flex-1 py-2 rounded-lg border border-muted/40 text-muted-foreground text-sm hover:bg-muted/20 transition-all">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Current Streak', value: timer.days,          sub: 'days clean',    accent: 'primary',     Icon: Flame },
          { label: 'Total Days',     value: stats.totalDays,     sub: 'tracked',       accent: 'secondary',   Icon: Calendar },
          { label: 'Longest Streak', value: stats.longestStreak, sub: 'personal best', accent: 'accent',      Icon: TrendingUp },
          { label: 'Relapses',       value: stats.relapses,      sub: 'logged',        accent: 'destructive', Icon: Award },
        ] as const).map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* ── Daily Quests ──────────────────────────────────────────────── */}
      <QuestBoard />

      {/* ── Weekly Challenge + Accountability ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyChallenge />
        <AccountabilityPartner />
      </div>

      {/* ── Recovery Visualization ────────────────────────────────────── */}
      <MilestoneRoadmap currentStreak={timer.days} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecoveryScore />
        <WeeklyTrend />
      </div>
      <RecoveryHeatmap />

      {/* ── Badges ────────────────────────────────────────────────────── */}
      {earnedBadges.length > 0 && (
        <div className="rounded-xl border border-gold/20 bg-background/50 backdrop-blur-sm p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gold neon-text-gold">
              🏅 Earned Badges
            </h3>
            <Link href="/achievements" className="flex items-center gap-1 text-xs font-bold text-gold/70 hover:text-gold uppercase tracking-wider transition-colors">
              All Achievements <ChevronRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gold/25 bg-gold/10 hover:bg-gold/20 transition-all cursor-default"
              >
                <span className="text-lg">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-gold leading-none">{badge.name}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
          {earnedBadges.length < ALL_BADGES.length && (() => {
            // Show up to 3 nearest unearned badges with proximity hint
            const streakBadgeThresholds: Record<string, number> = {
              first_blood: 1, one_week: 7, fortnight: 14, threshold: 30,
              iron_60: 60, diamond_mind: 90, centurion: 100, iron_will: 180, legend: 365,
            };
            const unearned = ALL_BADGES.filter(b => !earnedBadgeIds.includes(b.id));
            const withDist = unearned.map(b => ({
              badge: b,
              daysLeft: streakBadgeThresholds[b.id] != null
                ? Math.max(0, streakBadgeThresholds[b.id] - timer.days)
                : null,
            })).sort((a, b) => {
              if (a.daysLeft === null && b.daysLeft === null) return 0;
              if (a.daysLeft === null) return 1;
              if (b.daysLeft === null) return -1;
              return a.daysLeft - b.daysLeft;
            }).slice(0, 3);

            return (
              <div className="mt-4 pt-4 border-t border-gold/10 space-y-2">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-bold">Next to unlock</p>
                <div className="flex flex-wrap gap-2">
                  {withDist.map(({ badge, daysLeft }) => (
                    <div
                      key={badge.id}
                      title={badge.description}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-muted/20 bg-muted/10 opacity-60 cursor-default"
                    >
                      <span className="text-lg grayscale">{badge.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground leading-none">{badge.name}</p>
                        {daysLeft !== null && (
                          <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                            {daysLeft === 0 ? 'Almost there!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/history" className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group animate-scale-in [animation-delay:200ms]">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 group-hover:scale-110 transition-transform">
            <Flame className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]" aria-hidden />
          </div>
          <h3 className="font-bold text-lg mb-2 uppercase tracking-wider">Log Entry</h3>
          <p className="text-sm text-muted-foreground">Record a victory or log a relapse to keep your streak accurate.</p>
        </Link>
        <Link href="/streaks" className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-8 text-center hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10 group animate-scale-in [animation-delay:250ms]">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7 text-secondary drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" aria-hidden />
          </div>
          <h3 className="font-bold text-lg mb-2 uppercase tracking-wider">Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Compare streaks with friends, weekly rankings, and global top 50.</p>
        </Link>
      </div>

      {/* ── Daily Wisdom ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-secondary/30 bg-background/50 backdrop-blur-sm p-6 md:p-8 animate-scale-in [animation-delay:300ms] neon-box-cyan">
        <div className="flex items-center gap-2 mb-4">
          <Quote className="w-4 h-4 text-secondary/70" aria-hidden />
          <p className="text-xs text-secondary/70 uppercase tracking-widest font-bold">Daily Wisdom</p>
          {todayMood && (
            <span className="ml-auto text-lg" title="Today's mood">{MOODS.find((m) => m.value === todayMood)?.emoji}</span>
          )}
        </div>

        <blockquote className="text-base md:text-lg text-foreground leading-relaxed italic mb-3 min-h-[4rem]">
          &ldquo;{currentQuote.text}&rdquo;
        </blockquote>

        {currentQuote.author ? (
          <p className="text-sm text-secondary font-semibold neon-text-cyan">— {currentQuote.author}</p>
        ) : null}

        <button
          onClick={() => {
            playSound('click');
            setQuoteIndex((prev) => randomQuoteIndex(prev));
            completeQuest('wisdom');
          }}
          className="mt-5 inline-flex items-center gap-1.5 text-xs text-secondary/70 hover:text-secondary font-bold uppercase tracking-wider transition-colors"
          aria-label="Next quote"
        >
          Next Quote <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Footer CTA ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-8 text-center animate-scale-in [animation-delay:350ms]">
        <p className="text-lg text-foreground leading-relaxed">
          Every second <span className="font-bold text-primary neon-text-pink">you hold</span> is a victory.
          <span className="block mt-4 text-muted-foreground text-base">
            This is your space to build the discipline and freedom you deserve.
          </span>
        </p>
        {!todayMood && (
          <button
            onClick={() => setShowMood(true)}
            className="mt-4 text-xs text-muted-foreground/60 hover:text-muted-foreground underline transition-colors"
          >
            How are you feeling today?
          </button>
        )}
      </div>
    </div>
  );
}
