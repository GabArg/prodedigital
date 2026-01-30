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

async function testFromTo() {
    console.log("Testing from/to parameters for League 128 Season 2026...");

    // Try to fetch Jan 26 to Jan 31
    const from = '2026-01-26';
    const to = '2026-01-31';

    console.log(`Fetching ${from} to ${to}...`);

    const res = await fetch(`${API_URL}/fixtures?league=128&season=2026&from=${from}&to=${to}`, {
        headers: { 'x-rapidapi-key': API_KEY!, 'x-rapidapi-host': API_HOST }
    });

    const json = await res.json();

    if (json.errors && Object.keys(json.errors).length > 0) {
        console.error("API Error:", JSON.stringify(json.errors));
        return;
    }

    const fixtures = json.response || [];
    console.log(`Found ${fixtures.length} fixtures.`);
    fixtures.forEach((f: any) => {
        console.log(` - ${f.fixture.date}: ${f.teams.home.name} vs ${f.teams.away.name}`);
    });
}

testFromTo();
