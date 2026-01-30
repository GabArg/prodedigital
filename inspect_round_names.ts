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

async function inspect() {
    const env = loadEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    console.log('--- INSPECTING ROUND NAMES ---');
    const { data: matches } = await supabase
        .from('matches')
        .select('round_name, tournament_id')
        .limit(10);

    matches?.forEach((m, i) => {
        console.log(`Match ${i}: "${m.round_name}" (Length: ${m.round_name.length})`);
        console.log(` Tournament ID: ${m.tournament_id}`);
        // Log char codes
        const codes = Array.from(m.round_name).map(c => c.charCodeAt(0)).join(',');
        console.log(` Char Codes: ${codes}`);
    });
}

inspect().catch(console.error);
