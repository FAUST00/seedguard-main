'use client';

import { useState, useEffect } from 'react';
import { Card, SectionHeading, ACCENT } from '@/components/ui';
import { Activity } from 'lucide-react';
import { recoveryScore, scoreTier, loadRecoveryInputs } from '@/lib/recovery';

const R = 52;
const CIRC = 2 * Math.PI * R;

/**
 * Composite recovery-score gauge (0–100). Self-contained: reads progress
 * from localStorage on mount and renders a radial gauge + tier label.
 */
export function RecoveryScore() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    setScore(recoveryScore(loadRecoveryInputs()));
  }, []);

  const tier = score !== null ? scoreTier(score) : null;
  const accent = tier ? ACCENT[tier.accent] : ACCENT.primary;
  const pct = (score ?? 0) / 100;

  return (
    <Card accent={tier?.accent ?? 'primary'} padding="md" className="animate-scale-in flex flex-col">
      <SectionHeading accent={tier?.accent ?? 'primary'} Icon={Activity} className="mb-4">Recovery Score</SectionHeading>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={R} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="9" />
            <circle
              cx="64" cy="64" r={R} fill="none"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${pct * CIRC} ${CIRC}`}
              className={accent.text}
              style={{ transition: 'stroke-dasharray 0.9s ease', filter: 'drop-shadow(0 0 6px currentColor)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-display font-black tabular-nums ${accent.text} ${accent.neonText}`}>
              {score ?? '·'}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        {tier && (
          <p className={`mt-3 text-sm font-bold uppercase tracking-wider ${accent.text}`}>{tier.label}</p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground/60 text-center max-w-[14rem]">
          Blends momentum, longevity, cleanliness &amp; consistency.
        </p>
      </div>
    </Card>
  );
}
