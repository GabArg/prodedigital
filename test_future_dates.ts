import fs from 'fs';
import path from 'path';

// 1. Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    }
});

const API_KEY = env.API_FOOTBALL_KEY;
const API_URL = 'https://v3.football.api-sports.io';
const API_HOST = 'v3.football.api-sports.io';

async function testDates() {
    const dates = ['2026-01-29', '2026-01-30', '2026-01-31'];

    for (const d of dates) {
        console.log(`Testing ${d}...`);
        const res = await fetch(`${API_URL}/fixtures?date=${d}`, {
            headers: { 'x-rapidapi-key': API_KEY!, 'x-rapidapi-host': API_HOST }
        });

        const json = await res.json();
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.log(`  ERROR: ${JSON.stringify(json.errors)}`);
        } else {
            const count = json.results;
            console.log(`  SUCCESS: found ${count} matches globally.`);
            // check for league 128
            const leagueMatches = (json.response || []).filter((m: any) => m.league.id === 128);
            if (leagueMatches.length > 0) {
                console.log(`  Found ${leagueMatches.length} matches for League 128!`);
                leagueMatches.forEach((m: any) => console.log(`    - ${m.teams.home.name} vs ${m.teams.away.name}`));
            } else {
                console.log(`  No matches for League 128.`);
            }
        }
    }
}

testDates();
