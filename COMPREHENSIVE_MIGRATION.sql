-- ==========================================
-- FINAL COMPREHENSIVE MIGRATION (REAL MODE) - ROBUST VERSION
-- ==========================================

-- 1. Ensure UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPETITIONS Table
CREATE TABLE IF NOT EXISTS public.competitions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Ensure all columns exist for existing tables
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS type text DEFAULT 'public';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read competitions" ON public.competitions;
CREATE POLICY "Public read competitions" ON public.competitions FOR SELECT USING (true);

-- 3. TOURNAMENTS Table (API Sync Source)
CREATE TABLE IF NOT EXISTS public.tournaments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS api_league_id int UNIQUE;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS current_season int;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tournaments" ON public.tournaments;
CREATE POLICY "Public read tournaments" ON public.tournaments FOR SELECT USING (true);

-- 4. PRODE SLIPS (Dates)
ALTER TABLE public.prode_slips ADD COLUMN IF NOT EXISTS competition_id uuid REFERENCES public.competitions(id) ON DELETE SET NULL;

-- 5. FRIEND TOURNAMENTS (Enhanced)
ALTER TABLE public.friend_tournaments ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.friend_tournaments ADD COLUMN IF NOT EXISTS prizes_info jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.friend_tournaments ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 6. FRIEND TOURNAMENT MEMBERS (Status support)
ALTER TABLE public.friend_tournament_members ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected'));

-- 7. FRIEND TOURNAMENT COMPETITIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.friend_tournament_competitions (
    friend_tournament_id uuid REFERENCES public.friend_tournaments(id) ON DELETE CASCADE,
    competition_id uuid REFERENCES public.competitions(id) ON DELETE CASCADE,
    PRIMARY KEY (friend_tournament_id, competition_id)
);

ALTER TABLE public.friend_tournament_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ft_comps" ON public.friend_tournament_competitions;
CREATE POLICY "Public read ft_comps" ON public.friend_tournament_competitions FOR SELECT USING (true);

-- 8. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.friend_tournament_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id uuid REFERENCES public.friend_tournaments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(content) > 0),
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.friend_tournament_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view messages" ON public.friend_tournament_messages;
CREATE POLICY "Members can view messages" ON public.friend_tournament_messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.friend_tournament_members 
        WHERE tournament_id = friend_tournament_messages.tournament_id 
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

DROP POLICY IF EXISTS "Members can send messages" ON public.friend_tournament_messages;
CREATE POLICY "Members can send messages" ON public.friend_tournament_messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.friend_tournament_members 
        WHERE tournament_id = friend_tournament_messages.tournament_id 
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- 9. SEED INITIAL COMPETITION
-- Using separate updates to handle potential existing rows
INSERT INTO public.competitions (name, slug)
VALUES ('Liga Profesional 2026', 'liga-2026')
ON CONFLICT (slug) DO NOTHING;

UPDATE public.competitions 
SET type = 'public', status = 'active', description = 'Torneo Apertura de la Liga Argentina'
WHERE slug = 'liga-2026';

INSERT INTO public.tournaments (name, api_league_id)
VALUES ('Liga Profesional Argentina', 128)
ON CONFLICT (api_league_id) DO NOTHING;

UPDATE public.tournaments 
SET current_season = 2026, is_active = true
WHERE api_league_id = 128;
