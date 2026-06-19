'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowRight, Check, Lock, Cloud } from 'lucide-react';

const MODES = [
  {
    id: 'monk',
    name: 'Monk Mode',
    emoji: '🔱',
    desc: 'No PMO + no social media + daily exercise. Full discipline.',
    color: 'border-gold/60 bg-gold/10 text-gold',
  },
  {
    id: 'hard',
    name: 'Hard Mode',
    emoji: '⚔️',
    desc: 'No pornography, no masturbation, no orgasm.',
    color: 'border-primary/60 bg-primary/10 text-primary',
  },
  {
    id: 'easy',
    name: 'Easy Mode',
    emoji: '🛡️',
    desc: 'No pornography. Masturbation occasionally allowed.',
    color: 'border-secondary/60 bg-secondary/10 text-secondary',
  },
] as const;

type Mode = (typeof MODES)[number]['id'];

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>('hard');

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else if (step === TOTAL_STEPS - 1) {
      // Step 3: show the local-vs-cloud fork (step 4)
      setStep(TOTAL_STEPS);
    }
  };

  const startLocally = () => {
    try {
      localStorage.setItem('seedguard_user', JSON.stringify({ name, mode }));
      localStorage.setItem('seedguard_onboarded', '1');
      localStorage.setItem('seedguard_anon_mode', '1');
    } catch {}
    router.push('/dashboard');
  };

  const startWithAccount = () => {
    try {
      localStorage.setItem('seedguard_user', JSON.stringify({ name, mode }));
      localStorage.setItem('seedguard_onboarded', '1');
    } catch {}
    router.push('/account');
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('seedguard_onboarded', '1');
    } catch {}
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <Shield className="w-16 h-16 text-primary drop-shadow-[0_0_16px_rgba(255,0,255,0.8)] relative" />
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-primary w-10' : 'bg-muted w-5'
              }`}
            />
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight neon-text-cyan text-secondary uppercase italic">
                  Welcome to SeedGuard
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Your private discipline companion. Track every day, compete with friends, and reclaim your freedom.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  'Live streak timer, counts every second',
                  'Leaderboard to compete with friends',
                  'Cloud sync across all your devices',
                  'Badges & milestones to celebrate progress',
                  'Emergency support when urges hit',
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" aria-hidden />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Mode */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-primary neon-text-pink">
                  Choose your mode
                </h2>
                <p className="text-muted-foreground text-sm">Pick the commitment level that fits your goal.</p>
              </div>

              <div className="space-y-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      mode === m.id ? m.color : 'border-muted/30 bg-muted/10 text-muted-foreground hover:border-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <p className="font-bold text-base">{m.name}</p>
                        <p className="text-xs mt-0.5 opacity-80">{m.desc}</p>
                      </div>
                      {mode === m.id && (
                        <Check className="w-5 h-5 ml-auto flex-shrink-0" aria-hidden />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3: Ready summary */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="space-y-4">
                <div className="text-6xl">🎯</div>
                <h2 className="text-2xl font-bold uppercase tracking-wider neon-text-cyan text-secondary">
                  You&apos;re all set!
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {name ? `${name}, your` : 'Your'} journey to freedom starts now.
                  {mode === 'monk' && ' Monk Mode: maximum discipline. 🔱'}
                  {mode === 'hard' && ' Hard Mode: the standard. ⚔️'}
                  {mode === 'easy' && ' Easy Mode: step by step. 🛡️'}
                </p>
              </div>
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-sm text-muted-foreground text-left space-y-1.5">
                <p><span className="font-semibold text-foreground">✅ Local-first:</span> Your streak is stored on your device.</p>
                <p><span className="font-semibold text-foreground">☁️ Optional sync:</span> Create an account to sync across devices.</p>
                <p><span className="font-semibold text-foreground">🔒 Private:</span> We never sell your data.</p>
              </div>
            </div>
          )}

          {/* Step 4: Local vs Cloud fork */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-primary neon-text-pink">
                  How do you want to track?
                </h2>
                <p className="text-muted-foreground text-sm">You can always switch later.</p>
              </div>

              <button
                onClick={startLocally}
                className="w-full text-left p-5 rounded-xl border-2 border-muted/40 bg-muted/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Lock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-foreground">Start Locally</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Track on this device only. No account needed. Sign in later to unlock cloud sync, leaderboards, and DMs.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={startWithAccount}
                className="w-full text-left p-5 rounded-xl border-2 border-secondary/40 bg-secondary/5 hover:border-secondary/70 hover:bg-secondary/10 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/25 transition-colors">
                    <Cloud className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-base text-secondary">Create Account</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Sync across all devices, join the leaderboard, earn public badges, and message friends.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Nav buttons: hidden on step 4 (has its own fork buttons) */}
        {step < 4 && (
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 rounded-lg border border-muted/50 text-muted-foreground hover:text-foreground hover:border-muted/70 transition-all font-medium uppercase tracking-wider"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-all font-bold uppercase tracking-wider"
            >
              Next
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        )}

        {step < 4 && (
          <button
            onClick={handleSkip}
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now →
          </button>
        )}
      </div>
    </div>
  );
}
