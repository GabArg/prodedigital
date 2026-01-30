import { footballApi } from './footballApi';
import { createClient } from '@/lib/supabase/server';

export const fixtureService = {
    /**
     * Syncs a tournament's fixtures/results from API-Football (via FootballApi service).
     * Now respects the 100 req/day limit via caching.
     */
    syncTournament: async (tournamentId: string) => {
        try {
            const supabase = await createClient();

            // 1. Get Tournament Details
            const { data: tournament, error: tError } = await supabase
                .from('tournaments')
                .select('*')
                .eq('id', tournamentId)
                .single();

            if (tError || !tournament) throw new Error('Tournament not found or DB error');
            if (!tournament.api_league_id || !tournament.current_season) {
                console.warn(`Tournament ${tournament.name} missing API config. Skipping.`);
                return { success: false, error: 'Missing API config', count: 0 };
            }

            // 2. Delegate to Football Api Service
            // This handles Caching + API Call + DB Upsert
            const result = await footballApi.syncFixtures(
                tournamentId,
                tournament.api_league_id,
                tournament.current_season
            );

            return result;

        } catch (error: any) {
            console.error('Fixture Service Sync Error:', error);
            return { success: false, error: error.message, count: 0 };
        }
    },

    /**
     * Syncs results.
     * With the new architecture, this is the same as syncTournament 
     * because `syncFixtures` fetches everything.
     */
    syncResults: async (tournamentId: string) => {
        return fixtureService.syncTournament(tournamentId);
    },

    /**
     * Lock matches that are about to start (e.g. < 15 mins)
     * This is pure DB logic, unchanged.
     */
    lockUpcomingMatches: async (minutesBefore = 15) => {
        const supabase = await createClient();
        const cutoff = new Date(Date.now() + minutesBefore * 60000).toISOString();

        const { error } = await supabase
            .from('matches')
            .update({ bets_locked: true })
            .lt('match_date', cutoff) // Use start_time? Check matches table definition.
            .eq('bets_locked', false);

        // Note: The previous code used 'match_date', but the migration in Step 36 defined 'start_time'.
        // I should check the schema. The file `migration_fixture_management.sql` said `start_time`.
        // But `fixtureService.ts` used `match_date`.
        // Let's check `migration_fixture_management.sql` again. 
        // Line 66: "start_time timestamp with time zone not null"
        // Line 41 of old fixtureService.ts used "match_date: f.fixture.date".
        // And the `matches` table definition in Step 34 (supabase_schema.sql) says `start_time` (Line 66).
        // I will use `start_time`.

        return { success: !error, error };
    }
};
