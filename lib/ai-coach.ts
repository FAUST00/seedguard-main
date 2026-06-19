/**
 * Recovery Coach client — calls a Supabase Edge Function so the AI provider
 * API key never lives in the browser bundle (same security model as the
 * push-notification VAPID setup). The endpoint is injected at build time via
 * NEXT_PUBLIC_AI_COACH_URL, same pattern as NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 *
 * Until that env var is set and the `ai-coach` Edge Function is deployed
 * (see supabase/functions/ai-coach/README.md), askCoach() throws
 * 'not_configured' and the UI falls back to static crisis tips.
 */

export type CoachMode = 'normal' | 'crisis';

export interface CoachMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ENDPOINT = process.env.NEXT_PUBLIC_AI_COACH_URL || '';

export function isCoachConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export async function askCoach(messages: CoachMessage[], mode: CoachMode): Promise<string> {
  if (!ENDPOINT) throw new Error('not_configured');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });
  if (!res.ok) throw new Error('request_failed');
  const data = await res.json() as { reply?: string };
  if (!data.reply) throw new Error('empty_reply');
  return data.reply;
}
