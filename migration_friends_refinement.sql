-- 1. Create Competitions Table
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Competitions
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read competitions" ON public.competitions;
CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);

-- 2. Link Slips to Competitions
ALTER TABLE public.prode_slips 
ADD COLUMN IF NOT EXISTS competition_id uuid references public.competitions(id);

-- 3. Create Join Table (Tournament <-> Competition)
CREATE TABLE IF NOT EXISTS public.friend_tournament_competitions (
  friend_tournament_id uuid references public.friend_tournaments(id) on delete cascade not null,
  competition_id uuid references public.competitions(id) on delete cascade not null,
  primary key (friend_tournament_id, competition_id)
);

-- Enable RLS for Join Table
ALTER TABLE public.friend_tournament_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ft_competitions" ON public.friend_tournament_competitions;
CREATE POLICY "Public read ft_competitions" ON public.friend_tournament_competitions FOR SELECT USING (true);

-- Policy to allow group creators to add competitions
DROP POLICY IF EXISTS "Creators insert ft_competitions" ON public.friend_tournament_competitions;
CREATE POLICY "Creators insert ft_competitions" ON public.friend_tournament_competitions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.friend_tournaments
        WHERE id = friend_tournament_competitions.friend_tournament_id
        AND owner_user_id = auth.uid()
    )
);

-- 4. SEED DATA & MIGRATION
DO $$
DECLARE
    v_libertadores_id uuid;
    v_sudamericana_id uuid;
    v_mundial_id uuid;
BEGIN
    -- Insert Competitions
    INSERT INTO public.competitions (name, slug) VALUES 
        ('Copa Libertadores', 'libertadores'),
        ('Copa Sudamericana', 'sudamericana'),
        ('Copa Mundial', 'mundial'),
        ('Liga Argentina', 'liga-argentina')
    ON CONFLICT (slug) DO NOTHING;

    -- Get IDs
    SELECT id INTO v_libertadores_id FROM public.competitions WHERE slug = 'libertadores';
    SELECT id INTO v_sudamericana_id FROM public.competitions WHERE slug = 'sudamericana';
    SELECT id INTO v_mundial_id FROM public.competitions WHERE slug = 'mundial';

    -- Backfill Slips
    UPDATE public.prode_slips SET competition_id = v_libertadores_id WHERE tournament_name = 'Copa Libertadores';
    UPDATE public.prode_slips SET competition_id = v_sudamericana_id WHERE tournament_name = 'Copa Sudamericana';
    UPDATE public.prode_slips SET competition_id = v_mundial_id WHERE tournament_name = 'Copa Mundial';
END $$;
