-- ============================================================================
-- SeedGuard — gamification sync
-- ============================================================================
-- Adds one additive column to the existing `profiles` table to store the
-- gamification blob (XP, partner, partner check-ins, weekly-challenge claims).
--
-- Safe to run multiple times. Until this runs, the app falls back to
-- localStorage automatically — nothing breaks.
--
-- HOW TO RUN:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this file and click "Run"
-- ============================================================================

alter table public.profiles
  add column if not exists gamification_json text;

-- The existing row-level-security policies on `profiles` already let a user
-- read/write their own row (id = auth.uid()), so no new policy is required.
-- If your project doesn't yet have those policies, uncomment below:
--
-- alter table public.profiles enable row level security;
--
-- create policy "Users manage own profile"
--   on public.profiles for all
--   using (auth.uid() = id)
--   with check (auth.uid() = id);
