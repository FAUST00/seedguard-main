-- ============================================================================
-- SeedGuard — XP / level leaderboard
-- ============================================================================
-- Adds an `xp` column to `profiles` so levels can be ranked server-side.
-- Additive and idempotent; safe to run multiple times. Until this runs, the
-- Levels leaderboard simply shows everyone at 0 XP.
--
-- HOW TO RUN:
--   Supabase project -> SQL Editor -> paste -> Run
-- ============================================================================

alter table public.profiles
  add column if not exists xp integer not null default 0;

-- Helps the ORDER BY xp DESC leaderboard query.
create index if not exists profiles_xp_idx on public.profiles (xp desc);
