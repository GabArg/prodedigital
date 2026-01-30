import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
        env[key] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const API_KEY = env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';

const TOURNAMENT_ID = '723f3b79-1f0d-44a0-b01d-da44596bba02'; // The id we are debugging

function calculateResult(homeWinner: boolean | null, awayWinner: boolean | null, homeGoals: number | null, awayGoals: number | null) {
    if (homeGoals === null || awayGoals === null) return null;
    if ((homeGoals as number) > (awayGoals as number)) return '1';
    if ((awayGoals as number) > (homeGoals as number)) return '2';
    return 'X';
}

async function runSync() {
    console.log(`Starting Force Sync for Tournament: ${TOURNAMENT_ID}`);

    // 1. Get Tournament Config
    const { data: tournament, error: tError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', TOURNAMENT_ID)
        .single();

    if (tError || !tournament) {
        console.error("Tournament not found or Error:", tError);
        return;
    }

    const { api_league_id, current_season } = tournament;
    console.log(`Config: League ID ${api_league_id}, Season ${current_season}`);

    if (!api_league_id || !current_season || !API_KEY) {
        console.error("Missing API Config or Key");
        return;
    }


    // 2. Fetch API using DATE RANGE (Workaround for Free Plan)
    console.log(`Fetching fixtures by DATE RANGE (Free Plan Workaround)...`);

    // Sync last 10 days and next 45 days
    const rangeStart = -10;
    const rangeEnd = 45;

    const fixtures: any[] = [];
    const today = new Date();

    for (let i = rangeStart; i <= rangeEnd; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];

        process.stdout.write(`Checked ${dateStr}... `);

        const res = await fetch(`${API_URL}/fixtures?date=${dateStr}`, {
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        if (!res.ok) {
            console.log(`FAILED: ${res.status}`);
            continue;
        }

        const json = await res.json();
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.log("API Error:", JSON.stringify(json.errors));
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
            continue;
        }

        const dailyMatches = json.response || [];

        // Filter for our league
        const leagueMatches = dailyMatches.filter((m: any) => m.league.id === api_league_id);
        if (leagueMatches.length > 0) {
            console.log(`FOUND ${leagueMatches.length} matches!`);
            fixtures.push(...leagueMatches);
        } else {
            console.log(`0`);
        }
    }

    console.log(`\nTotal matches found in range: ${fixtures.length}`);

    if (fixtures.length === 0) return;

    // 3. Upsert
    let total = 0;
    const batchSize = 50;

    for (let i = 0; i < fixtures.length; i += batchSize) {
        const chunk = fixtures.slice(i, i + batchSize);
        const upserts = chunk.map((f: any) => ({
            tournament_id: TOURNAMENT_ID,
            api_fixture_id: f.fixture.id,
            home_team: f.teams.home.name,
            away_team: f.teams.away.name,
            start_time: f.fixture.date,
            status: f.fixture.status.short,
            home_goals: f.goals.home,
            away_goals: f.goals.away,
            season: f.league.season,
            round_name: f.league.round,
            final_result: calculateResult(f.teams.home.winner, f.teams.away.winner, f.goals.home, f.goals.away)
        }));

        const { error } = await supabase.from('matches').upsert(upserts, { onConflict: 'api_fixture_id' });
        if (error) {
            console.error('Batch Upsert Error:', error);
        } else {
            total += upserts.length;
            process.stdout.write('.');
        }
    }

    console.log(`\nSync Complete. Upserted ${total} matches.`);

    // 4. Update Tournament Timestamp
    await supabase.from('tournaments')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', TOURNAMENT_ID);
}

runSync();
