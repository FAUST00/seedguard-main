-- ============================================================================
-- SeedGuard — two-way accountability partners
-- ============================================================================
-- One row per user storing the friend they've designated as their
-- accountability partner. "Mutual" is simply both users pointing at each other.
-- Check-in data already lives in profiles.gamification_json (world-readable),
-- so partners can see each other's check-in streak without extra tables.
--
-- Additive + idempotent. Safe to run multiple times.
--
-- HOW TO RUN:  Supabase project -> SQL Editor -> paste -> Run
-- ============================================================================

create table if not exists public.accountability (
  user_id    uuid primary key references auth.users on delete cascade,
  partner_id uuid references auth.users on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.accountability enable row level security;

-- Read your own row OR a row where someone designated you (to detect mutual).
drop policy if exists "accountability read own or as-partner" on public.accountability;
create policy "accountability read own or as-partner"
  on public.accountability for select
  using (auth.uid() = user_id or auth.uid() = partner_id);

-- You may only create/change/delete your OWN designation.
drop policy if exists "accountability write own" on public.accountability;
create policy "accountability write own"
  on public.accountability for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
