-- ============================================================================
-- SeedGuard — Web Push subscriptions
-- ============================================================================
-- Stores browser push subscriptions so a future server sender (Supabase Edge
-- Function + VAPID keys) can deliver notifications when the app is CLOSED.
--
-- Foreground notifications (app open) already work without this table — they
-- are fired client-side from realtime events. This table is only needed for
-- closed-app Web Push.
--
-- Additive + idempotent. Safe to run multiple times.
-- HOW TO RUN:  Supabase project -> SQL Editor -> paste -> Run
-- ============================================================================

create table if not exists public.push_subscriptions (
  endpoint     text primary key,
  user_id      uuid not null references auth.users on delete cascade,
  subscription text not null,
  updated_at   timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push manage own" on public.push_subscriptions;
create policy "push manage own"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Remaining work to enable CLOSED-APP push (not automated) ────────────────
-- 1. Generate a VAPID keypair (e.g. `npx web-push generate-vapid-keys`).
-- 2. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in the build env (GitHub Actions) so the
--    client subscribes (lib/notifications.ts -> maybeSubscribePush).
-- 3. Deploy a Supabase Edge Function that, on a nudge/DM/friend-request, reads
--    push_subscriptions for the recipient and sends Web Push with the VAPID
--    PRIVATE key (kept as an Edge Function secret — never in the client).
