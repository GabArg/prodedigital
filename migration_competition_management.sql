-- 1. Ensure Competitions Table Exists (Refinement)
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  type text default 'public', -- 'public' | 'private'
  status text default 'active', -- 'active' | 'archived' | 'upcoming'
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Competitions
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read competitions" ON public.competitions;
CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);
-- Admin Write Policy should be added here for production

-- 2. Create Competition-Tournament Join Table
CREATE TABLE IF NOT EXISTS public.competition_tournaments (
  competition_id uuid references public.competitions(id) on delete cascade not null,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  primary key (competition_id, tournament_id)
);

-- Enable RLS
ALTER TABLE public.competition_tournaments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read comp_tournaments" ON public.competition_tournaments;
CREATE POLICY "Public read comp_tournaments" ON public.competition_tournaments FOR SELECT USING (true);

-- 3. Seed Example Competition (If empty)
INSERT INTO public.competitions (name, slug, type, description)
VALUES ('Prode Oficial 2024', 'prode-oficial-2024', 'public', 'El prode principal de la temporada.')
ON CONFLICT (slug) DO NOTHING;
