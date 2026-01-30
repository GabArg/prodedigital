import { createClient } from '@/lib/supabase/server';

export type MatchOutcome = '1' | 'X' | '2';

export const scoringService = {
    /**
     * Calculates points for a single prediction based on match results.
     * Rule: +3 points for exact result (1, X, 2).
     */
    calculatePoints: (picks: Record<string, string>, matchResults: Record<string, string>) => {
        let totalPoints = 0;

        Object.entries(picks).forEach(([matchId, pick]) => {
            const result = matchResults[matchId];
            if (result && pick === result) {
                totalPoints += 3;
            }
        });

        return totalPoints;
    },

    /**
     * Settles all predictions for a specific slip.
     * Updates the user_predictions table with the earned points.
     */
    settleSlip: async (slipId: string) => {
        const supabase = await createClient();

        // 1. Get all matches for this slip and their results
        const { data: slipMatches, error: matchesError } = await supabase
            .from('prode_slip_m_view') // Assuming a view or joining
            .select(`
                match_id,
                matches:match_id(final_result)
            `)
            .eq('slip_id', slipId);

        // Note: For now, let's use the join table directly if view doesn't exist
        const { data: joinData, error: joinError } = await supabase
            .from('prode_slip_matches')
            .select('match:matches(id, final_result)')
            .eq('slip_id', slipId);

        if (joinError) throw joinError;

        const resultsMap: Record<string, string> = {};
        joinData.forEach((item: any) => {
            if (item.match.final_result) {
                resultsMap[item.match.id] = item.match.final_result;
            }
        });

        // 2. Get all predictions for this slip
        const { data: predictions, error: predError } = await supabase
            .from('user_predictions')
            .select('*')
            .eq('slip_id', slipId);

        if (predError) throw predError;

        // 3. Round up points and update
        const updates = predictions.map(pred => {
            const points = scoringService.calculatePoints(pred.picks, resultsMap);
            return {
                id: pred.id,
                points_earned: points
            };
        });

        if (updates.length === 0) return { success: true, count: 0 };

        // Batch update predictions
        // Supabase doesn't have a great batch update by ID with different values in one call without RPC
        // So we might need an RPC or do it individually (or a temp table join)
        // For the MVP, let's assume we have an RPC or use multiple calls (not ideal but works for now)

        for (const update of updates) {
            await supabase
                .from('user_predictions')
                .update({ points_earned: update.points_earned })
                .eq('id', update.id);
        }

        // 4. Mark slip as settled if all matches are finished
        // (Optional logic, can be manual)

        return { success: true, count: updates.length };
    }
};
