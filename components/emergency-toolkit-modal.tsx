'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { X, ArrowLeft, Wind, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BreathingTimer } from '@/components/breathing-timer';
import { RecoveryTree } from '@/components/recovery-tree';
import { RecoveryCoachChat } from '@/components/recovery-coach-chat';
import { getStage } from '@/lib/recovery-tree';
import { QUOTES } from '@/lib/quotes';
import { getUser } from '@/lib/sync';
import { saveHistoryEntryToCloud, type HistoryEntry } from '@/lib/sync';
import { getPartner } from '@/lib/partner';
import { getMyCloudPartner, type CloudPartner } from '@/lib/accountability-cloud';
import { sendMessage } from '@/lib/social';
import {
  TOOLS, intensityTier, intensityLabel, recommendedTools, getTool,
  WALK_CHALLENGE_STEPS, COLD_SHOWER_STEPS, randomWorkout,
  type ToolId,
} from '@/lib/emergency-toolkit';

const EMERGENCY_JOURNAL_KEY = 'seedguard_emergency_journal';

interface Props {
  streakDays: number;
  onClose: () => void;
}

function saveEmergencyJournalEntry(text: string) {
  if (typeof window === 'undefined' || !text.trim()) return;
  try {
    const list = JSON.parse(localStorage.getItem(EMERGENCY_JOURNAL_KEY) || '[]') as { date: string; text: string }[];
    list.unshift({ date: new Date().toISOString(), text: text.trim() });
    localStorage.setItem(EMERGENCY_JOURNAL_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {}
}

export function EmergencyToolkitModal({ streakDays, onClose }: Props) {
  const [phase, setPhase] = useState<'intensity' | 'tools'>('intensity');
  const [intensity, setIntensity] = useState(5);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [toolsUsed, setToolsUsed] = useState<Set<ToolId>>(new Set());
  const [logged, setLogged] = useState(false);

  const stage = getStage(streakDays);
  const tier = intensityTier(intensity);
  const recommended = useMemo(() => recommendedTools(intensity), [intensity]);
  const recommendedIds = useMemo(() => new Set(recommended.map((t) => t.id)), [recommended]);
  const moreTools = useMemo(() => TOOLS.filter((t) => !recommendedIds.has(t.id)), [recommendedIds]);

  // Stable per-open quote (not re-randomized every render)
  const [motivationQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  function openTool(id: ToolId) {
    setActiveTool(id);
    setToolsUsed((prev) => new Set(prev).add(id));
  }

  async function handleLogVictory() {
    if (logged) return;
    setLogged(true);
    try {
      const toolNames = Array.from(toolsUsed).map((id) => getTool(id).name);
      const note = toolNames.length > 0
        ? `Resisted a ${intensity}/10 urge using: ${toolNames.join(', ')}.`
        : `Resisted a ${intensity}/10 urge.`;
      const entry: HistoryEntry = { id: Date.now().toString(), date: new Date().toLocaleString(), type: 'victory', note };
      const existing = JSON.parse(localStorage.getItem('seedguard_history') || '[]') as HistoryEntry[];
      localStorage.setItem('seedguard_history', JSON.stringify([entry, ...existing]));
      const user = await getUser();
      if (user) await saveHistoryEntryToCloud(entry).catch(() => {});
    } catch {}
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-destructive/40 bg-background/97 p-6 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTool ? (
              <button onClick={() => setActiveTool(null)} className="flex items-center gap-1.5 text-secondary hover:text-secondary/80">
                <ArrowLeft className="w-4 h-4" aria-hidden />
                <span className="text-sm font-bold uppercase tracking-wider">{getTool(activeTool).name}</span>
              </button>
            ) : phase === 'tools' ? (
              <button onClick={() => setPhase('intensity')} className="flex items-center gap-1.5 text-secondary hover:text-secondary/80">
                <ArrowLeft className="w-4 h-4" aria-hidden />
                <span className="text-sm font-bold uppercase tracking-wider">Toolkit</span>
              </button>
            ) : (
              <>
                <Wind className="w-5 h-5 text-secondary" aria-hidden />
                <h3 className="font-bold uppercase tracking-wider text-secondary text-sm neon-text-cyan">Emergency Recovery Toolkit</h3>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {/* Recovery Tree banner — always visible, the emotional stake */}
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3 flex items-center gap-3">
          <RecoveryTree stage={stage} variant="compact" className="!w-12 !h-12 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-snug">
            Protecting your <span className="font-bold text-secondary">{stage.name}</span>, day {streakDays} streak.
          </p>
        </div>

        {!activeTool && phase === 'intensity' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              An urge lasts <strong className="text-foreground">90 seconds</strong> at peak intensity. You have survived every urge so far, this one is no different.
            </p>
            <div>
              <p className="text-xs text-muted-foreground mb-2">How strong is this urge right now?</p>
              <input
                type="range" min={1} max={10} step={1} value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-extrabold font-mono text-destructive">{intensity}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{intensityLabel(intensity)}</span>
              </div>
            </div>
            <button
              onClick={() => setPhase('tools')}
              className="w-full py-3 rounded-xl bg-secondary/20 border border-secondary/50 text-secondary font-bold uppercase tracking-wider text-sm hover:bg-secondary/30 transition-all"
            >
              See my tools →
            </button>
          </div>
        )}

        {!activeTool && phase === 'tools' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">Recommended for {tier}</p>
              <div className="grid grid-cols-3 gap-2">
                {recommended.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openTool(t.id)}
                    className="text-center p-2.5 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 transition-all"
                  >
                    <span className="text-base">{t.emoji}</span>
                    <p className="text-[9px] font-bold mt-1 text-foreground leading-tight">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {moreTools.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">More tools</p>
                <div className="grid grid-cols-3 gap-2">
                  {moreTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openTool(t.id)}
                      className="text-center p-2.5 rounded-xl border border-muted/30 bg-muted/10 hover:bg-muted/20 transition-all"
                    >
                      <span className="text-base">{t.emoji}</span>
                      <p className="text-[9px] font-semibold mt-1 text-muted-foreground leading-tight">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTool === 'breathing' && <BreathingTimer />}

        {activeTool === 'motivation' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground italic text-center">&ldquo;{QUOTES[motivationQuoteIdx].text}&rdquo;</p>
            {QUOTES[motivationQuoteIdx].author && (
              <p className="text-xs text-primary text-center mt-2 font-semibold">~ {QUOTES[motivationQuoteIdx].author}</p>
            )}
          </div>
        )}

        {activeTool === 'delay' && <DelayTimer />}
        {activeTool === 'walk' && <ChecklistPanel steps={WALK_CHALLENGE_STEPS} />}
        {activeTool === 'coldshower' && <ChecklistPanel steps={COLD_SHOWER_STEPS} />}
        {activeTool === 'workout' && <WorkoutPanel />}
        {activeTool === 'journal' && <JournalPanel onSave={saveEmergencyJournalEntry} />}
        {activeTool === 'coach' && <RecoveryCoachChat mode="crisis" />}
        {activeTool === 'partner' && <PartnerQuickAccess />}

        <button
          onClick={handleLogVictory}
          disabled={logged}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/20 text-sm font-medium transition-all disabled:opacity-50"
        >
          I made it: Log a Victory ✓
        </button>
      </div>
    </div>
  );
}

// ── Sub-panels ────────────────────────────────────────────────────────────

function DelayTimer() {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="text-center space-y-3 py-2">
      <p className="text-sm text-muted-foreground">Urges peak and fade within 15-20 minutes. Just outlast this one.</p>
      <p className="text-5xl font-mono font-extrabold text-secondary neon-text-cyan tabular-nums">
        {mins}:{String(secs).padStart(2, '0')}
      </p>
      {secondsLeft === 0 && <p className="text-sm font-bold text-secondary">Time&apos;s up. You waited it out. That is the whole game.</p>}
    </div>
  );
}

function ChecklistPanel({ steps }: { steps: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <label key={i} className="flex items-start gap-3 p-3 rounded-xl border border-muted/25 bg-muted/10 cursor-pointer">
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))}
            className="mt-0.5"
          />
          <span className={cn('text-sm', checked[i] ? 'text-muted-foreground line-through' : 'text-foreground')}>{step}</span>
        </label>
      ))}
    </div>
  );
}

function WorkoutPanel() {
  const [workout, setWorkout] = useState(() => randomWorkout());
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {workout.map((move, i) => (
          <div key={i} className="p-3 rounded-xl border border-muted/25 bg-muted/10 text-sm font-medium text-foreground">{move}</div>
        ))}
      </div>
      <button
        onClick={() => setWorkout(randomWorkout())}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-muted/30 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Generate another
      </button>
    </div>
  );
}

function JournalPanel({ onSave }: { onSave: (text: string) => void }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">What&apos;s actually happening right now? What do you really need?</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Write it out..."
        className="w-full rounded-lg border border-muted/30 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-secondary/50 resize-none"
      />
      <button
        onClick={() => { onSave(text); setSaved(true); setText(''); }}
        disabled={!text.trim() || saved}
        className="w-full py-2 rounded-lg bg-secondary/20 border border-secondary/50 text-secondary text-sm font-bold hover:bg-secondary/30 transition-all disabled:opacity-50"
      >
        {saved ? 'Saved ✓' : 'Save privately'}
      </button>
    </div>
  );
}

function PartnerQuickAccess() {
  const [cloudPartner, setCloudPartner] = useState<CloudPartner | null>(null);
  const [localName, setLocalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    getMyCloudPartner().then((p) => {
      setCloudPartner(p);
      if (!p) setLocalName(getPartner()?.name ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>;

  if (cloudPartner) {
    return (
      <div className="text-center space-y-3 py-2">
        <p className="text-sm text-muted-foreground">Reach out to your accountability partner.</p>
        <p className="font-bold text-foreground">{cloudPartner.username}</p>
        <button
          onClick={async () => { await sendMessage(cloudPartner.partnerId, "🆘 I'm struggling right now, could use some support."); setSent(true); }}
          disabled={sent}
          className="w-full py-2.5 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm font-bold hover:bg-primary/30 transition-all disabled:opacity-50"
        >
          {sent ? 'Message sent ✓' : `Message ${cloudPartner.username}`}
        </button>
      </div>
    );
  }

  if (localName) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Your accountability partner is <span className="font-bold text-foreground">{localName}</span>. Reach out to them directly right now.
      </p>
    );
  }

  return (
    <div className="text-center space-y-3 py-2">
      <p className="text-sm text-muted-foreground">You don&apos;t have an accountability partner set up yet.</p>
      <Link href="/social" className="inline-block px-5 py-2.5 rounded-lg border border-primary/50 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
        Set up a partner
      </Link>
    </div>
  );
}
