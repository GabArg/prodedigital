import { createClient } from '@/lib/supabase/server';

const API_HOST = 'v3.football.api-sports.io';
const API_URL = 'https://v3.football.api-sports.io';

// Cache Durations (in milliseconds)
const CACHE_DURATION = {
    FIXTURES: 24 * 60 * 60 * 1000, // 24 Hours
    RESULTS_FINISHED: 24 * 60 * 60 * 1000, // 24 Hours
    RESULTS_LIVE: 10 * 60 * 1000, // 10 Minutes
    COMPETITIONS: 7 * 24 * 60 * 60 * 1000 // 7 Days
};

interface ApiFixture {
    fixture: {
        id: number;
        date: string;
        status: { short: string; long: string };
    };
    league: { id: number; season: number; round: string };
    teams: {
        home: { id: number; name: string; logo: string; winner: boolean | null };
        away: { id: number; name: string; logo: string; winner: boolean | null };
    };
    goals: { home: number | null; away: number | null };
}

export const footballApi = {
    /**
     * Global sync by date range. Safer for Free plans to discover 2026 matches.
     * Modified to check PAST days too (-3 to +14).
     */
    async syncGlobalDateRange(days: number = 14): Promise<{ success: boolean; count: number }> {
        const supabase = await createClient();
        const { data: tourns } = await supabase.from('tournaments').select('id, api_league_id').eq('is_active', true);
        if (!tourns) return { success: false, count: 0 };

        const activeIds = tourns.map(t => t.api_league_id);
        const idMap = Object.fromEntries(tourns.map(t => [t.api_league_id, t.id]));

        let totalUpserted = 0;

        // Window: [Today - 3, Today + 14]
        const backCheck = 3;
        const totalLoop = days + backCheck;

        console.log(`[FootballApi] Global Sync (Dates: -${backCheck} to +${days})...`);

        for (let i = -backCheck; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            console.log(` -> Fetching date: ${dateStr}`);
            const apiKey = process.env.API_FOOTBALL_KEY || '';

            const res = await fetch(`${API_URL}/fixtures?date=${dateStr}`, {
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': API_HOST
                },
                cache: 'no-store'
            });

            if (!res.ok) continue;
            const json = await res.json();
            const fixtures: ApiFixture[] = json.response || [];

            // Filter for our leagues
            const targets = fixtures.filter(f => activeIds.includes(f.league.id));

            for (const f of targets) {
                const matchData = {
                    tournament_id: idMap[f.league.id],
                    api_fixture_id: f.fixture.id,
                    home_team: f.teams.home.name,
                    away_team: f.teams.away.name,
                    start_time: f.fixture.date,
                    status: f.fixture.status.short,
                    home_goals: f.goals.home,
                    away_goals: f.goals.away,
                    season: f.league.season,
                    round_name: f.league.round,
                    // slip_id is removed (must be nullable in DB)
                    final_result: calculateResult(f.teams.home.winner, f.teams.away.winner, f.goals.home, f.goals.away)
                };

                await supabase.from('matches').upsert(matchData, { onConflict: 'api_fixture_id' });
                totalUpserted++;
            }
        }

        // Update sync timestamps for all involved tournaments.
        // This is imperfect (what if one tournament had no matches in range?) but acceptable for MVP.
        await supabase.from('tournaments')
            .update({ last_synced_at: new Date().toISOString(), sync_status: 'success' })
            .in('id', Object.values(idMap));

        return { success: true, count: totalUpserted };
    },

    async syncFixtures(tournamentId: string, apiLeagueId: number, season: number): Promise<{ success: boolean; source: 'cache' | 'api'; count: number; error?: string }> {
        const supabase = await createClient();

        // 1. Check Cache with SMART LOGIC
        // Default: 24h. If matches today: 10m.

        // Check for matches occurring today (or currently live)
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

        const { count: matchesToday } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournamentId)
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());

        const hasMatchesToday = (matchesToday || 0) > 0;
        const ttl = hasMatchesToday ? CACHE_DURATION.RESULTS_LIVE : CACHE_DURATION.FIXTURES;

        const { data: tournament, error: tError } = await supabase
            .from('tournaments')
            .select('last_synced_at')
            .eq('id', tournamentId)
            .single();

        if (tError) return { success: false, source: 'cache', count: 0, error: 'Tournament not found' };

        const lastSync = tournament?.last_synced_at ? new Date(tournament.last_synced_at).getTime() : 0;
        const now = Date.now();
        const isFresh = (now - lastSync) < ttl;

        if (isFresh) {
            console.log(`[FootballApi] Cache Hit for ${apiLeagueId}. Mode: ${hasMatchesToday ? 'LIVE (10m)' : 'DAILY (24h)'}. Skipping API.`);
            return { success: true, source: 'cache', count: 0 };
        }

        // 2. Fetch from API (Fallback to Date Range for Free Plan)
        console.log(`[FootballApi] Cache Miss for ${apiLeagueId}. Triggering Global Date Sync...`);

        if (!process.env.API_FOOTBALL_KEY) return { success: false, source: 'api', count: 0, error: 'Missing API Key' };

        // Sync -3 days to +14 days 
        // We reuse global sync function but it updates stats for ALL tournaments found.
        const res = await this.syncGlobalDateRange(14);
        return { success: res.success, source: 'api', count: res.count, error: res.success ? undefined : 'Sync failed' };

        /*
        // ORIGINAL LOGIC (Fails on Free Plan for Future Seasons)
        try {
            const res = await fetch(`${API_URL}/fixtures?league=${apiLeagueId}&season=${season}`, ...);
            ...
        }
        */
    }
};

function calculateResult(homeWinner: boolean | null, awayWinner: boolean | null, homeGoals: number | null, awayGoals: number | null): '1' | 'X' | '2' | null {
    if (homeGoals === null || awayGoals === null) return null;
    if (homeGoals > awayGoals) return '1';
    if (awayGoals > homeGoals) return '2';
    return 'X';
}
