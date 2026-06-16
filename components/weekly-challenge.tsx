'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, SectionHeading } from '@/components/ui';
import { Swords } from 'lucide-react';
import {
  activeChallenge, weekDatesSoFar, claimChallenge, isChallengeClaimed,
  type Challenge,
} from '@/lib/challenges';
import { QUEST_EVENT } from '@/lib/quests';

/**
 * Weekly challenge widget. Auto-claims its XP reward once the goal is met
 * (idempotent per week), feeding the shared XP pool.
 */
export function WeeklyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState(0);
  const [claimed, setClaimed] = useState(false);

  const refresh = useCallback(() => {
    const c = activeChallenge();
    const p = c.progress(weekDatesSoFar());
    setChallenge(c);
    setProgress(p);
    if (p >= c.goal) claimChallenge();      // bank reward once
    setClaimed(isChallengeClaimed());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(QUEST_EVENT, refresh);
    return () => window.removeEventListener(QUEST_EVENT, refresh);
  }, [refresh]);

  if (!challenge) {
    return <div className="h-32 skeleton rounded-xl" />;
  }

  const pct = Math.min(1, progress / challenge.goal);
  const complete = progress >= challenge.goal;

  return (
    <Card accent="primary" padding="md" glow={complete} className="animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <SectionHeading accent="primary" Icon={Swords}>Weekly Challenge</SectionHeading>
        <span className="text-[10px] font-bold text-primary tabular-nums">+{challenge.xp} XP</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl flex-shrink-0">
          {challenge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm">{challenge.title}</p>
          <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">{challenge.description}</p>

          <div className="mt-2.5 h-2 w-full rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-secondary transition-[width] duration-700"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground/60 tabular-nums">
              {Math.min(progress, challenge.goal)} / {challenge.goal} {challenge.unit}
            </span>
            {complete && (
              <span className="text-[10px] font-bold text-secondary neon-text-cyan uppercase tracking-wider">
                {claimed ? '✓ Reward banked' : '✓ Complete'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
