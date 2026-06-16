'use client';

import { useState } from 'react';
import { X, ShieldCheck, Flame } from 'lucide-react';

/** Bottom-sheet for quickly logging a victory or relapse from the dashboard FAB. */
export function QuickLogSheet({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'victory' | 'relapse'>('victory');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const entry = { id: Date.now().toString(), date: new Date().toLocaleString(), type, note: note.trim() };
    try {
      const raw = localStorage.getItem('seedguard_history');
      const hist = raw ? JSON.parse(raw) : [];
      hist.unshift(entry);
      localStorage.setItem('seedguard_history', JSON.stringify(hist));
      if (type === 'relapse') {
        localStorage.setItem('seedguard_streak_start', new Date().toISOString());
        try {
          const sr = localStorage.getItem('seedguard_stats');
          const s = sr ? JSON.parse(sr) : {};
          localStorage.setItem('seedguard_stats', JSON.stringify({ ...s, currentStreak: 0, relapses: (s.relapses || 0) + 1 }));
        } catch {}
      }
    } catch {}
    setSaved(true);
    setTimeout(() => { onClose(); window.location.reload(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-background/97 p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-primary neon-text-pink text-sm">Quick Log</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setType('victory')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-sm transition-all ${type === 'victory' ? 'border-secondary/60 bg-secondary/15 text-secondary' : 'border-muted/30 text-muted-foreground hover:bg-muted/20'}`}>
            <ShieldCheck className="w-4 h-4" /> Victory
          </button>
          <button onClick={() => setType('relapse')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-sm transition-all ${type === 'relapse' ? 'border-destructive/60 bg-destructive/15 text-destructive' : 'border-muted/30 text-muted-foreground hover:bg-muted/20'}`}>
            <Flame className="w-4 h-4" /> Relapse
          </button>
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === 'victory' ? 'Quick note (optional)…' : 'What happened?'}
          className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={submit}
          disabled={saved}
          className="w-full py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-bold uppercase tracking-wider hover:bg-primary/30 transition-all disabled:opacity-60"
        >
          {saved ? '✓ Saved!' : 'Log Entry'}
        </button>
      </div>
    </div>
  );
}
