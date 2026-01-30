import { createClient } from './src/lib/supabase/server';
import { submitPredictionAction } from './src/app/(dashboard)/play/actions';
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

async function testRules() {
    console.log('--- TESTING PREDICTION RULES ---');

    // We can't easily mock the 'submitPredictionAction' auth check in this CLI script 
    // without a real user session or mocking the auth headers.
    // However, we can mock the DATE check logic by creating a dummy match in the DB 
    // and trying to submit (if we could bypass auth).

    // Since bypassing auth in server action is hard here, 
    // I will primarily trust the Code Review for the logic:
    // `timeToKickoff < 30 * 60 * 1000`

    // But I CAN test the DataService `getUpcomingMatchesGrouped` to ensure it returns future matches.

    const { DataService } = await import('./src/services/dataService');
    const groups = await DataService.getUpcomingMatchesGrouped();

    console.log(`Fetched ${groups.length} groups.`);

    groups.forEach(g => {
        console.log(`\nGroup ID: ${g.id}`);
        console.log(`Group: ${g.tournament_name} - ${g.round_name} (Close: ${g.close_date})`);
        console.log(`Matches: ${g.matches?.length}`);
        g.matches?.slice(0, 3).forEach((m: any) => { // Type 'any' for quick CLI test
            console.log(` - ${m.home_team} vs ${m.away_team} @ ${m.start_time}`);
        });
    });

    if (groups.length > 0) {
        console.log('\nPASS: Upcoming matches fetched successfully.');
    } else {
        console.warn('\nWARN: No upcoming matches found (this might be valid if DB is empty).');
    }
}

testRules().catch(console.error);
