-- Run this in your Supabase SQL Editor

create table notes (
  id          text        primary key,
  user_id     uuid        references auth.users not null,
  title       text        not null default 'Untitled Prompt',
  text        text        not null default '',
  images      jsonb       not null default '[]',
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
