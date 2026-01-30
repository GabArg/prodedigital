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

    // Check tournaments
    const { count: tournCount, error: tError } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    console.log('Tournaments count:', tournCount, tError ? tError.message : 'OK');

    // Check prode_slip_matches (just see if we can select from it)
    const { error: psmError } = await supabase.from('prode_slip_matches').select('*').limit(1);
    console.log('prode_slip_matches table:', psmError ? 'MISSING/ERROR' : 'EXISTS');
    if (psmError) console.error(psmError.message);

    // Check matches (columns) - hard to check columns via JS client without inserting
    // We'll skip intricate column checks and rely on user testing.
}

verify().catch(console.error);
