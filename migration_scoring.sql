-- 1. Create Normalized Predictions Table (Simplified for 1/X/2)
CREATE TABLE IF NOT EXISTS public.match_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id uuid references public.matches(id) not null,
  
  prediction text not null check (prediction in ('1', 'X', '2')),
  
  points_earned int default 0,
  status text default 'pending', -- 'pending', 'scored'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, match_id)
);

ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read predictions" ON public.match_predictions;
CREATE POLICY "Public read predictions" ON public.match_predictions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage own predictions" ON public.match_predictions;
CREATE POLICY "Users manage own predictions" ON public.match_predictions FOR ALL USING (auth.uid() = user_id);

-- 2. Scoring Logic Function (Strict 1v2 Rule)
CREATE OR REPLACE FUNCTION public.calculate_score(
    p_prediction text,
    p_real_home int, 
    p_real_away int
) RETURNS int AS $$
DECLARE
    real_outcome text;
BEGIN
    -- Determine Match Outcome
    IF p_real_home > p_real_away THEN
        real_outcome := '1';
    ELSIF p_real_away > p_real_home THEN
        real_outcome := '2';
    ELSE
        real_outcome := 'X';
    END IF;

    -- Compare
    IF p_prediction = real_outcome THEN
        RETURN 1; -- Hit
    ELSE
        RETURN 0; -- Miss
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Trigger Function to Update Scores on Match Finish
CREATE OR REPLACE FUNCTION public.update_match_scores() RETURNS TRIGGER AS $$
BEGIN
    -- Only run if status changed to 'finished' or goals changed while finished
    IF NEW.status = 'finished' THEN
        UPDATE public.match_predictions
        SET 
            points_earned = public.calculate_score(prediction, NEW.home_goals, NEW.away_goals),
            status = 'scored'
        WHERE match_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach Trigger to Matches
DROP TRIGGER IF EXISTS tr_score_matches ON public.matches;
CREATE TRIGGER tr_score_matches
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_match_scores();

-- 5. Leaderboard View (Global)
CREATE OR REPLACE VIEW public.leaderboard_global AS
SELECT 
    p.user_id,
    prof.alias,
    prof.avatar_url,
    count(p.id) as matches_predicted,
    sum(p.points_earned) as total_points
FROM public.match_predictions p
JOIN public.profiles prof ON p.user_id = prof.id
WHERE p.status = 'scored'
GROUP BY p.user_id, prof.alias, prof.avatar_url
ORDER BY total_points DESC;
