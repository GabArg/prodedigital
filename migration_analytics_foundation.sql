-- Analytics Foundation Migration

create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  tournament_id uuid, -- Optional reference to friend_tournaments or competitions
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Index for faster analytics queries
create index if not exists idx_analytics_events_type_created on analytics_events(event_type, created_at);
create index if not exists idx_analytics_events_user_created on analytics_events(user_id, created_at);

-- RLS: Only service role can insert/read for now, or admin users
alter table analytics_events enable row level security;

create policy "Service role full access"
  on analytics_events
  for all
  to service_role
  using (true)
  with check (true);

-- Optional: Allow users to read their own events if needed later
-- create policy "Users can view own events"
--   on analytics_events
--   for select
--   to authenticated
--   using (auth.uid() = user_id);
