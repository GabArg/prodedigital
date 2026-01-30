-- RPC Function to get Leaderboard for a specific Competition
CREATE OR REPLACE FUNCTION public.get_competition_leaderboard(p_competition_id uuid)
RETURNS TABLE (
    user_id uuid,
    alias text,
    avatar_url text,
    points bigint, -- sum returns bigint
    matches_predicted bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.user_id,
        p.alias,
        p.avatar_url,
        COALESCE(SUM(mp.points_earned), 0) as points,
        COUNT(mp.id) as matches_predicted
    FROM public.match_predictions mp
    JOIN public.matches m ON mp.match_id = m.id
    JOIN public.competition_tournaments ct ON m.tournament_id = ct.tournament_id
    JOIN public.profiles p ON mp.user_id = p.id
    WHERE ct.competition_id = p_competition_id
    AND mp.status = 'scored'
    GROUP BY mp.user_id, p.alias, p.avatar_url
    ORDER BY points DESC, matches_predicted DESC;
END;
$$ LANGUAGE plpgsql STABLE;
