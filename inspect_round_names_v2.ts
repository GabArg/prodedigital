

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);


async function inspectMatches() {
    const tournamentId = '723f3b79-1f0d-44a0-b01d-da44596bba02';

    console.log(`Inspecting matches for tournament: ${tournamentId}`);

    const { data: matches, error } = await supabase
        .from('matches')
        .select('id, home_team, away_team, start_time, round_name')
        .eq('tournament_id', tournamentId)
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${matches.length} matches.`);

    // Group by round_name to see variations
    const rounds: Record<string, any[]> = {};
    matches.forEach(m => {
        const r = `"${m.round_name}"`; // Quote to see spaces
        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(`${m.home_team} vs ${m.away_team} (${m.start_time})`);
    });

    for (const [round, ms] of Object.entries(rounds)) {
        console.log(`\nRound: ${round}`);
        ms.forEach(m => console.log(`  - ${m}`));
    }
}

inspectMatches();
