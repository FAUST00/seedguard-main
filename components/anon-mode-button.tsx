'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AnonModeButton() {
  const router = useRouter();

  const handleAnon = () => {
    try {
      localStorage.setItem('seedguard_anon_mode', '1');
      localStorage.setItem('seedguard_onboarded', '1');
    } catch {}
    router.push('/dashboard');
  };

  return (
    <button
      onClick={handleAnon}
      className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-xl border border-muted/40 bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/25 hover:border-muted/60 text-sm font-medium transition-all"
    >
      <Lock className="w-4 h-4" aria-hidden />
      Track Anonymously — No Account Needed
    </button>
  );
}
