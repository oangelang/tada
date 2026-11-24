-- Ta-da! Database Schema
-- Run this in the Supabase SQL editor

-- Ta-da entries
create table public.tadas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  text        text not null check (char_length(text) <= 120),
  tag         text not null check (tag in ('Self-Care', 'Work', 'Home', 'Social', 'Other')),
  date        date not null,
  is_public   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Reactions (one per user per tada)
create table public.reactions (
  id        uuid primary key default gen_random_uuid(),
  tada_id   uuid references public.tadas(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  unique(tada_id, user_id)
);

-- Comments
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  tada_id    uuid references public.tadas(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  text       text not null check (char_length(text) <= 200),
  created_at timestamptz default now()
);

-- User profiles
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  is_public     boolean default true,
  created_at    timestamptz default now()
);

-- Enable RLS
alter table public.tadas enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.profiles enable row level security;

-- Tadas: users see their own + public ones from others
create policy "own tadas" on public.tadas for all using (auth.uid() = user_id);
create policy "public tadas readable" on public.tadas for select using (is_public = true);

-- Reactions: anyone can read, authenticated users can insert/delete their own
create policy "reactions readable" on public.reactions for select using (true);
create policy "own reactions" on public.reactions for all using (auth.uid() = user_id);

-- Comments: anyone can read, authenticated users can insert their own
create policy "comments readable" on public.comments for select using (true);
create policy "own comments" on public.comments for all using (auth.uid() = user_id);

-- Push subscriptions
create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now()
);

alter table public.push_subscriptions enable row level security;
create policy "own push subs" on public.push_subscriptions for all using (auth.uid() = user_id);

-- Profiles: public readable, users manage their own
create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile" on public.profiles for all using (auth.uid() = id);

-- Follows (friends system)
create table public.follows (
  id            uuid primary key default gen_random_uuid(),
  follower_id   uuid references auth.users(id) on delete cascade not null,
  following_id  uuid references auth.users(id) on delete cascade not null,
  created_at    timestamptz default now(),
  unique(follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "own follows" on public.follows for all using (auth.uid() = follower_id);
create policy "follows readable" on public.follows for select using (true);
