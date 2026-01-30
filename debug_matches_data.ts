import { createClient } from './src/lib/supabase/server';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
        }
    });
}
loadEnv();

async function debugMatches() {
    const { supabase } = await import('./src/lib/supabase'); // Use client for quick script (or server if you prefer)

    // Check Matches
    const { data: matches, error } = await supabase
        .from('matches')
        .select('id, home_team, away_team, tournament_id, round_name, start_time');

    if (error) {
        console.error('Error fetching matches:', error);
        return;
    }

    console.log(`Total Matches: ${matches?.length}`);
    const invalid = matches?.filter(m => !m.tournament_id || !m.round_name);
    console.log(`Invalid Matches (Missing ID or Round): ${invalid?.length}`);

    if (invalid && invalid.length > 0) {
        console.log('--- Sample Invalid Matches ---');
        invalid.slice(0, 5).forEach(m => console.log(m));
    }

    // Check Tournaments
    const { data: tournaments } = await supabase.from('tournaments').select('*');
    console.log(`\nAvailable Tournaments: ${tournaments?.length}`);
    tournaments?.forEach(t => console.log(` - ${t.id}: ${t.name}`));
}

debugMatches().catch(console.error);
