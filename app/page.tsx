import Link from 'next/link';
import { ArrowRight, Trophy, Activity, Cloud, Award, MessageSquare, LifeBuoy } from 'lucide-react';
import { ART } from '@/lib/assets';
import { UserCountBadge } from '@/components/user-count';
import { SeedGuardLogo } from '@/components/seedguard-logo';
import AnonModeButton from '@/components/anon-mode-button';

// Feature highlights shown in the desktop right-column grid. Lucide icons
// (not emoji) so they render identically across every OS/browser and match
// the rest of the app's iconography.
const FEATURES = [
  { Icon: Activity,       label: 'Streak Tracking',  sub: 'Live second-by-second' },
  { Icon: Cloud,          label: 'Cloud Sync',       sub: 'Any device, always' },
  { Icon: Trophy,         label: 'Leaderboards',     sub: 'Friends + Global + Weekly' },
  { Icon: Award,          label: 'Badges & Rewards', sub: 'Milestones celebrated' },
  { Icon: MessageSquare,  label: 'Direct Messages',  sub: 'Chat with friends' },
  { Icon: LifeBuoy,       label: 'Urge Support',     sub: 'Emergency breathing tool' },
] as const;

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-6 md:p-6 text-foreground page-entry overflow-hidden">
      {/* Solid blocker — hides the global SynthBackground on landing page */}
      <div className="absolute inset-0 bg-background pointer-events-none" aria-hidden />
      {/* Hero city wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90 pointer-events-none"
        style={{ backgroundImage: `url(${ART.heroCity})` }}
        aria-hidden
      />
      {/* Bottom-fade + left-fade for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-transparent pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent pointer-events-none" aria-hidden />
      {/* Neon bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 pointer-events-none" aria-hidden />

      {/* ── Layout: single column mobile, two-column md+ ───────────────── */}
      <div className="relative w-full max-w-6xl flex flex-col md:flex-row items-center gap-8 md:gap-20">

        {/* ── Left column — brand + CTA ─────────────────────────────────── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5 flex-1">

          {/*
           * Hero card:
           *   Mobile  — glass card (backdrop blur aids readability over the bg image)
           *   Desktop — no card; text floats directly over the gradient-masked bg
           */}
          <div className="
            animate-scale-in w-full flex flex-col items-center text-center space-y-4
            rounded-2xl bg-black/50 backdrop-blur-md border border-primary/20 shadow-2xl shadow-primary/10 p-5
            md:bg-transparent md:backdrop-blur-none md:border-none md:shadow-none md:p-0
            md:items-start md:text-left md:space-y-5
          ">
            <SeedGuardLogo size="hero" />

            {/* Main title */}
            <h1 className="
              text-3xl sm:text-4xl md:text-7xl
              font-black uppercase leading-none
              tracking-[0.15em] md:tracking-[0.25em]
              text-transparent bg-clip-text
              bg-gradient-to-r from-cyan-300 via-[#00e5ff] to-[#ff2d9b]
              drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]
            ">
              SEEDGUARD
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.3em] text-[#c084fc] drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]">
              NOFAP &amp; PMO FREEDOM TRACKER
            </p>

            {/* Decorative accent line — desktop only */}
            <div className="hidden md:block w-16 h-[3px] rounded-full bg-gradient-to-r from-cyan-300 to-[#ff2d9b] opacity-80" aria-hidden />

            {/* Description */}
            <p className="text-foreground/85 text-sm md:text-lg leading-relaxed font-medium max-w-xs md:max-w-sm">
              Your private tracker to reclaim your freedom and build unbreakable discipline.
            </p>

            <UserCountBadge />
          </div>

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-2 w-full md:w-auto h-14 px-8 md:px-12 text-lg md:text-xl font-extrabold bg-primary/55 text-white rounded-xl border-2 border-primary/85 hover:bg-primary/70 hover:scale-105 active:scale-95 transition-all neon-box-pink uppercase tracking-widest shadow-xl shadow-primary/30 animate-[pulse_3s_ease-in-out_infinite] [animation-property:box-shadow]"
          >
            Start Tracking Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
          </Link>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/account"
              className="flex-1 flex items-center justify-center gap-2 px-4 min-h-[48px] rounded-xl border-2 border-secondary/65 bg-secondary/25 text-secondary text-sm font-bold hover:bg-secondary/40 transition-all"
            >
              Sign In / Sign Up
            </Link>
            <Link
              href="/benefits"
              className="flex-1 flex items-center justify-center gap-2 px-4 min-h-[48px] rounded-xl border-2 border-white/35 bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-all"
            >
              The Journey
            </Link>
          </div>

          {/* Anonymous mode CTA */}
          <AnonModeButton />
        </div>

        {/* ── Right column — feature grid + leaderboard (desktop only) ──── */}
        <div className="hidden md:flex flex-col items-center space-y-5 w-full md:w-auto md:max-w-sm">
          {/* Feature grid */}
          <div className="w-full rounded-2xl bg-background/60 backdrop-blur-md border border-primary/20 p-6 shadow-2xl space-y-4">
            <p className="text-xs text-secondary/80 uppercase tracking-wider font-bold text-center">What you get, free</p>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map(({ Icon, label, sub }) => (
                <div
                  key={label}
                  className="rounded-xl bg-background/60 p-4 border border-primary/25 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4 text-secondary shrink-0" aria-hidden />
                    <span className="text-sm font-bold text-white leading-tight">{label}</span>
                  </div>
                  <div className="text-xs text-foreground/60 leading-snug">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard requires an account: point here instead of the gated /streaks page. */}
          {/* Deliberately secondary to the main CTA above: outline style, smaller, no glow. */}
          <Link
            href="/account"
            className="w-full flex items-center justify-center gap-2 px-4 min-h-[40px] rounded-xl border border-gold/50 bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-all whitespace-nowrap"
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" aria-hidden />
            Join the Ranks (Account Required)
          </Link>
        </div>
      </div>
    </div>
  );
}
