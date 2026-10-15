-- ============================================================
-- Initial table creation (run once on a fresh project)
-- ============================================================

create table if not exists notes (
  id          text        primary key,
  user_id     uuid        references auth.users not null,
  title       text        not null default 'Untitled Prompt',
  text        text        not null default '',
  images      jsonb       not null default '[]',
  files       jsonb       not null default '[]',
  important   boolean     not null default false,
  personal    boolean     not null default false,
  client      boolean     not null default false,
  deleted     boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table notes enable row level security;

-- Each user can only see and edit their own notes
create policy "Users manage own notes"
  on notes for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- MIGRATION: Run this if the table already exists without
--            the tag columns, files column, or deleted column
-- ============================================================

alter table notes
  add column if not exists important boolean not null default false,
  add column if not exists personal  boolean not null default false,
  add column if not exists client    boolean not null default false,
  add column if not exists files     jsonb   not null default '[]',
  add column if not exists deleted   boolean not null default false;

-- ============================================================
-- PUBLIC SHARING: run this in the Supabase SQL Editor
-- ============================================================
-- share_id is a random, unguessable token. NULL = not shared.
alter table notes
  add column if not exists share_id text;

create unique index if not exists notes_share_id_key
  on notes (share_id) where share_id is not null;

-- Anonymous visitors can NOT read the notes table directly (RLS still applies).
-- They can only call this function with a valid token, and it returns just the
-- fields needed for the public page. Trashed notes are never returned.
create or replace function get_shared_note(p_share_id text)
returns table (title text, text text, images jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select n.title, n.text, n.images, n.updated_at
  from notes n
  where n.share_id = p_share_id
    and n.deleted = false
  limit 1;
$$;

revoke all on function get_shared_note(text) from public;
grant execute on function get_shared_note(text) to anon, authenticated;
