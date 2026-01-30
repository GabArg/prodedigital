'use server';

import { createClient } from '@/lib/supabase/server';
import { competitionService } from '@/services/competitionService';

export async function getRankingCompetitionsAction() {
    return await competitionService.getAllCompetitions();
}

export async function getCompetitionLeaderboardAction(competitionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .rpc('get_competition_leaderboard', { p_competition_id: competitionId });

    if (error) {
        console.error('Leaderboard RPC Error:', error);
        return [];
    }

    // Map to UI friendly format if needed, or return raw
    // RPC returns: user_id, alias, avatar_url, points, matches_predicted
    return data || [];
}
