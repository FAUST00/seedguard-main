import Link from 'next/link';
import { ArrowRight, Trophy, Flame } from 'lucide-react';
import { ART } from '@/lib/assets';
import { UserCountBadge } from '@/components/user-count';
import { SeedGuardLogo } from '@/components/seedguard-logo';

const TAGLINES = [
  'Day 1 is today.',
  '90 days changes everything.',
  'Your streak starts now.',
  'Conquer yourself first.',
  'One day at a time.',
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 text-foreground page-entry overflow-hidden">
      {/* Solid blocker — hides the global SynthBackground on landing page */}
      <div className="absolute inset-0 bg-background pointer-events-none" aria-hidden />
      {/* Hero city wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90 pointer-events-none"
        style={{ backgroundImage: `url(${ART.heroCity})` }}
        aria-hidden
      />
      {/* Bottom-fade + left-fade for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent pointer-events-none" aria-hidden />
      {/* Neon bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 pointer-events-none" aria-hidden />

      {/* ── Layout: single column mobile, two-column md+ ───────────────── */}
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-10 md:gap-16">

        {/* ── Left column — brand + CTA ─────────────────────────────────── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 flex-1">
          {/* Hero card — logo, title, description */}
          <div className="animate-scale-in w-full rounded-2xl bg-black/45 backdrop-blur-md border border-primary/20 shadow-2xl shadow-primary/10 p-6 md:p-8 flex flex-col items-center md:items-start space-y-4">
            <SeedGuardLogo size="lg" />

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-[#00e5ff] to-[#ff2d9b] drop-shadow-[0_0_18px_rgba(0,229,255,0.55)] leading-none">
              SEEDGUARD
            </h1>

            <p className="text-foreground/90 text-base md:text-lg leading-relaxed font-medium max-w-sm">
              Your private tracker to reclaim your freedom and build unbreakable discipline.
            </p>

            <UserCountBadge />
          </div>

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 w-full md:w-auto h-14 px-8 text-xl font-extrabold bg-primary/55 text-white rounded-xl border-2 border-primary/85 hover:bg-primary/70 hover:scale-105 active:scale-95 transition-all neon-box-pink uppercase tracking-widest shadow-xl shadow-primary/30 animate-[pulse_3s_ease-in-out_infinite] [animation-property:box-shadow]"
          >
            Start Tracking Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/account"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-secondary/65 bg-secondary/25 text-secondary text-sm font-bold hover:bg-secondary/40 transition-all"
            >
              Sign In / Sign Up
            </Link>
            <Link
              href="/benefits"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-white/35 bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-all"
            >
              The Journey
            </Link>
          </div>

          {/* Anonymous mode CTA */}
          <AnonModeButton />
        </div>

        {/* ── Right column — feature grid + leaderboard ─────────────────── */}
        <div className="flex flex-col items-center space-y-5 w-full md:w-auto md:max-w-xs">
          {/* Feature grid */}
          <div className="w-full rounded-2xl bg-background/55 backdrop-blur-md border border-primary/20 p-6 shadow-2xl space-y-4">
            <p className="text-xs text-secondary/80 uppercase tracking-wider font-bold text-center">What you get — free</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { icon: '📊', label: 'Streak Tracking',  sub: 'Live second-by-second' },
                { icon: '☁️', label: 'Cloud Sync',       sub: 'Any device, always' },
                { icon: '🏆', label: 'Leaderboards',     sub: 'Friends + Global + Weekly' },
                { icon: '🔥', label: 'Badges & Rewards', sub: 'Milestones celebrated' },
                { icon: '💬', label: 'Direct Messages',  sub: 'Chat with friends' },
                { icon: '🆘', label: 'Urge Support',     sub: 'Emergency breathing tool' },
              ].map(({ icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl bg-background/60 p-3 border border-primary/25 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="font-bold mb-0.5 text-white">{icon} {label}</div>
                  <div className="text-foreground/60">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard CTA */}
          <Link
            href="/streaks"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gold/65 text-gold bg-gold/20 hover:bg-gold/35 text-sm font-bold transition-all shadow-lg shadow-gold/20"
          >
            <Trophy className="w-4 h-4" aria-hidden />
            View Streak Leaderboard
            <Flame className="w-4 h-4 flame-glow" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Client island for anonymous mode — keeps landing page a server component
import AnonModeButton from '@/components/anon-mode-button';
