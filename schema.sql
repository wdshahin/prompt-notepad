-- ============================================================
-- Initial table creation (run once on a fresh project)
-- ============================================================

create table if not exists notes (
  id          text        primary key,
  user_id     uuid        references auth.users not null,
  title       text        not null default 'Untitled Prompt',
  text        text        not null default '',
  images      jsonb       not null default '[]',
  important   boolean     not null default false,
  personal    boolean     not null default false,
  client      boolean     not null default false,
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
--            the tag columns or files column
-- ============================================================

alter table notes
  add column if not exists important boolean not null default false,
  add column if not exists personal  boolean not null default false,
  add column if not exists client    boolean not null default false,
  add column if not exists files     jsonb   not null default '[]';

