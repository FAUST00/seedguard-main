-- SeedGuard — Trigger Analytics columns on the existing `entries` table.
-- Run this once in the Supabase SQL editor (or `supabase db push` if you
-- maintain migrations that way). Safe to re-run: IF NOT EXISTS guards every
-- column add.
--
-- All columns are nullable and only ever populated for type='relapse' rows
-- (and, for tools_used, rows logged from the Emergency Recovery Toolkit).
-- RLS already covers `entries` (owner-only read/write) — no policy changes
-- needed since these are just new columns on an already-protected table.

alter table entries add column if not exists trigger text;
alter table entries add column if not exists urge_strength smallint check (urge_strength between 1 and 10);
alter table entries add column if not exists mood_before smallint;
alter table entries add column if not exists location text;
alter table entries add column if not exists tools_used text[];

comment on column entries.trigger is 'What triggered this relapse (Stress, Anxiety, Boredom, etc.) — see lib/emergency-toolkit.ts / History page trigger picker.';
comment on column entries.urge_strength is 'Self-reported urge intensity 1-10, logged either on relapse or via the Emergency Recovery Toolkit.';
comment on column entries.mood_before is 'Mood value (same scale as lib/mood.ts) logged at the moment of relapse.';
comment on column entries.location is 'Free-text location context for the relapse, optional.';
comment on column entries.tools_used is 'Array of Emergency Recovery Toolkit tool names used before this entry was logged.';
