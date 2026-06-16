'use client';

import { useState, useEffect } from 'react';
import { Flame, ShieldCheck, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  syncWithCloud,
  getUser,
  getHistoryFromCloud,
  saveHistoryEntryToCloud,
  deleteHistoryEntryFromCloud,
  type HistoryEntry,
} from '@/lib/sync';

// ── Calendar Heatmap ─────────────────────────────────────────────────────────
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function CalendarHeatmap({ entries }: { entries: HistoryEntry[] }) {
  const WEEKS = 15;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a map of date string → type
  const dayMap: Record<string, 'victory' | 'relapse' | 'both'> = {};
  for (const e of entries) {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) continue;
    const key = toYMD(d);
    const prev = dayMap[key];
    if (!prev) dayMap[key] = e.type;
    else if (prev !== e.type) dayMap[key] = 'both';
  }

  // Build grid: WEEKS columns × 7 rows (Mon–Sun)
  // Start from the Monday WEEKS weeks ago
  const todayDow = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - todayDow - (WEEKS - 1) * 7);

  const weeks: Date[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(gridStart);
      cell.setDate(gridStart.getDate() + w * 7 + d);
      week.push(cell);
    }
    weeks.push(week);
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-secondary neon-text-cyan">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block" />Victory</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" />Relapse</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-muted/30 inline-block" />None</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
          <div className="h-4" /> {/* spacer for month label row */}
          {dayLabels.map((l, i) => (
            <div key={i} className="w-3 h-3 text-[8px] text-muted-foreground/50 flex items-center justify-center">{l}</div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const firstOfMonth = week.find((d) => d.getDate() === 1);
          const monthLabel = firstOfMonth
            ? firstOfMonth.toLocaleString('default', { month: 'short' })
            : '';
          return (
            <div key={wi} className="flex flex-col gap-1 flex-shrink-0">
              <div className="h-4 text-[8px] text-muted-foreground/50 flex items-end justify-center whitespace-nowrap">
                {monthLabel}
              </div>
              {week.map((day, di) => {
                const key = toYMD(day);
                const type = dayMap[key];
                const isFuture = day > today;
                const isToday = toYMD(day) === toYMD(today);

                let bg = 'bg-muted/20';
                if (!isFuture) {
                  if (type === 'victory') bg = 'bg-emerald-500/70';
                  else if (type === 'relapse') bg = 'bg-red-500/70';
                  else if (type === 'both') bg = 'bg-yellow-500/70';
                }

                return (
                  <div
                    key={di}
                    title={`${day.toDateString()}${type ? ` — ${type}` : ''}`}
                    className={`w-3 h-3 rounded-sm transition-all ${bg} ${isToday ? 'ring-1 ring-secondary' : ''} ${isFuture ? 'opacity-20' : ''}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/40">Last {WEEKS} weeks</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [newNote, setNewNote] = useState('');
  const [entryType, setEntryType] = useState<'victory' | 'relapse'>('victory');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const saved = typeof window !== 'undefined'
          ? localStorage.getItem('seedguard_history')
          : null;
        if (saved) setEntries(JSON.parse(saved));

        const user = await getUser();
        setIsLoggedIn(!!user);

        if (user) {
          const cloudEntries = await getHistoryFromCloud();
          if (cloudEntries.length > 0) {
            setEntries(cloudEntries);
            localStorage.setItem('seedguard_history', JSON.stringify(cloudEntries));
          } else if (saved) {
            const localEntries: HistoryEntry[] = JSON.parse(saved);
            if (localEntries.length > 0) {
              for (const entry of localEntries) {
                await saveHistoryEntryToCloud(entry);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const addEntry = async () => {
    if (!newNote.trim() && entryType === 'victory') return;

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      type: entryType,
      note: newNote.trim(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('seedguard_history', JSON.stringify(updated));
    setNewNote('');

    if (isLoggedIn) {
      setSaving(true);
      setSaveStatus('idle');
      try {
        await saveHistoryEntryToCloud(newEntry);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save to cloud:', err);
        setSaveStatus('error');
      } finally {
        setSaving(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }

    if (entryType === 'relapse') {
      const now = new Date().toISOString();
      localStorage.setItem('seedguard_streak_start', now);
      try {
        const statsRaw = localStorage.getItem('seedguard_stats');
        const stats = statsRaw ? JSON.parse(statsRaw) : {};
        localStorage.setItem('seedguard_stats', JSON.stringify({
          ...stats,
          currentStreak: 0,
          relapses: (stats.relapses || 0) + 1,
        }));
      } catch {}
      syncWithCloud(true).catch(console.warn);
    }
  };

  const deleteEntry = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem('seedguard_history', JSON.stringify(updated));
    if (isLoggedIn) {
      deleteHistoryEntryFromCloud(id).catch(console.warn);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-subtle text-primary neon-text-pink">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const victories = entries.filter((e) => e.type === 'victory');
  const relapses = entries.filter((e) => e.type === 'relapse');

  if (typeof window === 'undefined') return null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 page-entry">
      <div>
        <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">
          History
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Track every victory and setback — the whole picture builds discipline.
        </p>
      </div>

      {/* Calendar Heatmap */}
      <CalendarHeatmap entries={entries} />

      {/* Log Entry */}
      <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-6 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg uppercase tracking-wider">Log New Entry</h3>
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Saved to cloud
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-4 h-4" /> Saved locally only
            </span>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setEntryType('victory')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                entryType === 'victory'
                  ? 'bg-primary/20 text-primary neon-text-pink border border-primary/50'
                  : 'bg-muted/50 text-muted-foreground border border-muted/50 hover:bg-muted/75'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              Victory
            </button>
            <button
              onClick={() => setEntryType('relapse')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                entryType === 'relapse'
                  ? 'bg-destructive/20 text-destructive border border-destructive/50'
                  : 'bg-muted/50 text-muted-foreground border border-muted/50 hover:bg-muted/75'
              }`}
            >
              <Flame className="w-5 h-5" />
              Relapse
            </button>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={entryType === 'victory' ? 'Write about your victory...' : 'What led to this relapse?'}
            className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            rows={3}
          />
          <button
            onClick={addEntry}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-all font-medium uppercase tracking-wider disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {saving ? 'Saving...' : 'Log Entry'}
          </button>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 animate-scale-in">
          <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 text-secondary neon-text-cyan">
            <ShieldCheck className="w-6 h-6" />
            Victories & Notes
          </h2>
          {victories.length === 0 ? (
            <div className="text-sm text-muted-foreground italic border border-dashed border-muted/50 rounded-lg p-6 text-center">
              No wins logged yet. Start your journey today!
            </div>
          ) : (
            <div className="space-y-3">
              {victories.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-secondary/20 bg-background/50 p-4 hover:border-secondary/50 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">{entry.date}</p>
                      <p className="text-foreground">{entry.note}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/20 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 animate-scale-in [animation-delay:100ms]">
          <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 text-destructive">
            <Flame className="w-6 h-6" />
            Relapse Log
          </h2>
          {relapses.length === 0 ? (
            <div className="text-sm text-muted-foreground italic border border-dashed border-muted/50 rounded-lg p-6 text-center">
              No relapses logged yet. Keep it up!
            </div>
          ) : (
            <div className="space-y-3">
              {relapses.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-destructive/20 bg-background/50 p-4 hover:border-destructive/50 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">{entry.date}</p>
                      <p className="text-foreground">{entry.note || 'Relapse recorded'}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/20 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-8">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wider">Session Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary neon-text-cyan">{victories.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Victories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{relapses.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Relapses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary neon-text-pink">
                {entries.length > 0 ? Math.round((victories.length / entries.length) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{entries.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Entries</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
