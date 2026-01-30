import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            env[key] = value;
        }
    });
    return env;
}

async function repairData() {
    const env = loadEnv();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing credentials in .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- REPAIRING DATA ---');

    // 1. Get a tournament ID (Liga Profesional)
    const { data: tournaments } = await supabase.from('tournaments')
        .select('id, name')
        .ilike('name', '%Liga Profesional%')
        .limit(1);

    if (!tournaments || tournaments.length === 0) {
        console.error('No tournament found to assign.');
        return;
    }

    const targetTournamentId = tournaments[0].id;
    console.log(`Assigning orphans to: ${tournaments[0].name} (${targetTournamentId})`);

    // 2. Fetch Orphans
    const { data: orphans } = await supabase.from('matches')
        .select('*')
        .is('tournament_id', null);

    if (!orphans || orphans.length === 0) {
        console.log('No orphans found.');
        return;
    }

    // 3. Update them
    // We'll assign "Fecha 1" to today's/past matches, "Fecha 2" to future ones if we want,
    // or just "Fecha 1 - Reparada" for simplicity.
    // Let's simply assign generic data to make them visible.

    // Batch update is not supported directly in JS client for different values easily, 
    // but here we set SAME values.

    const { error } = await supabase
        .from('matches')
        .update({
            tournament_id: targetTournamentId,
            round_name: 'Fecha 1 - Demo'
        })
        .is('tournament_id', null);

    if (error) {
        console.error('Update failed:', error);
    } else {
        console.log(`Successfully updated ${orphans.length} matches.`);
    }
}

repairData().catch(console.error);
