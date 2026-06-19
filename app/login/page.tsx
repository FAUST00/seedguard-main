'use client';

import { useState } from 'react';
import { signIn, signUp, signInWithGoogle, signInWithDiscord } from '@/lib/sync';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in');
      setGoogleLoading(false);
    }
  }

  async function handleDiscord() {
    setDiscordLoading(true);
    setError('');
    try {
      await signInWithDiscord();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start Discord sign-in');
      setDiscordLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        await signUp(email, password, username);
        setMessage('Account created! Check your email to confirm, then log in.');
      } else {
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-extrabold tracking-widest uppercase italic neon-text-pink text-primary">
            SEEDGUARD
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            Your data. Everywhere. Always.
          </p>
        </div>

        {/* Card */}
        <div className="glass-effect border border-primary/30 rounded-2xl p-8 shadow-2xl">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-muted/10 hover:bg-muted/20 disabled:opacity-50 border border-muted/30 text-foreground font-bold py-3 rounded-xl transition-all mb-5"
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

          <button
            type="button"
            onClick={handleDiscord}
            disabled={discordLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#5865F2]/15 hover:bg-[#5865F2]/25 disabled:opacity-50 border border-[#5865F2]/40 text-foreground font-bold py-3 rounded-xl transition-all mb-5"
          >
            {discordLoading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2" aria-hidden>
                <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.245.198.372.292a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.876 19.876 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            )}
            Continue with Discord
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-muted/20" />
            <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-muted/20" />
          </div>

          {/* Mode toggle */}
          <div
            className="flex mb-6 bg-muted/20 rounded-xl p-1 gap-1"
            role="tablist"
            aria-label="Authentication mode"
          >
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                  ${mode === m
                    ? 'bg-primary/20 text-primary border border-primary/40 neon-box-pink'
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="YourUsername"
                  className="w-full bg-muted/10 border border-muted/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-muted/10 border border-muted/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wider font-semibold"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full bg-muted/10 border border-muted/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3 text-destructive text-sm"
              >
                {error}
              </div>
            )}
            {message && (
              <div
                role="status"
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary/20 hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/40 text-primary font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 neon-box-pink"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
