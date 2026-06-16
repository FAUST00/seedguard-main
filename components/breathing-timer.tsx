'use client';

import { useState, useEffect } from 'react';
import { completeQuest } from '@/lib/quests';

/** 4-4-4-4 box-breathing guide used in the urge-surfing tool. */
const BREATH_PHASES = [
  { label: 'INHALE', secs: 4, color: '#00e5ff', scale: true },
  { label: 'HOLD',   secs: 4, color: '#a855f7', scale: false },
  { label: 'EXHALE', secs: 4, color: '#ff2d9b', scale: true },
  { label: 'HOLD',   secs: 4, color: '#a855f7', scale: false },
];

export function BreathingTimer() {
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

  // Finishing one full breathing cycle completes the daily "breathe" quest
  useEffect(() => {
    if (cycles >= 1) completeQuest('breathe');
  }, [cycles]);

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
