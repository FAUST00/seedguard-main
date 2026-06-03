'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Copy, Check, LogOut, Edit2, Ghost } from 'lucide-react';

interface Account {
  id: string;
  username: string;
  isAnonymous: boolean;
  createdAt: string;
  color: string;
}

const COLORS = [
  '#ff00ff', // magenta
  '#00ffff', // cyan
  '#7c3aed', // violet
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
];

function randomColor() {
  if (typeof window === 'undefined') return null;
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getStreakDays(): number {
  try {
    const start = (typeof window!=='undefined'?localStorage:null)?.getItem('seedguard_streak_start');
    if (!start) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 86400000));
  } catch {
    return 0;
  }
}

function buildFriendCode(account: Account): string {
  const payload = {
    id: account.id,
    username: account.isAnonymous ? 'Anonymous' : account.username,
    isAnonymous: account.isAnonymous,
    streak: getStreakDays(),
    streakStart: (typeof window!=='undefined'?localStorage:null)?.getItem('seedguard_streak_start') || new Date().toISOString(),
    shared: new Date().toISOString(),
  };
  return btoa(JSON.stringify(payload));
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState<'loading' | 'create' | 'profile'>('loading');

  // Create form state
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Profile state
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    const saved = (typeof window!=='undefined'?localStorage:null)?.getItem('seedguard_account');
    if (saved) {
      const acc: Account = JSON.parse(saved);
      setAccount(acc);
      setStep('profile');
      setFriendCode(buildFriendCode(acc));
    } else {
      setStep('create');
    }
    try {
      const f = JSON.parse((typeof window!=='undefined'?localStorage:null)?.getItem('seedguard_friends') || '[]');
      setFriendsCount(Array.isArray(f) ? f.length : 0);
    } catch {}
  }, []);

  const refreshCode = () => {
    if (account) setFriendCode(buildFriendCode(account));
  };

  const handleCreate = () => {
    if (!isAnonymous) {
      const trimmed = username.trim();
      if (!trimmed) {
        setUsernameError('Enter a username or choose Anonymous.');
        return;
      }
      if (trimmed.length < 2 || trimmed.length > 20) {
        setUsernameError('Username must be 2–20 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_\-. ]+$/.test(trimmed)) {
        setUsernameError('Only letters, numbers, spaces, _ - and . allowed.');
        return;
      }
    }

    const newAccount: Account = {
      id: generateId(),
      username: isAnonymous ? `Anon-${generateId().slice(0, 6).toUpperCase()}` : username.trim(),
      isAnonymous,
      createdAt: new Date().toISOString(),
      color: randomColor(),
    };

    localStorage.setItem('seedguard_account', JSON.stringify(newAccount));
    // Ensure streak start is set
    if (!(typeof window!=='undefined'?localStorage:null)?.getItem('seedguard_streak_start')) {
      localStorage.setItem('seedguard_streak_start', new Date().toISOString());
    }

    setAccount(newAccount);
    setFriendCode(buildFriendCode(newAccount));
    setStep('profile');
  };

  const handleSaveEdit = () => {
    if (!account) return;
    const trimmed = editName.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 20) return;
    const updated = { ...account, username: trimmed, isAnonymous: false };
    localStorage.setItem('seedguard_account', JSON.stringify(updated));
    setAccount(updated);
    setFriendCode(buildFriendCode(updated));
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(friendCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteAccount = () => {
    if (!confirm('Delete your account? Your streak data stays, but your friend code and social features will reset.')) return;
    localStorage.removeItem('seedguard_account');
    localStorage.removeItem('seedguard_friends');
    setAccount(null);
    setStep('create');
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Shield className="w-8 h-8 text-primary animate-bounce-subtle neon-text-pink" />
      </div>
    );
  }

  // ── CREATE ACCOUNT ──
  if (step === 'create') {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-lg page-entry">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">
            Account
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Create an account to share your streak and compete with friends.
          </p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary neon-text-pink">
            Create Your Profile
          </h2>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  setUsernameError('');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </div>
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-medium">Stay Anonymous</span>
              <span className="text-xs text-muted-foreground">(random ID, no username)</span>
            </div>
          </label>

          {/* Username input */}
          {!isAnonymous && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. StreetRunner, FreedomSeeker"
                maxLength={20}
                className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {usernameError && (
                <p className="text-xs text-destructive">{usernameError}</p>
              )}
              <p className="text-xs text-muted-foreground">{username.trim().length}/20 characters</p>
            </div>
          )}

          {isAnonymous && (
            <div className="rounded-lg border border-muted/20 bg-muted/10 px-4 py-3 text-sm text-muted-foreground space-y-1">
              <p>Your streak will be shared with a random anonymous ID.</p>
              <p>You can still add friends and appear on leaderboards.</p>
            </div>
          )}

          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-all font-bold uppercase tracking-wider neon-text-pink"
          >
            <User className="w-5 h-5" />
            {isAnonymous ? 'Create Anonymous Profile' : 'Create Account'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Everything is stored locally on your device. No servers, no logins, no passwords.
          </p>
        </div>
      </div>
    );
  }

  // ── PROFILE VIEW ──
  if (!account) return null;

  const streakDays = getStreakDays();
  const memberDays = Math.floor(
    (Date.now() - new Date(account.createdAt).getTime()) / 86400000
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-lg space-y-8 page-entry">
      <div>
        <h1 className="text-4xl font-extrabold tracking-widest uppercase italic neon-text-cyan text-secondary">
          Account
        </h1>
        <p className="text-muted-foreground text-lg mt-2">Your profile and friend code.</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm p-8 space-y-6 animate-scale-in">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl flex-shrink-0 border-2"
            style={{
              backgroundColor: `${account.color}20`,
              borderColor: `${account.color}50`,
              color: account.color,
            }}
          >
            {account.isAnonymous ? '?' : account.username.charAt(0).toUpperCase()}
          </div>

          {/* Name + meta */}
          {editing ? (
            <div className="flex-1 flex gap-2">
              <input
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                maxLength={20}
                className="flex-1 rounded-lg border border-primary/50 bg-background/50 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-medium text-sm hover:bg-primary/30 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg bg-muted/30 text-muted-foreground border border-muted/40 text-sm hover:bg-muted/50 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl truncate">{account.username}</span>
                {account.isAnonymous && (
                  <Ghost className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <button
                  onClick={() => {
                    setEditName(account.username);
                    setEditing(true);
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  title="Edit username"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member for {memberDays === 0 ? 'less than a day' : `${memberDays} day${memberDays !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-primary/15 bg-background/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-primary neon-text-pink">{streakDays}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Current Streak</p>
          </div>
          <div className="rounded-lg border border-secondary/15 bg-background/60 p-4 text-center">
            <p className="text-3xl font-extrabold text-secondary neon-text-cyan">
              {friendsCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Friends</p>
          </div>
        </div>
      </div>

      {/* Friend Code */}
      <div className="rounded-xl border border-secondary/20 bg-background/50 backdrop-blur-sm p-8 space-y-4 animate-scale-in [animation-delay:80ms]">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-secondary neon-text-cyan mb-1">
            Your Friend Code
          </h2>
          <p className="text-sm text-muted-foreground">
            Share this code with friends so they can add you and see your streak.
            Generate a fresh code anytime — it encodes your current streak.
          </p>
        </div>

        <div className="rounded-lg border border-secondary/20 bg-background/80 p-3 font-mono text-xs text-muted-foreground break-all select-all">
          {friendCode}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-secondary/50 text-secondary bg-secondary/10 hover:bg-secondary/20 transition-all font-medium uppercase tracking-wider text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={refreshCode}
            className="px-4 py-3 rounded-lg border border-muted/40 text-muted-foreground hover:text-foreground hover:border-muted/60 transition-all text-sm font-medium uppercase tracking-wider"
          >
            Refresh
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Generate a new code after each day clean to keep your friends&apos; view of your streak accurate.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/20 bg-background/50 backdrop-blur-sm p-8 space-y-4 animate-scale-in [animation-delay:160ms]">
        <h2 className="text-lg font-bold uppercase tracking-wider text-destructive">
          Danger Zone
        </h2>
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all font-medium uppercase tracking-wider text-sm"
        >
          <LogOut className="w-4 h-4" />
          Delete Account
        </button>
        <p className="text-xs text-muted-foreground">
          Your streak data (timer, history) is kept. Only your social profile is removed.
        </p>
      </div>
    </div>
  );
}
