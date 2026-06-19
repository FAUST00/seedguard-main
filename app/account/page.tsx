'use client';

/**
 * Account page — login/signup form + profile management.
 *
 * Fixes applied:
 *  - Verification step: after signup shows "check your email" screen
 *  - Auth state listener: reacts to SIGNED_IN / SIGNED_OUT events
 *  - Logout clears user-specific localStorage so dashboard resets to 0
 *  - Sound effects on login success / error
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, LogOut, Copy, Check, Shield, ExternalLink, Mail, Pencil, X, Loader2, Camera } from 'lucide-react';
import { signIn, signUp, signOut, getUser, getProfile, migrateLocalToCloud, updateProfile, signInWithGoogle, linkGoogleAccount, getLinkedIdentities } from '@/lib/sync';
import { syncProfileStreak } from '@/lib/social';
import { supabase } from '@/lib/supabase';
import { playSound, unlockAudio } from '@/lib/sound';
import { useToast } from '@/components/toast';
import { AccountSkeleton } from '@/components/skeleton';
import { EarnedBadges } from '@/components/earned-badges';
import { ImageBanner } from '@/components/synth-background';
import { ART } from '@/lib/assets';
import { useRouter } from 'next/navigation';
import { AVATAR_PRESETS } from '@/lib/avatar-presets';
import { resizeImageToDataUri } from '@/lib/avatar-upload';

const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const USERNAME_LS_KEY = 'seedguard_username_changed_at';

function daysUntilNextChange(lastChanged: string | null): number {
  if (!lastChanged) return 0;
  const elapsed = Date.now() - new Date(lastChanged).getTime();
  return Math.max(0, Math.ceil((USERNAME_COOLDOWN_MS - elapsed) / 86_400_000));
}

function validateUsername(val: string): string | null {
  if (val.length < 3) return 'Must be at least 3 characters.';
  if (val.length > 20) return 'Must be 20 characters or fewer.';
  if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Letters, numbers, and underscores only.';
  return null;
}

/** User-specific localStorage keys — cleared on logout so the dashboard resets. */
const USER_LS_KEYS = [
  'seedguard_streak_start',
  'seedguard_stats',
  'seedguard_first_day',
  'seedguard_history',
  'seedguard_profile',
  'seedguard_account',
];

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<'loading' | 'auth' | 'verification' | 'profile'>('loading');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateResults, setMigrateResults] = useState<string[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Avatar
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // ── Initial auth check ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const user = await getUser();
      if (user) {
        const p = await getProfile();
        setProfile(p ?? { username: user.email, id: user.id });
        await syncProfileStreak();
        setStep('profile');
        getLinkedIdentities().then(setLinkedProviders).catch(() => {});
      } else {
        setStep('auth');
      }
    }
    init();
  }, []);

  // ── Auth state listener — reacts to Supabase token lifecycle events ─────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Covers: email confirmation callback, token refresh
          const p = await getProfile();
          setProfile(p ?? { username: session.user.email, id: session.user.id });
          await syncProfileStreak();
          setStep('profile');
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setStep('auth');
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    unlockAudio(); // prime AudioContext inside a user gesture (iOS/Safari requirement)
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, username);
        // Show dedicated verification-pending screen instead of leaving on auth form
        setStep('verification');
      } else {
        await signIn(email, password);
        const user = await getUser();
        const p = await getProfile();
        setProfile(p ?? { username: user?.email, id: user?.id });
        await syncProfileStreak();
        setStep('profile');
        playSound('success');
        toast('Logged in successfully.', 'success');
      }
    } catch (err: unknown) {
      playSound('error');
      toast((err as Error).message ?? 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    unlockAudio();
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      playSound('error');
      toast((err as Error).message ?? 'Could not start Google sign-in.', 'error');
      setGoogleLoading(false);
    }
  }

  async function handleLinkGoogle() {
    setLinkingGoogle(true);
    try {
      await linkGoogleAccount();
    } catch (err: unknown) {
      toast((err as Error).message ?? 'Could not link Google account.', 'error');
      setLinkingGoogle(false);
    }
  }

  async function handleLogout() {
    // Clear user-specific local data so the dashboard timer resets to 0
    USER_LS_KEYS.forEach((k) => localStorage.removeItem(k));
    await signOut();
    setProfile(null);
    setStep('auth');
    router.push('/');
    toast('Logged out.', 'info');
  }

  async function handleMigrate() {
    setMigrating(true);
    try {
      const results = await migrateLocalToCloud();
      setMigrateResults(results);
      toast('Import complete!', 'success');
    } catch (err: unknown) {
      setMigrateResults([`Error: ${(err as Error).message}`]);
      toast('Import failed.', 'error');
    } finally {
      setMigrating(false);
    }
  }

  function copyFriendCode() {
    if (!profile) return;
    const streak = (() => {
      try {
        const s = localStorage.getItem('seedguard_streak_start');
        return s ? Math.max(0, Math.floor((Date.now() - new Date(s).getTime()) / 86_400_000)) : 0;
      } catch { return 0; }
    })();
    const code = btoa(JSON.stringify({
      id: profile.id,
      username: profile.username,
      streak,
      streakStart: localStorage.getItem('seedguard_streak_start') ?? new Date().toISOString(),
      shared: new Date().toISOString(),
    }));
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    playSound('click');
    toast('Friend code copied to clipboard!', 'success');
  }

  async function handleSaveUsername() {
    const trimmed = newUsername.trim();
    const err = validateUsername(trimmed);
    if (err) { setUsernameError(err); return; }

    const lastChanged = localStorage.getItem(USERNAME_LS_KEY);
    const daysLeft = daysUntilNextChange(lastChanged);
    if (daysLeft > 0) {
      setUsernameError(`You can change your username again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`);
      return;
    }

    setUsernameSaving(true);
    setUsernameError('');
    try {
      await updateProfile({ username: trimmed });
      localStorage.setItem(USERNAME_LS_KEY, new Date().toISOString());
      // Re-fetch from DB to confirm the write landed — don't rely on local state patch
      const refreshed = await getProfile();
      setProfile(refreshed ?? { ...profile, username: trimmed });
      setEditingUsername(false);
      playSound('success');
      toast('Username updated!', 'success');
    } catch (err: unknown) {
      setUsernameError((err as Error).message ?? 'Failed to save username.');
      playSound('error');
    } finally {
      setUsernameSaving(false);
    }
  }

  async function saveAvatar(dataUri: string) {
    setAvatarSaving(true);
    try {
      await updateProfile({ avatar_url: dataUri });
      const refreshed = await getProfile();
      setProfile(refreshed ?? { ...profile, avatar_url: dataUri });
      setShowAvatarPicker(false);
      playSound('success');
      toast('Profile picture updated!', 'success');
    } catch (err: unknown) {
      toast((err as Error).message ?? 'Failed to save profile picture.', 'error');
      playSound('error');
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarSaving(true);
    try {
      const dataUri = await resizeImageToDataUri(file);
      await saveAvatar(dataUri);
    } catch (err: unknown) {
      toast((err as Error).message ?? 'Failed to process that image.', 'error');
      playSound('error');
      setAvatarSaving(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return <AccountSkeleton />;
  }

  // ── Verification pending ───────────────────────────────────────────────────
  if (step === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 page-entry text-center">
          <Shield
            className="w-14 h-14 mx-auto text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.8)]"
            aria-hidden
          />
          <h1 className="text-4xl font-display font-extrabold neon-text-pink text-primary tracking-widest uppercase italic">
            SeedGuard
          </h1>
          <div className="rounded-2xl border border-secondary/30 glass-effect p-8 space-y-5 animate-scale-in neon-box-cyan">
            <Mail className="w-12 h-12 mx-auto text-secondary neon-text-cyan" aria-hidden />
            <p className="text-xl font-bold text-secondary neon-text-cyan">Check Your Email</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-bold text-foreground">{email}</span>.
              Click the link to verify your account, then log in here.
            </p>
            <button
              onClick={() => { setStep('auth'); setMode('login'); }}
              className="w-full bg-primary/25 hover:bg-primary/35 border border-primary/50 text-primary font-extrabold py-3 rounded-xl uppercase tracking-widest transition-all neon-box-pink text-sm"
            >
              Back to Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Profile view ───────────────────────────────────────────────────────────
  if (step === 'profile' && profile) {
    const displayName = (profile.username as string | null) ?? 'Anonymous';
    const lastChanged = typeof window !== 'undefined' ? localStorage.getItem(USERNAME_LS_KEY) : null;
    const daysLeft = daysUntilNextChange(lastChanged);
    const canEdit = daysLeft === 0;

    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl space-y-8 page-entry">
        {/* Banner */}
        <ImageBanner src={ART.heroCity}>
          <div className="p-6 md:p-8 flex items-center gap-5">
            <button
              onClick={() => setShowAvatarPicker((v) => !v)}
              className="relative w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center flex-shrink-0 overflow-hidden hover:border-primary/80 transition-colors"
              aria-label="Change profile picture"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url as string} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" aria-hidden />
              )}
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border border-background flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" aria-hidden />
              </span>
            </button>
            <div className="flex-1 min-w-0">
              {editingUsername ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUsername(); if (e.key === 'Escape') setEditingUsername(false); }}
                      maxLength={20}
                      autoFocus
                      className="flex-1 bg-background/60 border border-primary/50 rounded-lg px-3 py-1.5 text-sm text-primary font-bold focus:outline-none focus:ring-1 focus:ring-primary/60 min-w-0"
                      placeholder="New username"
                      aria-label="New username"
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={usernameSaving}
                      className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/50 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/30 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {usernameSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingUsername(false); setUsernameError(''); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-display font-extrabold neon-text-pink text-primary uppercase tracking-wider truncate">
                    {displayName}
                  </h1>
                  {canEdit ? (
                    <button
                      onClick={() => { setNewUsername(displayName === 'Anonymous' ? '' : displayName); setUsernameError(''); setEditingUsername(true); }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      aria-label="Edit username"
                      title="Edit username"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                      (edit in {daysLeft}d)
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">Cloud account active ✅</p>
              {!editingUsername && canEdit && (
                <p className="text-xs text-muted-foreground/50 mt-0.5">Username can be changed once every 7 days</p>
              )}
            </div>
          </div>
        </ImageBanner>

        {showAvatarPicker && (
          <div className="rounded-2xl border border-primary/20 glass-effect p-6 space-y-4 animate-scale-in">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Profile Picture</p>
            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/50 bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider hover:bg-primary/20 transition-all cursor-pointer">
              {avatarSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Camera className="w-4 h-4" aria-hidden />}
              Upload Photo
              <input type="file" accept="image/*" onChange={handleAvatarFile} disabled={avatarSaving} className="hidden" />
            </label>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Or pick a default that matches the SeedGuard look:</p>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => saveAvatar(preset.dataUri)}
                    disabled={avatarSaving}
                    title={preset.label}
                    aria-label={preset.label}
                    className="aspect-square rounded-full overflow-hidden border-2 border-muted/30 hover:border-primary/60 transition-all disabled:opacity-50"
                  >
                    <img src={preset.dataUri} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Earned badges */}
        <EarnedBadges />

        {/* Actions */}
        <div className="rounded-2xl border border-primary/20 glass-effect p-8 space-y-4 animate-scale-in">
          <button
            onClick={copyFriendCode}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-secondary/50 text-secondary bg-secondary/10 hover:bg-secondary/20 font-bold uppercase tracking-wider neon-hover"
          >
            {copied ? <Check className="w-5 h-5" aria-hidden /> : <Copy className="w-5 h-5" aria-hidden />}
            {copied ? 'Copied!' : 'Copy Friend Code'}
          </button>

          <Link
            href="/streaks"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gold/50 text-gold bg-gold/10 hover:bg-gold/20 font-bold uppercase tracking-wider neon-hover"
          >
            <ExternalLink className="w-5 h-5" aria-hidden />
            View Leaderboard
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20 font-bold uppercase tracking-wider neon-hover"
          >
            <LogOut className="w-5 h-5" aria-hidden />
            Log Out
          </button>
        </div>

        {/* Connected accounts */}
        <div className="rounded-2xl border border-secondary/20 glass-effect p-8 space-y-4 animate-scale-in">
          <h2 className="text-base font-bold uppercase tracking-wider text-secondary">Connected Accounts</h2>
          {linkedProviders.includes('google') ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-secondary" aria-hidden /> Google connected
            </p>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={linkingGoogle}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-secondary/50 text-secondary bg-secondary/10 hover:bg-secondary/20 font-bold uppercase tracking-wider neon-hover disabled:opacity-50"
            >
              {linkingGoogle ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
              Link Google Account
            </button>
          )}
        </div>

        {/* Migrate local data */}
        <div className="rounded-2xl border border-accent/20 glass-effect p-8 space-y-4 animate-scale-in">
          <h2 className="text-base font-bold uppercase tracking-wider text-accent">Import Local Data</h2>
          <p className="text-sm text-muted-foreground">
            Had SeedGuard before signing up? Pull your local streaks and history into the cloud.
          </p>
          {migrateResults.length > 0 ? (
            <div className="space-y-2">
              {migrateResults.map((r, i) => (
                <p key={i} className="bg-background/60 rounded-lg px-4 py-2 text-sm">{r}</p>
              ))}
            </div>
          ) : (
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-accent/50 text-accent bg-accent/10 hover:bg-accent/20 font-bold uppercase tracking-wider neon-hover disabled:opacity-50"
            >
              {migrating ? 'Importing…' : '⬆️ Import My Local Data'}
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          To permanently delete your account, go to{' '}
          <Link href="/settings" className="text-destructive hover:underline font-semibold">
            Settings → Danger Zone
          </Link>.
        </p>
      </div>
    );
  }

  // ── Auth form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 page-entry">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Shield
            className="w-14 h-14 mx-auto text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.8)]"
            aria-hidden
          />
          <h1 className="text-4xl font-display font-extrabold neon-text-pink text-primary tracking-widest uppercase italic">
            SeedGuard
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to sync your streak across all devices.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-primary/25 glass-effect p-8 space-y-6 animate-scale-in">
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-muted/10 hover:bg-muted/20 disabled:opacity-50 border border-muted/30 text-foreground font-bold py-3 rounded-xl transition-all"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-muted/20" />
              <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-muted/20" />
            </div>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 bg-muted/20 rounded-xl p-1" role="tablist" aria-label="Auth mode">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                  ${mode === m
                    ? 'bg-primary/30 text-primary border border-primary/40 neon-text-pink'
                    : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-xs text-muted-foreground uppercase tracking-wider">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full bg-background/50 border border-muted/40 rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                  placeholder="YourUsername"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-background/50 border border-muted/40 rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs text-muted-foreground uppercase tracking-wider">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-background/50 border border-muted/40 rounded-xl px-4 py-3 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary/25 hover:bg-primary/35 disabled:opacity-40 border border-primary/50 text-primary font-extrabold py-3.5 rounded-xl uppercase tracking-widest transition-all neon-box-pink"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
