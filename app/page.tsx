import Link from 'next/link';
import { Shield, ArrowRight, Trophy, Flame } from 'lucide-react';
import { ART } from '@/lib/assets';
import { UserCountBadge } from '@/components/user-count';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 text-foreground page-entry overflow-hidden">
      {/* Solid blocker — hides the global SynthBackground on landing page */}
      <div className="absolute inset-0 bg-background pointer-events-none" aria-hidden />
      {/* Hero city wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{ backgroundImage: `url(${ART.heroCity})` }}
        aria-hidden
      />
      {/* Bottom-fade for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none" aria-hidden />

      {/* Glass card */}
      <div className="relative w-full max-w-sm space-y-6 flex flex-col items-center text-center bg-background/55 backdrop-blur-md rounded-2xl border border-primary/20 p-8 shadow-2xl">

        <div className="rounded-full bg-primary/20 p-5 neon-box-pink animate-scale-in">
          <Shield className="h-14 w-14 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)]" aria-hidden />
        </div>

        <div>
          <h1 className="text-5xl font-display font-extrabold tracking-tight neon-text-cyan text-secondary uppercase italic">
            SeedGuard
          </h1>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">
            NoFap &amp; PMO Freedom Tracker
          </p>
        </div>

        <p className="text-foreground/90 pb-1 text-base leading-relaxed font-medium">
          Your private tracker to reclaim your freedom and build unbreakable discipline.
          <span className="block mt-2 text-sm text-secondary/80">
            Sync across all your devices — free forever.
          </span>
        </p>

        <Link
          href="/dashboard"
          className="group inline-flex items-center justify-center gap-2 w-full h-14 px-6 text-xl font-extrabold bg-primary/55 text-white rounded-xl border-2 border-primary/85 hover:bg-primary/70 hover:scale-105 active:scale-95 transition-all neon-box-pink uppercase tracking-widest shadow-xl shadow-primary/30"
        >
          Start Tracking Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
        </Link>

        {/* Social proof counter — renders only when Supabase returns a real count */}
        <UserCountBadge />

        <div className="flex gap-3 w-full">
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

        {/* Feature grid */}
        <div className="w-full pt-4 border-t border-primary/20 space-y-3">
          <p className="text-xs text-secondary/80 uppercase tracking-wider font-bold">What you get — free</p>
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
  );
}
