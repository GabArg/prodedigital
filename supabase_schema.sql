-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  alias text unique, -- Public display name (Mandatory)
  birth_date date,   -- Private, for age validation (Mandatory)
  whatsapp text,     -- Private (Mandatory)
  nationality text,  -- Optional
  favorite_team text,-- Optional
  role text default 'user' check (role in ('user', 'admin')),
  credits int default 0,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Age Validation Constraint (18+)
  constraint check_age_18 check (birth_date <= (current_date - interval '18 years'))
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. WALLET TRANSACTIONS
create table public.wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount int not null,
  type text check (type in ('load', 'play', 'reward', 'admin_adjustment')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Users read own transactions
alter table public.wallet_transactions enable row level security;
create policy "Users can view own transactions." on public.wallet_transactions for select using (auth.uid() = user_id);

-- 3. PRODE SLIPS (Tournaments/Dates)
create table public.prode_slips (
  id uuid default uuid_generate_v4() primary key,
  tournament_name text not null,
  round_name text not null,
  close_date timestamp with time zone not null,
  entry_cost int not null default 0,
  status text default 'open' check (status in ('open', 'closed', 'settled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public read
alter table public.prode_slips enable row level security;
create policy "Slips are viewable by everyone." on public.prode_slips for select using (true);

-- 4. MATCHES
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  slip_id uuid references public.prode_slips(id) not null,
  home_team text not null,
  away_team text not null,
  start_time timestamp with time zone not null,
  final_result text check (final_result in ('1', 'X', '2')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public read
alter table public.matches enable row level security;
create policy "Matches are viewable by everyone." on public.matches for select using (true);

-- 5. USER PREDICTIONS (The "Ticket")
create table public.user_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  slip_id uuid references public.prode_slips(id) not null,
  picks jsonb not null, -- Stores { "match_id": "1", ... }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent multiple tickets for same slip per user
  unique(user_id, slip_id)
);

-- RLS: Users read own, public read for rankings (or unrestricted read depending on rules)
alter table public.user_predictions enable row level security;
create policy "Everyone can view predictions (for rankings)." on public.user_predictions for select using (true);
create policy "Users can insert own predictions." on public.user_predictions for insert with check (auth.uid() = user_id);

-- 6. RPC: PLAY SLIP (Atomic Transaction)
-- This function handles the credit deduction and ticket creation atomically
create or replace function public.play_prode_slip(
  p_slip_id uuid,
  p_picks jsonb,
  p_cost int,
  p_description text
)
returns void as $$
declare
  v_user_balance int;
begin
  -- Check balance
  select credits into v_user_balance from public.profiles where id = auth.uid();
  
  if v_user_balance < p_cost then
    raise exception 'Saldo insuficiente';
  end if;

  -- Deduct Credits
  update public.profiles 
  set credits = credits - p_cost
  where id = auth.uid();

  -- Record Transaction
  insert into public.wallet_transactions (user_id, amount, type, description)
  values (auth.uid(), -p_cost, 'play', p_description);

  -- Save Prediction
  insert into public.user_predictions (user_id, slip_id, picks)
  values (auth.uid(), p_slip_id, p_picks);

end;
$$ language plpgsql security definer;

-- 7. FRIEND TOURNAMENTS
create table public.friend_tournaments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text not null unique,
  owner_user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.friend_tournaments enable row level security;
create policy "Everyone can view tournaments." on public.friend_tournaments for select using (true);
create policy "Users can create tournaments." on public.friend_tournaments for insert with check (auth.uid() = owner_user_id);
create policy "Owner can update." on public.friend_tournaments for update using (auth.uid() = owner_user_id);

-- 8. FRIEND TOURNAMENT MEMBERS
create table public.friend_tournament_members (
  id uuid default uuid_generate_v4() primary key,
  tournament_id uuid references public.friend_tournaments(id) not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(tournament_id, user_id)
);

alter table public.friend_tournament_members enable row level security;
create policy "Everyone can view members." on public.friend_tournament_members for select using (true);
create policy "Users can join." on public.friend_tournament_members for insert with check (auth.uid() = user_id);

-- 9. SEED DATA (Power the MVP with initial cups)
-- Note: This uses DO block to insert if not exists
DO $$
DECLARE 
  v_slip_id uuid;
BEGIN
  -- 1. Copa Libertadores
  IF NOT EXISTS (SELECT 1 FROM public.prode_slips WHERE tournament_name = 'Copa Libertadores') THEN
      INSERT INTO public.prode_slips (tournament_name, round_name, close_date, entry_cost, status)
      VALUES ('Copa Libertadores', 'Fase de Grupos - Fecha 1', now() + interval '7 days', 300, 'open')
      RETURNING id INTO v_slip_id;

      INSERT INTO public.matches (slip_id, home_team, away_team, start_time) VALUES 
      (v_slip_id, 'River Plate', 'Libertad', now() + interval '7 days'),
      (v_slip_id, 'Flamengo', 'Millionarios', now() + interval '6 days'),
      (v_slip_id, 'Palmeiras', 'San Lorenzo', now() + interval '8 days');
  END IF;

  -- 2. Copa Sudamericana
  IF NOT EXISTS (SELECT 1 FROM public.prode_slips WHERE tournament_name = 'Copa Sudamericana') THEN
      INSERT INTO public.prode_slips (tournament_name, round_name, close_date, entry_cost, status)
      VALUES ('Copa Sudamericana', 'Fase de Grupos - Fecha 1', now() + interval '8 days', 200, 'open')
      RETURNING id INTO v_slip_id;

      INSERT INTO public.matches (slip_id, home_team, away_team, start_time) VALUES 
      (v_slip_id, 'Boca Juniors', 'Nacional Potosí', now() + interval '8 days'),
      (v_slip_id, 'Racing', 'Sp. Luqueño', now() + interval '9 days'),
      (v_slip_id, 'Defensa y Justicia', 'Cesar Vallejo', now() + interval '7 days');
  END IF;

  -- 3. Copa Mundial
  IF NOT EXISTS (SELECT 1 FROM public.prode_slips WHERE tournament_name = 'Copa Mundial') THEN
      INSERT INTO public.prode_slips (tournament_name, round_name, close_date, entry_cost, status)
      VALUES ('Copa Mundial', 'Final', now() + interval '30 days', 1000, 'open')
      RETURNING id INTO v_slip_id;

      INSERT INTO public.matches (slip_id, home_team, away_team, start_time) VALUES 
      (v_slip_id, 'Argentina', 'Francia', now() + interval '18 days');
  END IF;

END $$;
