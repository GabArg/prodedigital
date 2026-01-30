import { fixtureService } from './src/services/fixtureService';
import { createClient } from './src/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load (No dotenv dependency)
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            process.env[key] = value;
        }
    });
}
loadEnv();

console.log('API KEY Loaded:', !!process.env.API_FOOTBALL_KEY);
if (!process.env.API_FOOTBALL_KEY) {
    console.error('CRITICAL: API_FOOTBALL_KEY is missing from process.env');
    // Hardcode for test if parsing fails (fallback) - though verify parsing first
}

async function test() {
    console.log('--- STARTING CACHE TEST ---');
    const supabase = await createClient();

    // 1. Get a test tournament
    const { data: t } = await supabase.from('tournaments')
        .select('*')
        .eq('api_league_id', 128) // Liga Profesional
        .single();

    if (!t) {
        console.error('Test tournament not found.');
        return;
    }

    console.log(`Testing with Tournament: ${t.name} (Last Sync: ${t.last_synced_at})`);

    // 2. First Call (Should ideally hit API if not synced, or Cache if recent)
    console.log('\n--> CALL 1: syncTournament()');
    const res1 = await fixtureService.syncTournament(t.id);
    console.log('Result 1:', res1);

    // 3. Second Call Immediate (Should be CACHE HIT)
    console.log('\n--> CALL 2: syncTournament() [Immediate Retry]');
    const res2 = await fixtureService.syncTournament(t.id);
    console.log('Result 2 keys:', Object.keys(res2));

    // Check if source property exists (it's typed in FootballApi but fixtureService might not return it explicitly if not mapped, 
    // let's check fixtureService implementation.
    // fixtureService.syncTournament returns `result` from footballApi.syncFixtures.
    // So it HAS `source` property.

    if ((res2 as any).source === 'cache') {
        console.log('PASS: Immediate retry used cache.');
    } else {
        console.warn(`FAIL: Immediate retry source was: ${(res2 as any).source}`);
    }

    console.log('--- TEST COMPLETE ---');
}

test().catch(console.error);
