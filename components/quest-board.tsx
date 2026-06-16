'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SectionHeading } from '@/components/ui';
import { DAILY_QUESTS, getCompletedQuestIds, QUEST_EVENT } from '@/lib/quests';

/**
 * Daily quest checklist. Self-contained — reads completion state from
 * localStorage and re-reads whenever a quest is completed elsewhere
 * (dashboard fires QUEST_EVENT via lib/quests.completeQuest).
 */
export function QuestBoard() {
  const [done, setDone] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => setDone(getCompletedQuestIds()), []);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener(QUEST_EVENT, refresh);
    return () => window.removeEventListener(QUEST_EVENT, refresh);
  }, [refresh]);

  // Avoid hydration mismatch — render the same shell on server + first client paint.
  const completedCount = mounted ? done.length : 0;
  const totalXp = DAILY_QUESTS.filter((q) => done.includes(q.id)).reduce((s, q) => s + q.xp, 0);
  const allDone = mounted && completedCount === DAILY_QUESTS.length;

  return (
    <div className="rounded-xl border border-accent/25 bg-background/50 backdrop-blur-sm p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <SectionHeading accent="accent">⚔️ Daily Quests</SectionHeading>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {completedCount}/{DAILY_QUESTS.length} · +{totalXp} XP
        </span>
      </div>

      <ul className="space-y-2">
        {DAILY_QUESTS.map((q) => {
          const isDone = mounted && done.includes(q.id);
          return (
            <li
              key={q.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
                isDone
                  ? 'border-secondary/40 bg-secondary/10'
                  : 'border-muted/25 bg-muted/5',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0 transition-all',
                  isDone ? 'border-secondary/60 bg-secondary/20 text-secondary' : 'border-muted/40 text-transparent',
                )}
              >
                <Check className="w-3.5 h-3.5" aria-hidden />
              </span>
              <span className="text-base flex-shrink-0">{q.emoji}</span>
              <span className={cn('text-sm flex-1', isDone ? 'text-foreground line-through opacity-70' : 'text-foreground/90')}>
                {q.label}
              </span>
              <span className={cn('text-[10px] font-bold tabular-nums flex-shrink-0', isDone ? 'text-secondary' : 'text-muted-foreground/60')}>
                +{q.xp}
              </span>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="mt-4 text-center text-xs font-bold text-secondary neon-text-cyan uppercase tracking-wider">
          🔥 All quests complete — come back tomorrow
        </p>
      )}
    </div>
  );
}
