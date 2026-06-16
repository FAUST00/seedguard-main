'use client';

/**
 * Settings page — appearance (theme), notifications, data management,
 * and the Danger Zone with typed-confirmation account deletion.
 *
 * Fixes applied:
 *  - Sound toggle plays a test beep when turned ON
 *  - "Clear All Local Data" also resets cloud streak for logged-in users
 */

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Moon, Sparkles,
  Trash2, Download, AlertTriangle, Loader2,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/components/toast';
import { ImageBanner } from '@/components/synth-background';
import { ART } from '@/lib/assets';
import { getUser, resetStreakInCloud } from '@/lib/sync';
import { playSound } from '@/lib/sound';
import { supabase } from '@/lib/supabase';
import { notificationsSupported, getPermission, requestPermission, showLocalNotification } from '@/lib/notifications';

const DELETION_PHRASE = 'delete my account';

interface SettingsState {
  notifications: boolean;
  soundEnabled: boolean;
  autoBackup: boolean;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    soundEnabled: false,
    autoBackup: true,
  });

  // Account deletion
  const [deletionPhrase, setDeletionPhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seedguard_settings');
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
    getUser().then((u) => setHasAccount(!!u));
    setNotifPerm(notificationsSupported() ? getPermission() : 'unsupported');
  }, []);

  async function handleEnableNotifications() {
    const perm = await requestPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      showLocalNotification('Notifications on', 'You’ll get alerts for nudges and messages while SeedGuard is open.');
      toast('Notifications enabled.', 'success');
    } else if (perm === 'denied') {
      toast('Notifications blocked. Enable them in your browser settings.', 'error');
    }
  }

  function updateSettings(key: keyof SettingsState, value: boolean) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try { localStorage.setItem('seedguard_settings', JSON.stringify(updated)); } catch {}
    // Play a test beep when the user enables sound — immediate proof it works
    if (key === 'soundEnabled' && value === true) {
      setTimeout(() => playSound('toggle'), 50);
    }
    toast('Setting saved', 'success');
  }

  function exportData() {
    const data = {
      stats: localStorage.getItem('seedguard_stats'),
      history: localStorage.getItem('seedguard_history'),
      settings: localStorage.getItem('seedguard_settings'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seedguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup downloaded.', 'success');
  }

  async function handleClearLocalData() {
    const msg = hasAccount
      ? 'Delete all local data AND reset your cloud streak to zero?\n\nYour streak timer will start fresh when you next log in.'
      : 'Delete all local data? This cannot be undone.';
    if (!confirm(msg)) return;
    if (hasAccount) {
      try {
        await resetStreakInCloud();
      } catch {
        // Non-fatal — local clear still proceeds
      }
    }
    localStorage.clear();
    window.location.reload();
  }

  async function handleDeleteAccount() {
    if (deletionPhrase !== DELETION_PHRASE) {
      toast('Phrase does not match — try again.', 'error');
      return;
    }
    setDeleting(true);
    try {
      // Call the DB-side RPC which deletes auth.users and cascades all data
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      // Clear local storage
      localStorage.clear();
      toast('Account permanently deleted. Redirecting…', 'info');
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch (err: unknown) {
      toast((err as Error).message ?? 'Deletion failed — please try again.', 'error');
      setDeleting(false);
    }
  }

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const ToggleSwitch = ({
    checked,
    onChange,
    id,
    label,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    id: string;
    label: string;
  }) => (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer group">
      <span className="font-medium group-hover:text-foreground transition-colors">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary/40 transition-colors
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:rounded-full after:h-5 after:w-5
          after:transition-transform peer-checked:after:translate-x-6
          peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
      </div>
    </label>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl space-y-8 page-entry">
      {/* Header banner */}
      <ImageBanner src={ART.gridCity} className="mb-2">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary flex items-center gap-3">
            <SettingsIcon className="w-9 h-9" aria-hidden />
            Settings
          </h1>
          <p className="text-muted-foreground text-base mt-1">Customize your SeedGuard experience.</p>
        </div>
      </ImageBanner>

      {/* ── Appearance ─────────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-primary/20 glass-effect p-8 space-y-6 animate-scale-in"
        aria-labelledby="appearance-heading"
      >
        <h2 id="appearance-heading" className="text-lg font-bold uppercase tracking-wider text-primary neon-text-pink">
          Appearance
        </h2>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Choose your synthwave theme:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Synthwave Night */}
            <button
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`rounded-xl border p-4 text-left transition-all neon-hover
                ${theme === 'dark' ? 'border-primary/60 bg-primary/15 neon-box-pink' : 'border-muted/30 hover:border-muted/60'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-primary" aria-hidden />
                <span className="font-bold text-sm text-primary">Synthwave Night</span>
                {theme === 'dark' && (
                  <span className="ml-auto text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Deep indigo sky, hot magenta + electric cyan. The classic night-city vibe.
              </p>
              <div className="flex gap-1.5 mt-3" aria-hidden>
                <span className="w-4 h-4 rounded-full bg-[hsl(315,100%,60%)]" />
                <span className="w-4 h-4 rounded-full bg-[hsl(184,100%,55%)]" />
                <span className="w-4 h-4 rounded-full bg-[hsl(265,95%,66%)]" />
              </div>
            </button>

            {/* Synthwave Neon Bright */}
            <button
              onClick={() => setTheme('bright')}
              aria-pressed={theme === 'bright'}
              className={`rounded-xl border p-4 text-left transition-all neon-hover
                ${theme === 'bright' ? 'border-secondary/60 bg-secondary/10 neon-box-cyan' : 'border-muted/30 hover:border-muted/60'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-secondary" aria-hidden />
                <span className="font-bold text-sm text-secondary">Neon Bright</span>
                {theme === 'bright' && (
                  <span className="ml-auto text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                Cranked-up neons — vivid cyan, magenta, electric blue. High-contrast daymode.
              </p>
              <div className="flex gap-1.5 mt-3" aria-hidden>
                <span className="w-4 h-4 rounded-full bg-[hsl(308,100%,68%)]" />
                <span className="w-4 h-4 rounded-full bg-[hsl(178,100%,60%)]" />
                <span className="w-4 h-4 rounded-full bg-[hsl(217,100%,68%)]" />
              </div>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-muted/20">
          <ToggleSwitch
            id="legacy-dark"
            label="Dark mode (night/bright quick-toggle)"
            checked={theme === 'dark'}
            onChange={(v) => setTheme(v ? 'dark' : 'bright')}
          />
        </div>
      </section>

      {/* ── Notifications ──────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-secondary/20 glass-effect p-8 space-y-5 animate-scale-in [animation-delay:100ms]"
        aria-labelledby="notifications-heading"
      >
        <h2 id="notifications-heading" className="text-lg font-bold uppercase tracking-wider text-secondary neon-text-cyan">
          Notifications
        </h2>
        <div className="space-y-4">
          {/* Browser notifications — real permission-backed opt-in */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Alerts for nudges &amp; messages while SeedGuard is open.</p>
            </div>
            {notifPerm === 'unsupported' ? (
              <span className="text-xs text-muted-foreground/60">Not supported</span>
            ) : notifPerm === 'granted' ? (
              <span className="text-xs px-3 py-1.5 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary font-semibold">✓ Enabled</span>
            ) : notifPerm === 'denied' ? (
              <span className="text-xs px-3 py-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive font-semibold">Blocked</span>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="text-xs px-3 py-1.5 rounded-lg border border-secondary/50 bg-secondary/15 text-secondary font-bold hover:bg-secondary/25 transition-all"
              >
                Enable
              </button>
            )}
          </div>
          <ToggleSwitch
            id="sound-effects"
            label="Sound Effects"
            checked={settings.soundEnabled}
            onChange={(v) => updateSettings('soundEnabled', v)}
          />
          <ToggleSwitch
            id="auto-backup"
            label="Auto-Backup Data"
            checked={settings.autoBackup}
            onChange={(v) => updateSettings('autoBackup', v)}
          />
        </div>
      </section>

      {/* ── Data Management ────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-accent/20 glass-effect p-8 space-y-5 animate-scale-in [animation-delay:200ms]"
        aria-labelledby="data-heading"
      >
        <h2 id="data-heading" className="text-lg font-bold uppercase tracking-wider text-accent">
          Data Management
        </h2>
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-accent/50 text-accent bg-accent/10 hover:bg-accent/20 font-bold uppercase tracking-wider neon-hover"
        >
          <Download className="w-5 h-5" aria-hidden />
          Export Data
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Downloads stats, history, and settings as a JSON file.
        </p>
      </section>

      {/* ── Danger Zone ────────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-destructive/30 glass-effect p-8 space-y-6 animate-scale-in [animation-delay:300ms]"
        aria-labelledby="danger-heading"
      >
        <h2 id="danger-heading" className="text-lg font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" aria-hidden /> Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">These actions are permanent. Proceed with extreme caution.</p>

        {/* Clear local data — also resets cloud streak for logged-in users */}
        <button
          onClick={handleClearLocalData}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 font-bold uppercase tracking-wider neon-hover"
        >
          <Trash2 className="w-5 h-5" aria-hidden />
          Clear All Local Data
        </button>
        {hasAccount && (
          <p className="text-xs text-muted-foreground/70 text-center -mt-3">
            You&apos;re logged in — this will also reset your cloud streak to zero.
          </p>
        )}

        {/* Permanent account deletion — cloud accounts only */}
        {hasAccount && (
          <div className="space-y-4">
            <button
              onClick={() => setShowDeletePanel((v) => !v)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-destructive text-destructive bg-destructive/5 hover:bg-destructive/15 font-bold uppercase tracking-wider transition-all"
              aria-expanded={showDeletePanel}
            >
              <AlertTriangle className="w-5 h-5" aria-hidden />
              Permanently Delete Account
            </button>

            {showDeletePanel && (
              <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-5 space-y-4 animate-scale-in">
                <div className="text-sm text-destructive/90 space-y-1">
                  <p className="font-bold">⚠️ This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-destructive/70 ml-2">
                    <li>Your account and login credentials</li>
                    <li>All streak data and history</li>
                    <li>Your friends list and messages</li>
                    <li>Your public profile and leaderboard entry</li>
                  </ul>
                  <p className="pt-1 font-bold text-destructive">This action CANNOT be undone.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="delete-confirm" className="block text-sm font-bold text-destructive">
                    Type <span className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded">{DELETION_PHRASE}</span> to confirm:
                  </label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deletionPhrase}
                    onChange={(e) => setDeletionPhrase(e.target.value)}
                    placeholder={DELETION_PHRASE}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl border border-destructive/40 bg-background/60 text-sm focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/50 text-destructive placeholder:text-destructive/30"
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deletionPhrase !== DELETION_PHRASE}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-destructive text-destructive-foreground font-extrabold uppercase tracking-wider hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
                  {deleting ? 'Deleting…' : 'Yes, Delete My Account Forever'}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* About */}
      <section className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 text-center space-y-3 animate-scale-in [animation-delay:400ms]">
        <h3 className="font-bold text-base uppercase tracking-wider">About SeedGuard</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Version</span> 3.1.0</p>
          <p><span className="font-semibold text-foreground">Made for</span> PMO Recovery</p>
          <p className="pt-1">Your local data never leaves your browser. Cloud sync requires an account.</p>
        </div>
      </section>
    </div>
  );
}
