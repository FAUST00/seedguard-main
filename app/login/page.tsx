'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/sync';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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
