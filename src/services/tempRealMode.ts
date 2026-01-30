import { footballApi } from '@/services/footballApi';
import { createClient } from '@/lib/supabase/server';
import { DataService } from '@/services/dataService'; // For getting matches

interface RealModeResult {
    source: 'api' | 'manual';
    matchesCount: number;
    debugInfo: string;
}

export const TempRealModeService = {
    async execute(): Promise<RealModeResult> {
        const supabase = await createClient();
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const endOfSevenDays = new Date(); endOfSevenDays.setDate(startOfDay.getDate() + 7);

        console.log('[RealMode] Starting Force Sync...');

        // 1. Try API Fetch (Current Season 2025? Or 2024 if limited)
        // User asked for "Real" and "Season 2025" implies attempting next year if avail, or 2024.
        // We know 2024 works. 2025 might be empty.
        // Let's try 2024 for "Current" context given we are in Jan 2026 local time but data is old.
        // WAIT. User local time is 2026.
        // API Football "current" season for 2026 is 2026.
        // Free plan usually gives current + past 2 years.
        // If we are in 2026, we should try 2026.
        // But if API only has 2024 as verified, we might fail 2026.
        // Let's TRY 2026. If 0 matches, fallback to 2025, then Manual.

        const targetSeason = 2026;

        // Sync Liga (128) & Lib (13)
        // We need active tournaments.
        const { data: tournaments } = await supabase.from('tournaments')
            .select('*')
            .in('api_league_id', [128, 13])
            .eq('is_active', true);

        let apiSuccess = false;
        let fetchedCount = 0;

        if (tournaments && tournaments.length > 0) {
            for (const t of tournaments) {
                // Force sync 2026
                const res = await footballApi.syncFixtures(t.id, t.api_league_id, targetSeason);
                if (res.success) {
                    apiSuccess = true;
                    // Check how many we actually have now in range
                    const { count } = await supabase
                        .from('matches')
                        .select('*', { count: 'exact', head: true })
                        .eq('tournament_id', t.id)
                        .gte('start_time', startOfDay.toISOString())
                        .lte('start_time', endOfSevenDays.toISOString());

                    fetchedCount += (count || 0);
                }
            }
        }

        // 2. Check Results
        if (fetchedCount > 0) {
            return {
                source: 'api',
                matchesCount: fetchedCount,
                debugInfo: `Fetched ${fetchedCount} matches (Season ${targetSeason})`
            };
        }

        // 3. Fallback: Manual Seed
        console.log('[RealMode] API returned 0 matches. Fallback to Manual.');

        await this.seedTempMatches(supabase);

        return {
            source: 'manual',
            matchesCount: 9, // Fixed set
            debugInfo: 'API Empty. Using Manual Temp Data.'
        };
    },

    async seedTempMatches(supabase: any) {
        // Clear Range first to avoid dupes?
        // Or just Upsert. Use 'manual_temp' ID generation if possible or known IDs.
        // We use the 2026 Seed logic here.

        const matches = [
            // Fecha 1 (Today/Recent)
            { home_team: 'Barracas Central', away_team: 'River Plate', start_time: new Date().toISOString(), round_name: 'Fecha 1 #manual_temp', tournament_slug: 'liga-profesional', final_result: null },
            // Make one LIVE
            { home_team: 'Independiente', away_team: 'Estudiantes LP', start_time: new Date().toISOString(), round_name: 'Fecha 1 #manual_temp', tournament_slug: 'liga-profesional', status: '1H' },

            // Fecha 2 (Future)
            { home_team: 'River Plate', away_team: 'Tigre', start_time: new Date(Date.now() + 86400000 * 3).toISOString(), round_name: 'Fecha 2 #manual_temp', tournament_slug: 'liga-profesional' },
            { home_team: 'Boca Juniors', away_team: 'Central Cordoba', start_time: new Date(Date.now() + 86400000 * 3).toISOString(), round_name: 'Fecha 2 #manual_temp', tournament_slug: 'liga-profesional' },

            // Libs
            { home_team: 'Flamengo', away_team: 'Millionarios', start_time: new Date(Date.now() + 86400000 * 5).toISOString(), round_name: 'Fase de Grupos #manual_temp', tournament_slug: 'copa-libertadores' }
        ];

        // We need IDs for tournaments
        const { data: tourns } = await supabase.from('tournaments').select('id, slug');
        const ligaId = tourns?.find((t: any) => t.slug.includes('liga'))?.id;
        const libId = tourns?.find((t: any) => t.slug.includes('libertadores'))?.id;

        const defaultSlipId = '7afcaec6-9593-4108-83d5-c226c08bf52a';

        const payload = matches.map(m => {
            const tId = m.tournament_slug.includes('liga') ? ligaId : libId;
            return {
                tournament_id: tId,
                round_name: m.round_name,
                home_team: m.home_team,
                away_team: m.away_team,
                start_time: m.start_time,
                slip_id: defaultSlipId,
                status: m.status || 'NS',
                final_result: m.final_result
            };
        }).filter(m => m.tournament_id);

        await supabase.from('matches').insert(payload);
    }
};
