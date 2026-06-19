'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Heart, Zap, Eye, Trophy, Star, TrendingUp, Shield, CheckCircle, BookOpen, PlayCircle } from 'lucide-react';

const weekData = [
  {
    week: 1, label: 'WEEK 1', subtitle: 'Days 1–7 · Detox Phase',
    accent: '#e879f9', border: 'rgba(232,121,249,0.3)', glow: 'rgba(232,121,249,0.08)',
    number: '01', phase: 'DETOX PHASE',
    benefits: ['Energy spike around Days 4–7', 'Increased confidence & assertiveness', 'Better gym performance', 'Slight mood elevation', 'Heightened mental drive'],
    challenges: ['Intense urges & cravings', 'Irritability & mood swings', 'Sleep disruption', 'Anxiety & restlessness', 'Possible headaches'],
  },
  {
    week: 2, label: 'WEEK 2', subtitle: 'Days 8–14 · Flatline Begins',
    accent: '#22d3ee', border: 'rgba(34,211,238,0.3)', glow: 'rgba(34,211,238,0.08)',
    number: '02', phase: 'FLATLINE',
    benefits: ['Urge intensity starts decreasing', 'Internal calm begins building', 'Brain starts rewiring pathways', 'Clarity in moments of stillness'],
    challenges: ['Low energy & motivation', 'Emotional numbness (flatline)', 'Brain fog & apathy', 'Reduced libido (this is normal)', 'Hardest week for most men'],
  },
  {
    week: 3, label: 'WEEK 3', subtitle: 'Days 15–21 · Energy Returns',
    accent: '#a78bfa', border: 'rgba(167,139,250,0.3)', glow: 'rgba(167,139,250,0.08)',
    number: '03', phase: 'REAWAKENING',
    benefits: ['Energy stronger than your baseline', 'Sharper focus & mental clarity', 'Improved sleep quality', 'Increased eye contact & charisma', 'Motivation resurfaces powerfully', 'Deeper voice (widely reported)'],
    challenges: ['Occasional urge spikes', 'Mood fluctuations', 'Social rewiring feels uncomfortable'],
  },
  {
    week: 4, label: 'WEEK 4', subtitle: 'Days 22–30 · Clarity Sharpens',
    accent: '#34d399', border: 'rgba(52,211,153,0.3)', glow: 'rgba(52,211,153,0.08)',
    number: '04', phase: 'CLARITY',
    benefits: ['Mental clarity noticeably sharper', 'Confidence grows daily', 'Emotional stability improving', 'Gym performance peak', 'Skin clearing up', 'Social presence elevated'],
    challenges: ['Second flatline possible', 'Discipline required, no coasting', 'Urges tied to stress triggers'],
  },
];

const monthData = [
  { period: '~2 Months', title: 'EMOTIONAL STABILITY', icon: Heart,      accent: '#e879f9', border: 'rgba(232,121,249,0.25)', bg: 'rgba(232,121,249,0.05)', points: ['Reduced social anxiety', 'Deeper emotional regulation', 'Relationship improvements begin', 'Genuine self-respect & dignity', 'Consistent, clean daily energy'] },
  { period: '~3 Months', title: 'DOPAMINE REWIRING',  icon: Brain,      accent: '#22d3ee', border: 'rgba(34,211,238,0.25)',  bg: 'rgba(34,211,238,0.05)',  points: ['Life feels naturally enjoyable again', 'Motivation is now your default state', '"Magnetism" & social presence', 'Better discipline across all areas', 'Spiritual awareness deepens'] },
  { period: '4–6 Months', title: 'PEAK PERFORMANCE',  icon: Zap,        accent: '#a78bfa', border: 'rgba(167,139,250,0.25)', bg: 'rgba(167,139,250,0.05)', points: ['Full mental clarity unlocked', 'Genuine joy & presence', 'Strong urge control, automatic', 'Productivity at an all-time high', 'Deeper voice & clearer skin', 'Relationships transform'] },
  { period: '6+ Months', title: 'LIFE TRANSFORMATION',icon: Trophy,     accent: '#fbbf24', border: 'rgba(251,191,36,0.25)',  bg: 'rgba(251,191,36,0.05)',  points: ['Unbreakable, earned confidence', 'Intuition & creativity amplified', 'Sustained mastery, no struggle', 'Inner peace & clear purpose', 'Life feels fundamentally different'] },
  { period: '2–6 Months', title: 'PHYSICAL UPGRADES', icon: TrendingUp, accent: '#34d399', border: 'rgba(52,211,153,0.25)',  bg: 'rgba(52,211,153,0.05)',  points: ['Testosterone levels optimised', 'Stronger, faster gym recovery', 'Better posture & body language', 'Clearer skin & sharper eyes', 'More restful, deeper sleep'] },
  { period: '3–6 Months', title: 'MENTAL CLARITY',    icon: Eye,        accent: '#fb923c', border: 'rgba(251,146,60,0.25)',  bg: 'rgba(251,146,60,0.05)',  points: ['Laser focus on demand', 'Creative breakthroughs', 'Sharper memory & recall', 'Better problem-solving instinct', 'Reduced brain fog permanently'] },
];

const milestones = ['Day 7: Feel the shift', 'Day 14: Survive flatline', 'Day 30: Clarity hits', 'Day 90: Rewired', 'Day 180: Transformed'];

export default function BenefitsPage() {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('seedguard_stats');
      if (raw) {
        const { currentStreak: s } = JSON.parse(raw);
        if (typeof s === 'number') setCurrentStreak(s);
      }
    } catch {}
  }, []);

  // Which week is the user currently in? (0 = not started / past week 4)
  const currentWeek = currentStreak >= 1 && currentStreak <= 28
    ? Math.ceil(currentStreak / 7)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <div className="relative text-center py-16 px-6 pb-12 border-b border-primary/10">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/50 bg-gold/10 text-gold hover:bg-gold/20 font-bold uppercase tracking-wider text-xs transition-all neon-hover"
          >
            <PlayCircle className="w-3.5 h-3.5" aria-hidden />
            Videos
          </Link>
          <Link
            href="/esoteric"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold uppercase tracking-wider text-xs transition-all neon-hover"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            More Info
          </Link>
        </div>

        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1 mb-5">
          <Shield className="w-3.5 h-3.5 text-primary" aria-hidden />
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Verified by community</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black italic tracking-tight mb-4 neon-text-pink text-primary">
          THE RETENTION JOURNEY
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Discover the real, transformative benefits of semen retention. Every day you hold the line, your brain and body are changing.
        </p>
        {currentStreak > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2">
            <span className="text-sm font-bold text-primary neon-text-pink">🔥 Day {currentStreak}, keep going</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-5 pb-20">

        {/* Week by Week */}
        <section className="pt-14" aria-labelledby="week-heading">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <h2 id="week-heading" className="text-xs font-bold tracking-widest text-primary uppercase whitespace-nowrap">
              Week by Week
            </h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <p className="text-center text-muted-foreground text-sm mb-9">
            The first 30 days: what to expect, honestly.
            {currentWeek > 0 && (
              <span className="block mt-1 text-primary/80 font-semibold text-xs uppercase tracking-wider">
                You are currently in Week {currentWeek}
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {weekData.map((w) => {
              const isCurrentWeek = currentWeek === w.week;
              return (
                <div key={w.week}>
                  <button
                    onClick={() => setExpandedWeek(expandedWeek === w.week ? null : w.week)}
                    aria-expanded={expandedWeek === w.week}
                    className="relative w-full text-left rounded-2xl p-6 cursor-pointer transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{
                      background: w.glow,
                      border: isCurrentWeek ? `2px solid ${w.accent}` : `1px solid ${w.border}`,
                      boxShadow: isCurrentWeek
                        ? `0 0 28px ${w.accent}55`
                        : expandedWeek === w.week ? `0 0 32px ${w.border}` : 'none',
                    }}
                  >
                    {isCurrentWeek && (
                      <div
                        className="absolute inset-0 rounded-2xl animate-pulse pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${w.accent}33, transparent)` }}
                        aria-hidden
                      />
                    )}
                    {isCurrentWeek && (
                      <div className="mb-2 text-[0.65rem] font-extrabold uppercase tracking-widest" style={{ color: w.accent }}>
                        📍 You are here
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3.5">
                      <div>
                        <span className="text-[0.7rem] font-bold tracking-widest uppercase block" style={{ color: w.accent }}>{w.label}</span>
                        <h3 className="text-lg font-extrabold mt-0.5 mb-1" style={{ color: w.accent }}>{w.phase}</h3>
                        <span className="text-[0.75rem] text-muted-foreground">{w.subtitle}</span>
                      </div>
                      <span className="text-4xl font-black leading-none" style={{ color: w.border }}>{w.number}</span>
                    </div>

                    <div className="mb-3">
                      <span className="text-[0.65rem] font-bold tracking-widest text-emerald-400 uppercase block mb-1.5">↑ Benefits</span>
                      <div className="flex flex-wrap gap-1.5">
                        {w.benefits.map((b) => (
                          <span key={b} className="text-[0.72rem] bg-emerald-500/10 border border-emerald-500/25 rounded-md px-2 py-0.5 text-emerald-300">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {expandedWeek === w.week && (
                      <div>
                        <span className="text-[0.65rem] font-bold tracking-widest text-orange-400 uppercase block mb-1.5">⚡ Challenges</span>
                        <div className="flex flex-wrap gap-1.5">
                          {w.challenges.map((c) => (
                            <span key={c} className="text-[0.72rem] bg-orange-500/8 border border-orange-500/25 rounded-md px-2 py-0.5 text-orange-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3.5 text-[0.7rem] text-muted-foreground/40 text-right">
                      {expandedWeek === w.week ? 'Click to collapse ↑' : 'Tap to see challenges ↓'}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Month by Month */}
        <section aria-labelledby="month-heading">
          <div className="flex items-center gap-4 mb-2 mt-14">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/40" />
            <h2 id="month-heading" className="text-xs font-bold tracking-widest text-accent uppercase whitespace-nowrap">
              Month by Month
            </h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/40" />
          </div>
          <p className="text-center text-muted-foreground text-sm mb-9">
            Long-term rewards for the men who stay the course.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {monthData.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="rounded-2xl p-7" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.accent}18`, border: `1px solid ${m.border}` }}>
                      <Icon className="w-5 h-5" style={{ color: m.accent }} aria-hidden />
                    </div>
                    <div>
                      <span className="text-[0.65rem] font-bold tracking-widest uppercase block" style={{ color: m.accent }}>{m.period}</span>
                      <h3 className="text-base font-extrabold text-foreground">{m.title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-2" aria-label={`${m.title} benefits`}>
                    {m.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-foreground/80 leading-snug">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: m.accent }} aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-1.5">
                    <Star className="w-2.5 h-2.5" style={{ color: m.accent }} aria-hidden />
                    <span className="text-[0.65rem] text-muted-foreground/40 font-semibold tracking-widest uppercase">Verified by community</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 glass-effect border border-primary/20 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-extrabold tracking-wide text-primary neon-text-pink mb-3">YOUR PATH TO FREEDOM</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-7 leading-relaxed text-sm">
            Every man who has made it past 90 days describes a fundamental shift. Will you be one of them?
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            {milestones.map((m) => (
              <div key={m} className="bg-secondary/10 border border-secondary/25 rounded-full px-4 py-1.5 text-sm text-secondary font-semibold">
                {m}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-muted-foreground/30 text-xs mt-10 leading-relaxed">
          Individual results vary. Benefits are based on community reports and testimonials. Not medical advice.
        </p>
      </div>
    </div>
  );
}
