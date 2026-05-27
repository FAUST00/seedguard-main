'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Check } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    name: '',
    goal: 'recovery',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save and redirect
      localStorage.setItem('seedguard_user', JSON.stringify(preferences));
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <Shield className="w-16 h-16 text-primary drop-shadow-[0_0_16px_rgba(255,0,255,0.8)] relative" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary w-8' : 'bg-muted w-4'
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight neon-text-cyan text-secondary uppercase italic">
                  Welcome to SeedGuard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your personal recovery companion designed to help you build lasting freedom and discipline.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Track daily progress with precision',
                  'Build unbreakable streaks',
                  'Celebrate every victory',
                  'Learn from setbacks',
                  'Reclaim your freedom',
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm animate-slide-in-from-left"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Your Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-primary neon-text-pink">
                  Tell us about you
                </h2>
                <p className="text-muted-foreground">Optional - helps personalize your experience</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your name (optional)</label>
                  <input
                    type="text"
                    value={preferences.name}
                    onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your primary goal</label>
                  <select
                    value={preferences.goal}
                    onChange={(e) => setPreferences({ ...preferences, goal: e.target.value })}
                    className="w-full rounded-lg border border-muted/30 bg-background/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="recovery">Complete Recovery</option>
                    <option value="moderation">Healthy Moderation</option>
                    <option value="reduction">Gradual Reduction</option>
                    <option value="support">Support Others</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ready to Go */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="space-y-4">
                <div className="text-5xl">🎯</div>
                <h2 className="text-2xl font-bold uppercase tracking-wider neon-text-cyan text-secondary">
                  You&apos;re all set!
                </h2>
                <p className="text-muted-foreground">
                  Your journey to freedom starts now. We&apos;re here to support every step.
                </p>
              </div>
              <div className="space-y-2 pt-4 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">All your data</span> is stored locally. We never collect personal information.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-all font-medium uppercase tracking-wider"
          >
            {step === 3 ? 'Start Now' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip Link */}
        {step < 3 && (
          <Link
            href="/dashboard"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now →
          </Link>
        )}
      </div>
    </div>
  );
}
