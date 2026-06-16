'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Flame, ShieldCheck, Plus, Trash2, CheckCircle2, AlertCircle,
  ChevronDown, Search, X,
} from 'lucide-react';
import {
  syncWithCloud,
  getUser,
  getHistoryFromCloud,
  saveHistoryEntryToCloud,
  deleteHistoryEntryFromCloud,
  type HistoryEntry,
} from '@/lib/sync';
import { PageHeader, EmptyState } from '@/components/ui';
import { RecoveryHeatmap } from '@/components/recovery-heatmap';

// ── Calendar Heatmap ─────────────────────────────────────────────────────────
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function CalendarHeatmap({ entries }: { entries: HistoryEntry[] }) {
  const WEEKS = 15;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMap: Record<string, 'victory' | 'relapse' | 'both'> = {};
  for (const e of entries) {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) continue;
    const key = toYMD(d);
    const prev = dayMap[key];
    if (!prev) dayMap[key] = e.type;
    else if (prev !== e.type) dayMap[key] = 'both';
  }

  const todayDow = (today.getDay() + 6) % 7;
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
        <div className="flex flex-col gap-1 mr-1 flex-shrink-0">
          <div className="h-4" />
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

// ── Collapsible log entry ─────────────────────────────────────────────────────
function LogEntry({
  entry,
  onDelete,
  expanded,
  onToggle,
}: {
  entry: HistoryEntry;
  onDelete: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isVictory = entry.type === 'victory';
  const noteText = entry.note || (isVictory ? 'Victory logged' : 'Relapse recorded');
  const PREVIEW = 55;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${
      isVictory ? 'border-secondary/20 hover:border-secondary/35' : 'border-destructive/20 hover:border-destructive/35'
    }`}>
      {/* ── Clickable accordion header ── */}
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
          isVictory
            ? 'bg-secondary/5 hover:bg-secondary/10'
            : 'bg-destructive/5 hover:bg-destructive/10'
        }`}
      >
        {/* Type badge */}
        <span className={`flex-shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
          isVictory
            ? 'bg-secondary/15 text-secondary border-secondary/30'
            : 'bg-destructive/15 text-destructive border-destructive/30'
        }`}>
          {isVictory ? '✓ Win' : '✕ Relapse'}
        </span>

        {/* Date */}
        <span className="flex-shrink-0 text-[10px] text-muted-foreground/50 hidden sm:block">
          {entry.date}
        </span>

        {/* Note preview */}
        <span className="flex-1 text-xs text-foreground/75 truncate min-w-0">
          {noteText.length > PREVIEW ? noteText.slice(0, PREVIEW) + '…' : noteText}
        </span>

        {/* Rotating chevron */}
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-muted-foreground/40 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {/* ── Expanded body — smooth max-height transition ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? '500px' : '0px' }}
      >
        <div className={`px-4 py-4 border-t space-y-3 ${
          isVictory ? 'border-secondary/10 bg-secondary/3' : 'border-destructive/10 bg-destructive/3'
        }`}>
          {/* Full date on mobile */}
          <p className="text-[10px] text-muted-foreground/50 sm:hidden">{entry.date}</p>
          {/* Full note */}
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {noteText}
          </p>
          {/* Delete */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => onDelete(entry.id)}
              className="flex items-center gap-1.5 text-xs text-destructive/50 hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────
type FilterType = 'all' | 'victory' | 'relapse' | 'week' | 'month';

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
        active
          ? 'bg-primary/20 text-primary border-primary/50 neon-text-pink'
          : 'text-muted-foreground border-muted/30 hover:border-muted/60 hover:text-foreground'
      }`}
    >
      {children}
    </button>
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

  // Individual entry accordion
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Section-level accordion (open by default)
  const [victoriesOpen, setVictoriesOpen] = useState(true);
  const [relapsesOpen, setRelapsesOpen] = useState(true);

  // Search + filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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

  const toggleEntry = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllExpanded = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(entries.map(e => e.id)));
    }
    setAllExpanded(!allExpanded);
  };

  // Filtered + searched entries
  const filteredEntries = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    return entries.filter(e => {
      if (activeFilter === 'victory' && e.type !== 'victory') return false;
      if (activeFilter === 'relapse' && e.type !== 'relapse') return false;
      if (activeFilter === 'week') {
        const d = new Date(e.date);
        if (isNaN(d.getTime()) || now - d.getTime() > weekMs) return false;
      }
      if (activeFilter === 'month') {
        const d = new Date(e.date);
        if (isNaN(d.getTime()) || now - d.getTime() > monthMs) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!e.note?.toLowerCase().includes(q) && !e.date.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [entries, activeFilter, searchQuery]);

  const victories = filteredEntries.filter((e) => e.type === 'victory');
  const relapses = filteredEntries.filter((e) => e.type === 'relapse');
  const allVictories = entries.filter(e => e.type === 'victory');
  const allRelapses = entries.filter(e => e.type === 'relapse');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-subtle text-primary neon-text-pink">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (typeof window === 'undefined') return null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8 page-entry">
      <PageHeader
        title="History"
        subtitle="Track every victory and setback — the whole picture builds discipline."
      />

      {/* Heatmaps — activity (victory/relapse) + recovery (clean/check-in) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <CalendarHeatmap entries={entries} />
        <RecoveryHeatmap />
      </div>

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

      {/* Search + filter bar */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search entries…"
              className="w-full rounded-xl border border-muted/30 bg-background/50 pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {(['all', 'victory', 'relapse', 'week', 'month'] as FilterType[]).map(f => (
              <FilterChip key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>
                {f === 'all' ? 'All' : f === 'victory' ? 'Victories' : f === 'relapse' ? 'Relapses' : f === 'week' ? 'This Week' : 'This Month'}
              </FilterChip>
            ))}
            <button
              onClick={toggleAllExpanded}
              className="ml-auto text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline"
            >
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
          {(searchQuery || activeFilter !== 'all') && (
            <p className="text-xs text-muted-foreground/50">
              Showing {filteredEntries.length} of {entries.length} entries
            </p>
          )}
        </div>
      )}

      {/* History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Victories section ── */}
        <div className="space-y-3 animate-scale-in">
          <button
            onClick={() => setVictoriesOpen(v => !v)}
            aria-expanded={victoriesOpen}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-secondary/25 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/40 transition-all text-left group"
          >
            <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden />
            <span className="flex-1 text-base font-bold uppercase tracking-widest text-secondary neon-text-cyan">
              Victories &amp; Notes
            </span>
            <span className="text-xs font-semibold text-secondary/50 normal-case tracking-normal mr-2">
              {victories.length} {victories.length === 1 ? 'entry' : 'entries'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-secondary/50 transition-transform duration-300 ${victoriesOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-400 ease-in-out"
            style={{ maxHeight: victoriesOpen ? '99999px' : '0px' }}
          >
            <div className="space-y-2 pt-1">
              {victories.length === 0 ? (
                entries.length === 0 ? (
                  <EmptyState
                    emoji="🛡️"
                    accent="secondary"
                    title="No wins logged yet"
                    description="Every entry sharpens your discipline. Log your first victory above and start the record."
                  />
                ) : (
                  <div className="text-sm text-muted-foreground italic border border-dashed border-muted/50 rounded-lg p-6 text-center">
                    No victories match this filter.
                  </div>
                )
              ) : victories.map((entry) => (
                <LogEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                  expanded={expandedIds.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Relapses section ── */}
        <div className="space-y-3 animate-scale-in [animation-delay:100ms]">
          <button
            onClick={() => setRelapsesOpen(v => !v)}
            aria-expanded={relapsesOpen}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-destructive/25 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/40 transition-all text-left group"
          >
            <Flame className="w-5 h-5 text-destructive flex-shrink-0" aria-hidden />
            <span className="flex-1 text-base font-bold uppercase tracking-widest text-destructive">
              Relapse Log
            </span>
            <span className="text-xs font-semibold text-destructive/50 normal-case tracking-normal mr-2">
              {relapses.length} {relapses.length === 1 ? 'entry' : 'entries'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-destructive/50 transition-transform duration-300 ${relapsesOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-400 ease-in-out"
            style={{ maxHeight: relapsesOpen ? '99999px' : '0px' }}
          >
            <div className="space-y-2 pt-1">
              {relapses.length === 0 ? (
                entries.length === 0 ? (
                  <EmptyState
                    emoji="✨"
                    accent="secondary"
                    title="Clean slate"
                    description="No relapses logged. Keep holding the line — every clean day compounds."
                  />
                ) : (
                  <div className="text-sm text-muted-foreground italic border border-dashed border-muted/50 rounded-lg p-6 text-center">
                    No relapses match this filter.
                  </div>
                )
              ) : relapses.map((entry) => (
                <LogEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={deleteEntry}
                  expanded={expandedIds.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm p-8">
          <h3 className="font-bold text-lg mb-4 uppercase tracking-wider">Session Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary neon-text-cyan">{allVictories.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Victories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{allRelapses.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Relapses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary neon-text-pink">
                {entries.length > 0 ? Math.round((allVictories.length / entries.length) * 100) : 0}%
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
