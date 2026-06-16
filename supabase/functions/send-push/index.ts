// SeedGuard — Web Push sender (Supabase Edge Function, Deno).
//
// Invoked by a DB trigger (see supabase/push-trigger.sql) on each new
// `messages` row, or directly with { recipient, title, body, url }. Reads the
// recipient's push_subscriptions and delivers a Web Push notification.
//
// Secrets it reads from the Edge Function environment (set these in the
// Supabase dashboard — they are NEVER in this file):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-provided by Supabase)

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@seedguard.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json().catch(() => ({}));
    const rec = payload.record ?? payload; // DB webhook wraps the row in `record`
    const recipient = rec.recipient ?? rec.user_id;
    if (!recipient) return new Response('no recipient', { status: 400 });

    const title = payload.title ?? 'SeedGuard';
    const body = (rec.content ?? payload.body ?? 'You have a new update.').toString().slice(0, 140);
    const url = payload.url ?? '/seedguard-main/social';

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, subscription')
      .eq('user_id', recipient);

    await Promise.all((subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(JSON.parse(s.subscription), JSON.stringify({ title, body, url }));
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      }
    }));

    return new Response(JSON.stringify({ sent: subs?.length ?? 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response('error: ' + ((err as Error)?.message ?? err), { status: 500 });
  }
});
