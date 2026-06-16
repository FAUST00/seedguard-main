'use client';

import { useState, useEffect } from 'react';
import { Card, SectionHeading } from '@/components/ui';
import { TrendingUp } from 'lucide-react';
import { weeklyMood, loadMoodByDate } from '@/lib/recovery';

const MOOD_EMOJI: Record<number, string> = { 0: '·', 1: '😤', 2: '😐', 3: '🙂', 4: '😊', 5: '🔥' };

/**
 * Last-7-days mood trend as a mini bar chart. Self-contained — reads the
 * per-day mood keys from localStorage on mount.
 */
export function WeeklyTrend() {
  const [data, setData] = useState<{ day: string; value: number }[] | null>(null);

  useEffect(() => {
    setData(weeklyMood(loadMoodByDate()));
  }, []);

  const logged = data?.filter((d) => d.value > 0).length ?? 0;

  return (
    <Card accent="accent" padding="md" className="animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <SectionHeading accent="accent" Icon={TrendingUp}>Weekly Mood</SectionHeading>
        <span className="text-[10px] text-muted-foreground tabular-nums">{logged}/7 logged</span>
      </div>

      {!data ? (
        <div className="h-28 skeleton rounded-lg" />
      ) : (
        <div className="flex items-end justify-between gap-2 h-28">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-sm leading-none">{MOOD_EMOJI[d.value]}</span>
              <div
                className={`w-full rounded-t-md transition-all ${d.value > 0 ? 'bg-gradient-to-t from-accent/40 to-secondary/70' : 'bg-muted/20'}`}
                style={{ height: `${d.value > 0 ? (d.value / 5) * 100 : 6}%` }}
              />
              <span className="text-[9px] text-muted-foreground/60 uppercase">{d.day}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
