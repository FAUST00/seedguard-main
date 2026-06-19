'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { PageHeader, SectionHeading, EmptyState } from '@/components/ui';
import type { HistoryEntry } from '@/lib/sync';

const TIME_BLOCKS = ['Late Night', 'Morning', 'Afternoon', 'Evening'] as const;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function timeBlock(hour: number): typeof TIME_BLOCKS[number] {
  if (hour < 4) return 'Late Night';
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      setEntries(JSON.parse(localStorage.getItem('seedguard_history') || '[]'));
    } catch {}
  }, []);

  const relapses = useMemo(
    () => entries.filter((e) => e.type === 'relapse' && !isNaN(new Date(e.date).getTime())),
    [entries],
  );

  const triggerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of relapses) {
      if (r.trigger) counts[r.trigger] = (counts[r.trigger] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [relapses]);

  const topTrigger = triggerCounts[0]?.[0] ?? null;
  const topTriggerPct = relapses.length > 0 && topTrigger
    ? Math.round(((triggerCounts[0]?.[1] ?? 0) / relapses.length) * 100)
    : 0;

  const dayOfWeekCounts = useMemo(() => {
    const counts = new Array(7).fill(0);
    for (const r of relapses) counts[new Date(r.date).getDay()]++;
    return counts;
  }, [relapses]);

  const timeBlockCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Late Night': 0, Morning: 0, Afternoon: 0, Evening: 0 };
    for (const r of relapses) counts[timeBlock(new Date(r.date).getHours())]++;
    return counts;
  }, [relapses]);

  const avgUrgeStrength = useMemo(() => {
    const withStrength = relapses.filter((r) => typeof r.urgeStrength === 'number');
    if (withStrength.length === 0) return null;
    return Math.round((withStrength.reduce((s, r) => s + (r.urgeStrength ?? 0), 0) / withStrength.length) * 10) / 10;
  }, [relapses]);

  const lateNightPct = relapses.length > 0
    ? Math.round((timeBlockCounts['Late Night'] / relapses.length) * 100)
    : 0;

  const maxDayCount = Math.max(1, ...dayOfWeekCounts);
  const maxTriggerCount = Math.max(1, ...triggerCounts.map(([, c]) => c));
  const maxTimeCount = Math.max(1, ...Object.values(timeBlockCounts));

  if (relapses.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-8 page-entry">
        <PageHeader title="Recovery Insights" accent="secondary" subtitle="Turn relapses into useful behavioral data." />
        <EmptyState
          Icon={BarChart3}
          accent="secondary"
          title="No data yet"
          description="Log a relapse with a trigger in the History tab and your insights will appear here."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl space-y-8 page-entry">
      <PageHeader title="Recovery Insights" accent="secondary" subtitle="Turn relapses into useful behavioral data." />

      {/* Correlation insight sentences */}
      <div className="space-y-2">
        {topTrigger && (
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-4 text-sm">
            <span className="font-bold text-secondary">{topTrigger}</span> is involved in{' '}
            <span className="font-bold text-secondary">{topTriggerPct}%</span> of your logged relapses.
          </div>
        )}
        {lateNightPct >= 30 && (
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-4 text-sm">
            You are <span className="font-bold text-secondary">{lateNightPct}%</span> more likely to relapse after midnight than any other time block.
          </div>
        )}
        {avgUrgeStrength !== null && (
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-4 text-sm">
            Average urge strength at the moment of relapse: <span className="font-bold text-secondary">{avgUrgeStrength}/10</span>.
          </div>
        )}
      </div>

      {/* Trigger frequency */}
      {triggerCounts.length > 0 && (
        <section className="space-y-3">
          <SectionHeading accent="secondary">Trigger Frequency</SectionHeading>
          <div className="rounded-xl border border-muted/20 bg-background/40 p-5 space-y-3">
            {triggerCounts.map(([trigger, count]) => (
              <div key={trigger} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0 truncate">{trigger}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-secondary/70"
                    style={{ width: `${(count / maxTriggerCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-of-week analysis */}
      <section className="space-y-3">
        <SectionHeading accent="secondary">Day-of-Week Pattern</SectionHeading>
        <div className="rounded-xl border border-muted/20 bg-background/40 p-5 flex items-end justify-between gap-2 h-32">
          {DAY_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-t-md bg-secondary/60"
                style={{ height: `${(dayOfWeekCounts[i] / maxDayCount) * 100}%`, minHeight: dayOfWeekCounts[i] > 0 ? '4px' : '0' }}
              />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Time-of-day analysis */}
      <section className="space-y-3">
        <SectionHeading accent="secondary">Time-of-Day Pattern</SectionHeading>
        <div className="rounded-xl border border-muted/20 bg-background/40 p-5 space-y-3">
          {TIME_BLOCKS.map((block) => (
            <div key={block} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{block}</span>
              <div className="flex-1 h-2.5 rounded-full bg-muted/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary/70"
                  style={{ width: `${(timeBlockCounts[block] / maxTimeCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">{timeBlockCounts[block]}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground/50 text-center">
        Based on {relapses.length} logged relapse{relapses.length !== 1 ? 's' : ''}. Log triggers in the History tab to improve these insights.
      </p>
    </div>
  );
}
