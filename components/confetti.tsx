'use client';

/** Full-screen confetti burst for milestone celebrations. Pure CSS animation. */
const CONFETTI_COLORS = ['#ff2d9b', '#00e5ff', '#a855f7', '#fbbf24', '#34d399', '#f97316'];

export function Confetti() {
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
