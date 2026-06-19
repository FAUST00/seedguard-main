'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { askCoach, isCoachConfigured, type CoachMessage, type CoachMode } from '@/lib/ai-coach';

const CRISIS_FALLBACK_TIPS = [
  'Breathe slowly. In for 4, hold for 7, out for 8. Repeat 3 times.',
  'Leave the room you are in right now, even just for a minute.',
  'Name one person you could text right now, and text them anything.',
  'Remember: the urge is loud, but it is not in charge. It will fade.',
];

interface Props {
  mode: CoachMode;
}

export function RecoveryCoachChat({ mode }: Props) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfigured(isCoachConfigured());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text } as CoachMessage];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const reply = await askCoach(next, mode);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground/70 text-center">
          Recovery Coach isn&apos;t connected yet. Here&apos;s what helps right now:
        </p>
        <div className="space-y-2">
          {CRISIS_FALLBACK_TIPS.map((tip, i) => (
            <div key={i} className="p-3 rounded-xl border border-muted/25 bg-muted/10 text-sm text-foreground">{tip}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground/60 text-center py-4">
            {mode === 'crisis' ? 'Tell me what is happening right now.' : 'Ask your recovery coach anything.'}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'text-sm rounded-xl px-3 py-2 max-w-[85%]',
              m.role === 'user' ? 'ml-auto bg-primary/15 text-foreground' : 'bg-muted/15 text-foreground',
            )}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-muted/30 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-secondary/50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-lg bg-secondary/20 border border-secondary/50 text-secondary disabled:opacity-50"
          aria-label="Send message"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
