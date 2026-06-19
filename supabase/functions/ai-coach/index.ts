// SeedGuard — Recovery Coach (Supabase Edge Function, Deno).
//
// Invoked directly from the client (lib/ai-coach.ts) with
// { messages: {role, content}[], mode: 'normal' | 'crisis' }.
// Proxies to an LLM provider so the API key never reaches the browser
// bundle (same security model as the push-notification VAPID setup).
//
// Secrets it reads from the Edge Function environment (set these in the
// Supabase dashboard — they are NEVER in this file or the client):
//   AI_PROVIDER        'openai' | 'anthropic'  (defaults to 'openai')
//   AI_API_KEY         provider API key
//   AI_MODEL           optional override, e.g. 'gpt-4o-mini' or 'claude-haiku-4-5'

const CRISIS_SYSTEM_PROMPT =
  'You are SeedGuard\'s Recovery Coach in crisis mode. The user is in the middle of ' +
  'an urge right now. Be brief, warm, and direct. Prioritize immediate de-escalation: ' +
  'breathing, leaving the environment, delaying the decision, reaching out to someone. ' +
  'Never be clinical or preachy. Keep replies under 80 words.';

const NORMAL_SYSTEM_PROMPT =
  'You are SeedGuard\'s Recovery Coach, supporting someone recovering from ' +
  'pornography/PMO addiction. Be encouraging, practical, and non-judgmental. ' +
  'Offer habit recommendations, reflection prompts, and recovery education. ' +
  'Keep replies under 120 words unless asked for more detail.';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: ChatMessage[], system: string, apiKey: string, model: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`openai error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(messages: ChatMessage[], system: string, apiKey: string, model: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system,
      max_tokens: 300,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`anthropic error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

Deno.serve(async (req) => {
  try {
    const { messages, mode } = await req.json() as { messages: ChatMessage[]; mode?: 'normal' | 'crisis' };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('messages required', { status: 400 });
    }

    const provider = Deno.env.get('AI_PROVIDER') ?? 'openai';
    const apiKey = Deno.env.get('AI_API_KEY');
    if (!apiKey) return new Response('AI_API_KEY not configured', { status: 503 });

    const system = mode === 'crisis' ? CRISIS_SYSTEM_PROMPT : NORMAL_SYSTEM_PROMPT;
    const model = Deno.env.get('AI_MODEL') ?? (provider === 'anthropic' ? 'claude-haiku-4-5' : 'gpt-4o-mini');

    const reply = provider === 'anthropic'
      ? await callAnthropic(messages, system, apiKey, model)
      : await callOpenAI(messages, system, apiKey, model);

    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response('error: ' + ((err as Error)?.message ?? err), { status: 500 });
  }
});
