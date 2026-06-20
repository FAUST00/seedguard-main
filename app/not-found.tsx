import Link from 'next/link';
import { Home, Compass } from 'lucide-react';

/**
 * Branded 404. Static export emits this as 404.html, which GitHub Pages
 * serves automatically for any unmatched path. Server component (no client
 * JS) — pure links, fully styled to match the synthwave aesthetic.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center page-entry">
      <p className="text-7xl md:text-9xl font-display font-black italic neon-text-pink text-primary leading-none">
        404
      </p>
      <h1 className="mt-4 text-xl md:text-2xl font-bold uppercase tracking-widest text-secondary neon-text-cyan">
        Lost in the grid
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
        This page drifted off the map. Your streak is safe — let&apos;s get you back on track.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/50 bg-primary/15 text-primary font-bold uppercase tracking-wider text-sm hover:bg-primary/25 transition-all neon-box-pink"
        >
          <Home className="w-4 h-4" aria-hidden />
          Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-secondary/40 bg-secondary/10 text-secondary font-bold uppercase tracking-wider text-sm hover:bg-secondary/20 transition-all"
        >
          <Compass className="w-4 h-4" aria-hidden />
          Home
        </Link>
      </div>
    </div>
  );
}
