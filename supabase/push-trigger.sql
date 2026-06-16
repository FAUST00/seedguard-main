-- ============================================================================
-- SeedGuard — fire Web Push on each new direct message / nudge
-- ============================================================================
-- Calls the `send-push` Edge Function (via pg_net) whenever a row is inserted
-- into `messages`. Run this AFTER deploying the function (see PUSH-SETUP.md).
--
-- Idempotent. Safe to run multiple times.
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.notify_push_on_message()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url     := 'https://earfjshpbwcnpqinrrvl.functions.supabase.co/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$;

drop trigger if exists trg_push_on_message on public.messages;
create trigger trg_push_on_message
  after insert on public.messages
  for each row execute function public.notify_push_on_message();
