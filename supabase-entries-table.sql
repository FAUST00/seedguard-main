-- ═══════════════════════════════════════════════════════════
-- SeedGuard — entries table
-- Run this in: Supabase → SQL Editor → paste → Run
-- ═══════════════════════════════════════════════════════════

create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  local_id   text not null,
  type       text not null check (type in ('victory', 'relapse')),
  note       text not null default '',
  date       text not null,
  created_at timestamptz default now()
);

-- Index for fast lookups by user
create index if not exists entries_user_id_idx on public.entries (user_id);
-- Index for fast delete by local_id
create index if not exists entries_local_id_idx on public.entries (user_id, local_id);

-- Row Level Security
alter table public.entries enable row level security;

create policy "Users can manage own entries"
  on public.entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
