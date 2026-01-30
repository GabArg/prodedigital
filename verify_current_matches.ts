import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

async function verify() {
    const env = loadEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    console.log('--- CURRENT MATCHES ---');
    const { data: matches } = await supabase
        .from('matches')
        .select('home_team, away_team, start_time, round_name, tournament_id')
        .order('start_time');

    matches?.forEach(m => {
        const virtualId = `${m.tournament_id}_::_VIRTUAL_::_${m.round_name}`;
        console.log(`[${m.round_name}] ${m.home_team} vs ${m.away_team} @ ${m.start_time}`);
        console.log(` -> ID: ${virtualId}`);
    });
}

verify().catch(console.error);
