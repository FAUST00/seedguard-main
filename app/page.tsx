import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50 page-entry">
      <div className="w-full max-w-sm space-y-8 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="rounded-full bg-primary/10 p-5 mb-4 neon-box-pink animate-scale-in">
          <Shield className="h-12 w-12 text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold tracking-tight neon-text-cyan text-secondary uppercase italic">
          SeedGuard
        </h1>

        {/* Description */}
        <p className="text-zinc-400 pb-8 text-lg leading-relaxed">
          Your private, local-first tracker to reclaim your freedom and build discipline. 
          <span className="block mt-2 text-sm">No accounts required. No data harvesting.</span>
        </p>

        {/* CTA Button */}
        <Link
          href="/dashboard"
          className="
            group inline-flex items-center justify-center gap-2
            w-full h-14 px-6 py-2 text-xl font-bold
            bg-primary text-primary-foreground
            rounded-lg border border-primary/20
            hover:bg-primary/90 hover:scale-105
            active:scale-95
            transition-all duration-200
            neon-box-pink uppercase tracking-widest
            shadow-lg hover:shadow-primary/20
          "
        >
          Start Tracking Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Secondary Link */}
        <p className="text-sm text-zinc-400 mt-4">
          Or explore the extended streak guide:{' '}
          <Link
            href="/benefits"
            className="font-semibold text-cyan-300 hover:text-cyan-100 transition-colors"
          >
            Retention Journey
          </Link>
        </p>

        {/* Features Preview */}
        <div className="w-full mt-12 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-4">Features</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800 hover:border-primary/30 transition-colors">
              <div className="text-primary font-semibold mb-1">📊 Streak Tracking</div>
              <div className="text-zinc-400">Build daily momentum</div>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800 hover:border-secondary/30 transition-colors">
              <div className="text-secondary font-semibold mb-1">📈 Analytics</div>
              <div className="text-zinc-400">Visualize progress</div>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800 hover:border-primary/30 transition-colors">
              <div className="text-primary font-semibold mb-1">🏆 Badges</div>
              <div className="text-zinc-400">Earn achievements</div>
            </div>
            <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800 hover:border-secondary/30 transition-colors">
              <div className="text-secondary font-semibold mb-1">🌙 Dark UI</div>
              <div className="text-zinc-400">Flow state focus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
