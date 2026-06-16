'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame, TrendingUp, Award, Calendar, Clock, Users, ChevronRight,
  Quote, AlertTriangle, X, Wind,
} from 'lucide-react';
import { syncWithCloud, getStreakFromCloud, getUser } from '@/lib/sync';
import { playSound } from '@/lib/sound';
import { ALL_BADGES, computeEarnedBadgeIds, type BadgeStats } from '@/lib/badges';

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

// ── Milestones ────────────────────────────────────────────────────────────────
const MILESTONE_DAYS = [7, 14, 30, 60, 90, 100, 180, 365];

const MILESTONE_MESSAGES: Record<number, { title: string; body: string }> = {
  7:   { title: '🔥 One Week!',        body: 'You survived the hardest stretch. The dopamine fog is lifting. Most men never make it here.' },
  14:  { title: '💪 Two Weeks!',       body: 'Flatline territory. You are still standing. The brain is rewiring itself right now.' },
  30:  { title: '🏆 30 Days!',         body: 'One month of total mastery. Testosterone is climbing. Mental clarity is arriving. This is real.' },
  60:  { title: '⚔️ 60 Days!',         body: 'Two months in. Your dopamine system is healing. Energy and focus are noticeably stronger.' },
  90:  { title: '💎 Diamond Mind!',    body: '90 days. This is the legendary threshold. You have rewired your brain. You are a different man.' },
  100: { title: '🛡️ Centurion!',       body: '100 days of iron discipline. Elite-level self-mastery. Less than 1% of men reach this.' },
  180: { title: '🗡️ Iron Will!',       body: 'Six months. Sustained transformation. The habits you\'ve built are now who you are.' },
  365: { title: '👑 Legend!',          body: 'One full year. You have achieved something that most men will never even attempt. Legendary.' },
};

// ── Quotes ───────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: 'You have power over your mind, not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'The first and greatest victory is to conquer yourself.', author: 'Plato' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'He who conquers himself is the mightiest warrior.', author: 'Confucius' },
  { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca' },
  { text: 'What we do in life echoes in eternity.', author: 'Marcus Aurelius' },
  { text: 'The successful warrior is the average man with laser-like focus.', author: 'Bruce Lee' },
  { text: 'We become what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'If it is not right, do not do it; if it is not true, do not say it.', author: 'Marcus Aurelius' },
  { text: 'Self-control is the chief element in self-respect, and self-respect is the chief element in courage.', author: 'Thucydides' },
  { text: 'The cave you fear to enter holds the treasure you seek.', author: 'Joseph Campbell' },
  { text: 'Real freedom is not freedom from responsibility — it is the freedom that comes from mastering yourself.', author: '' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'The more you sweat in training, the less you bleed in battle.', author: 'Sun Tzu' },
  { text: 'One day or day one. You decide.', author: '' },
  { text: 'Every battle is won before it is ever fought.', author: 'Sun Tzu' },
  { text: 'Between stimulus and response there is a space. In that space is our power to choose our response.', author: 'Viktor Frankl' },
  { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'Strength does not come from physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
  { text: 'Your future self is watching you right now through your memories. Make him proud.', author: '' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'The secret of discipline is motivation. When a man is sufficiently motivated, discipline will take care of itself.', author: 'Sir Alexander Paterson' },
  { text: 'We must all suffer one of two things: the pain of discipline or the pain of regret.', author: 'Jim Rohn' },
  { text: 'Either you run the day, or the day runs you.', author: 'Jim Rohn' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'Pain is temporary. Quitting lasts forever.', author: 'Lance Armstrong' },
  { text: 'Do not pray for an easy life. Pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
  { text: 'What you resist, persists. What you accept, you can change.', author: 'Carl Jung' },
  { text: 'Until you make the unconscious conscious, it will direct your life and you will call it fate.', author: 'Carl Jung' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.', author: 'Aristotle' },
  { text: 'The energy you put into controlling yourself is the same energy others waste on excuses.', author: '' },
  { text: 'Every day is a new opportunity to be better than yesterday.', author: '' },
  { text: 'The strongest man is not he who overcomes others, but he who overcomes himself.', author: '' },
  { text: 'A warrior does not give up what he loves. He finds the love in what he does.', author: 'Dan Millman' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'If you are going through hell, keep going.', author: 'Winston Churchill' },
  { text: 'Continuous effort — not strength or intelligence — is the key to unlocking our potential.', author: 'Winston Churchill' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Your life does not get better by chance. It gets better by change.', author: 'Jim Rohn' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'I am not a product of my circumstances. I am a product of my decisions.', author: 'Stephen Covey' },
  { text: 'By failing to prepare, you are preparing to fail.', author: 'Benjamin Franklin' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
] as const;

function randomQuoteIndex(exclude: number): number {
  let next: number;
  do { next = Math.floor(Math.random() * QUOTES.length); }
  while (next === exclude && QUOTES.length > 1);
  return next;
}

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
const MILESTONE_LIST = [7, 14, 30, 60, 90, 100, 180, 365];
const CIRC = 2 * Math.PI * 88; // r=88

function getRingProgress(days: number): { prev: number; next: number; pct: number } {
  const next = MILESTONE_LIST.find((m) => m > days) ?? MILESTONE_LIST[MILESTONE_LIST.length - 1];
  const prev = [...MILESTONE_LIST].reverse().find((m) => m <= days) ?? 0;
  const pct = next === prev ? 1 : (days - prev) / (next - prev);
  return { prev, next, pct: Math.min(1, Math.max(0, pct)) };
}

// ── Confetti ──────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#ff2d9b', '#00e5ff', '#a855f7', '#fbbf24', '#34d399', '#f97316'];

function Confetti() {
  const particles = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    fallDur: `${2 + Math.random() * 2}s`,
    fallDelay: `${Math.random() * 1.5}s`,
    swayDur: `${0.8 + Math.random() * 0.8}s`,
    rotate: Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm',
    size: Math.random() > 0.6 ? 'w-3 h-3' : 'w-2 h-2',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`confetti-particle ${p.size} ${p.rotate}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            '--fall-dur': p.fallDur,
            '--fall-delay': p.fallDelay,
            '--sway-dur': p.swayDur,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Breathing timer ───────────────────────────────────────────────────────
const BREATH_PHASES = [
  { label: 'INHALE',   secs: 4, color: '#00e5ff', scale: true },
  { label: 'HOLD',     secs: 4, color: '#a855f7', scale: false },
  { label: 'EXHALE',   secs: 4, color: '#ff2d9b', scale: true },
  { label: 'HOLD',     secs: 4, color: '#a855f7', scale: false },
];

function BreathingTimer() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (tick <= 0) {
      const next = (phaseIdx + 1) % BREATH_PHASES.length;
      if (next === 0) setCycles((c) => c + 1);
      setPhaseIdx(next);
      setTick(BREATH_PHASES[next].secs);
      return;
    }
    const id = setTimeout(() => setTick((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [tick, phaseIdx]);

  const phase = BREATH_PHASES[phaseIdx];
  const pct = tick / phase.secs;
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="-rotate-90 absolute inset-0 w-full h-full">
          <circle cx="72" cy="72" r="52" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="6" />
          <circle
            cx="72" cy="72" r="52" fill="none"
            stroke={phase.color}
            strokeWidth="6"
            strokeDasharray={`${pct * circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.9s linear', filter: `drop-shadow(0 0 8px ${phase.color})` }}
          />
        </svg>
        <div
          className="relative z-10 flex flex-col items-center transition-transform duration-1000"
          style={{ transform: phase.scale ? `scale(${1 + (1 - pct) * 0.15})` : 'scale(1)' }}
        >
          <span className="text-4xl font-extrabold font-mono" style={{ color: phase.color }}>{tick}</span>
          <span className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: phase.color }}>{phase.label}</span>
        </div>
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground">
        {BREATH_PHASES.map((p, i) => (
          <span key={i} className={`px-2 py-1 rounded-full font-bold uppercase tracking-wider transition-all ${i === phaseIdx ? 'text-foreground bg-muted/30' : 'opacity-40'}`}>
            {p.label}
          </span>
        ))}
      </div>

      {cycles > 0 && (
        <p className="text-xs text-muted-foreground">
          Cycle {cycles} complete — you&apos;re doing great.
        </p>
      )}

      <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
        4-4-4-4 box breathing. Inhale for 4 — hold for 4 — exhale for 4 — hold for 4. Repeat until the urge passes.
      </p>
    </div>
  );
}

// ── Mood check-in ─────────────────────────────────────────────────────────
const MOODS = [
  { emoji: '😤', label: 'Struggling',   value: 1 },
  { emoji: '😐', label: 'Neutral',      value: 2 },
  { emoji: '🙂', label: 'Okay',         value: 3 },
  { emoji: '😊', label: 'Good',         value: 4 },
  { emoji: '🔥', label: 'Thriving',     value: 5 },
];

function todayKey(): string {
  return `seedguard_mood_${new Date().toISOString().slice(0, 10)}`;
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

  const prevDaysRef = useRef(0);
  const streakStartRef = useRef<Date | null>(null);

  // Check onboarding on first render
  useEffect(() => {
    const done = localStorage.getItem('seedguard_onboarded');
    if (!done) router.replace('/onboarding');
  }, [router]);

  // Check today's mood
  useEffect(() => {
    const saved = localStorage.getItem(todayKey());
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
    setEarnedBadgeIds(computeEarnedBadgeIds(badgeStats));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.days, loading]);

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
    localStorage.setItem(todayKey(), String(value));
    setShowMood(false);
  };

  const { prev: ringPrev, next: ringNext, pct: ringPct } = getRingProgress(timer.days);
  const earnedBadges = ALL_BADGES.filter((b) => earnedBadgeIds.includes(b.id));

  if (typeof window === 'undefined') return null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 page-entry">

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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">Dashboard</h1>
          <p className="text-muted-foreground text-base mt-1">
            {timer.days === 0
              ? 'Every journey starts with a single day. Today is that day.'
              : `Day ${timer.days} — every second you hold is a victory.`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
        </div>
      </div>

      {/* ── SVG Progress Ring + Live Timer ────────────────────────────── */}
      <div className="rounded-xl border border-primary/30 bg-background/60 backdrop-blur-sm p-6 md:p-8 neon-box-pink animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-primary" aria-hidden />
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary neon-text-pink">Live Streak Timer</h2>
        </div>

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e87f9f' }}>Started: {streakDisplayDate}</span>
          <button
            onClick={() => {
              setShowStreakEdit(v => !v);
              const s = localStorage.getItem('seedguard_streak_start');
              setEditDateInput(s ? new Date(s).toISOString().slice(0, 10) : '');
            }}
            style={{ background: 'transparent', border: '1px solid #a21caf', borderRadius: '6px', padding: '2px 10px', color: '#e87f9f', cursor: 'pointer', fontSize: '0.8rem' }}
          >✏️ Edit</button>
        </div>

        {showStreakEdit && (
          <div style={{ marginTop: '10px', padding: '12px', background: '#1a0a2e', border: '1px solid #7c3aed', borderRadius: '8px' }}>
            <p style={{ color: '#ddb4fe', fontSize: '0.8rem', marginBottom: '8px' }}>Set streak start date:</p>
            <input type="date" value={editDateInput} onChange={e => setEditDateInput(e.target.value)}
              style={{ background: '#1a0b2e', border: '1px solid #7c3aed', borderRadius: '6px', padding: '6px 10px', color: '#e2b4ff', width: '100%', marginBottom: '8px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSaveStreak} style={{ background: '#2c1aae', border: 'none', borderRadius: '6px', padding: '6px 16px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Save</button>
              <button onClick={() => setShowStreakEdit(false)} style={{ background: 'transparent', border: '1px solid #6b7280', borderRadius: '6px', padding: '6px 16px', color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: timer.days,           sub: 'days clean',     color: 'primary',     Icon: Flame },
          { label: 'Total Days',     value: stats.totalDays,      sub: 'tracked',        color: 'secondary',   Icon: Calendar },
          { label: 'Longest Streak', value: stats.longestStreak,  sub: 'personal best',  color: 'accent',      Icon: TrendingUp },
          { label: 'Relapses',       value: stats.relapses,       sub: 'logged',         color: 'destructive', Icon: Award },
        ].map(({ label, value, sub, color, Icon }, i) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-xl border border-${color}/20 bg-background/50 backdrop-blur-sm p-5 hover:border-${color}/50 transition-all duration-300 animate-scale-in`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-3xl font-bold text-${color}${color === 'primary' ? ' neon-text-pink' : color === 'secondary' ? ' neon-text-cyan' : ''}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
              <div className={`rounded-full bg-${color}/10 p-2`}>
                <Icon className={`w-5 h-5 text-${color}`} aria-hidden />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Badges ────────────────────────────────────────────────────── */}
      {earnedBadges.length > 0 && (
        <div className="rounded-xl border border-gold/20 bg-background/50 backdrop-blur-sm p-6 animate-scale-in">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gold neon-text-gold mb-4">
            🏅 Earned Badges
          </h3>
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
          {earnedBadges.length < ALL_BADGES.length && (
            <p className="text-[10px] text-muted-foreground/40 mt-3">
              {ALL_BADGES.length - earnedBadges.length} badge{ALL_BADGES.length - earnedBadges.length !== 1 ? 's' : ''} remaining — keep going.
            </p>
          )}
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
