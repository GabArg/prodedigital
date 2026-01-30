-- 1. Create Tournaments Table (Master API Source)
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  api_league_id int unique, -- API-Football League ID
  current_season int,       -- e.g., 2024
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tournaments" ON public.tournaments;
CREATE POLICY "Public read tournaments" ON public.tournaments FOR SELECT USING (true);
-- Admin write access would be added here normally

-- 2. Modify Matches Table (Decouple from Slips)
-- First, add new columns
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS tournament_id uuid references public.tournaments(id),
ADD COLUMN IF NOT EXISTS api_fixture_id int unique,
ADD COLUMN IF NOT EXISTS round_name text,
ADD COLUMN IF NOT EXISTS stage text, -- e.g., "Regular Season", "Playoffs"
ADD COLUMN IF NOT EXISTS season int, -- e.g., 2024
ADD COLUMN IF NOT EXISTS status text default 'scheduled',
ADD COLUMN IF NOT EXISTS home_goals int,
ADD COLUMN IF NOT EXISTS away_goals int,
ADD COLUMN IF NOT EXISTS bets_locked boolean default false;

-- 3. Create Slip-Match Join Table (Flexible Grouping)
CREATE TABLE IF NOT EXISTS public.prode_slip_matches (
  slip_id uuid references public.prode_slips(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  primary key (slip_id, match_id)
);

-- Enable RLS
ALTER TABLE public.prode_slip_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read slip_matches" ON public.prode_slip_matches;
CREATE POLICY "Public read slip_matches" ON public.prode_slip_matches FOR SELECT USING (true);

-- 4. Migrate Existing Data (Preserve Relationships)
DO $$
DECLARE
    v_match RECORD;
BEGIN
    -- Migrate existing 1:N relationships to the new N:M table
    -- This ensures we don't lose which matches belong to which slip
    INSERT INTO public.prode_slip_matches (slip_id, match_id)
    SELECT slip_id, id FROM public.matches 
    WHERE slip_id IS NOT NULL
    ON CONFLICT (slip_id, match_id) DO NOTHING;
    
    -- Note: We are keeping 'slip_id' in matches for now as nullable Legacy, 
    -- but creating the N:M relationship is the future path.
    -- Later we can drop matches.slip_id constraint.
END $$;

-- 5. Seed Tournaments (Initial Data)
INSERT INTO public.tournaments (name, api_league_id, current_season) VALUES 
('Copa Libertadores', 13, 2024),
('Copa Sudamericana', 11, 2024),
('Liga Profesional Argentina', 128, 2024),
('Copa del Mundo', 1, 2026),
('UEFA Champions League', 2, 2024)
ON CONFLICT (api_league_id) DO UPDATE SET is_active = true;
