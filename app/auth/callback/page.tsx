'use client';

/**
 * Email verification callback — handles all Supabase auth redirect formats:
 *   • Hash:   #access_token=...&type=signup   (implicit flow)
 *   • Query:  ?code=...                        (PKCE flow)
 *   • Query:  ?token_hash=...&type=email       (OTP flow)
 *   • Error:  ?error=...&error_description=...
 *
 * Required Supabase config:
 *   Dashboard → Authentication → URL Configuration → Redirect URLs:
 *   https://faust00.github.io/seedguard-main/auth/callback/
 *
 * The confirmation email link itself is pointed here explicitly via
 * emailRedirectTo in lib/sync.ts signUp() — without that it defaults to
 * the Site URL (the homepage) and never reaches this page at all.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Status = 'processing' | 'success' | 'error';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus]   = useState<Status>('processing');
  const [detail, setDetail]   = useState('Verifying your email…');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let cancelled = false;

    function startCountdown() {
      let n = 3;
      setCountdown(n);
      const timer = setInterval(() => {
        n--;
        setCountdown(n);
        if (n <= 0) { clearInterval(timer); router.push('/dashboard'); }
      }, 1000);
    }

    function succeed() {
      if (cancelled) return;
      setStatus('success');
      setDetail('Your email is confirmed. Welcome to SeedGuard!');
      startCountdown();
    }

    async function run() {
      try {
        const searchParams = new URLSearchParams(window.location.search);

        const errParam = searchParams.get('error');
        if (errParam) {
          const desc = searchParams.get('error_description') ?? errParam;
          throw new Error(decodeURIComponent(desc).replace(/\+/g, ' '));
        }

        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          succeed();
          return;
        }

        const tokenHash = searchParams.get('token_hash');
        const otpType   = searchParams.get('type') as
          | 'email' | 'recovery' | 'invite' | null;
        if (tokenHash && otpType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });
          if (error) throw error;
          succeed();
          return;
        }

        if (window.location.hash.includes('access_token')) {
          await new Promise((r) => setTimeout(r, 350));
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) { succeed(); return; }
        }

        throw new Error(
          'No verification token found. Please click the link in your confirmation email again.',
        );
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus('error');
          setDetail((err as Error).message ?? 'Verification failed. Please try again.');
        }
      }
    }

    run();
    return () => { cancelled = true; };
    // router from useRouter() is stable; listed to satisfy exhaustive-deps.
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 page-entry text-center">
        <Shield className="w-14 h-14 mx-auto text-primary drop-shadow-[0_0_14px_hsl(var(--primary)/0.8)]" aria-hidden />
        <h1 className="text-3xl font-display font-extrabold neon-text-pink text-primary tracking-widest uppercase italic">SeedGuard</h1>
        <div className="rounded-2xl border border-primary/25 glass-effect p-8 space-y-5 animate-scale-in">
          {status === 'processing' && (<><Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" aria-label="Processing" /><p className="text-muted-foreground text-sm">{detail}</p></>)}
          {status === 'success' && (<><CheckCircle2 className="w-14 h-14 mx-auto text-secondary drop-shadow-[0_0_12px_rgba(0,255,255,0.8)]" aria-label="Verified" /><p className="text-xl font-bold text-secondary neon-text-cyan">Email Verified!</p><p className="text-sm text-muted-foreground">{detail}</p><p className="text-xs text-muted-foreground/60 tabular-nums">Redirecting in {countdown}&#8230;</p></>)}
          {status === 'error' && (<><AlertCircle className="w-12 h-12 mx-auto text-destructive" aria-label="Error" /><p className="text-lg font-bold text-destructive">Verification Failed</p><p className="text-sm text-muted-foreground leading-relaxed">{detail}</p><a href="/account" className="inline-block mt-2 px-6 py-2.5 rounded-xl border border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 font-bold uppercase tracking-wider text-sm transition-all neon-box-pink">Go to Account →</a></>)}
        </div>
      </div>
    </div>
  );
}
