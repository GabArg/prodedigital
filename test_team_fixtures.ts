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

async function testTeam() {
    console.log("Searching for Team 'River Plate'...");

    // 1. Search Team
    const res = await fetch(`${API_URL}/teams?name=River Plate&country=Argentina`, {
        headers: { 'x-rapidapi-key': API_KEY!, 'x-rapidapi-host': API_HOST }
    });

    const json = await res.json();
    const team = json.response?.[0]?.team;

    if (!team) {
        console.error("Team not found");
        console.log(JSON.stringify(json, null, 2));
        return;
    }

    console.log(`Found Team: ${team.name} (ID: ${team.id})`);

    // 2. Fetch Fixtures for Team
    console.log(`Fetching next 5 fixtures for Team ${team.id}...`);

    const res2 = await fetch(`${API_URL}/fixtures?team=${team.id}&next=5`, {
        headers: { 'x-rapidapi-key': API_KEY!, 'x-rapidapi-host': API_HOST }
    });

    const json2 = await res2.json();

    if (json2.errors && Object.keys(json2.errors).length > 0) {
        console.error("API Error:", JSON.stringify(json2.errors));
        return;
    }

    const fixtures = json2.response || [];
    console.log(`Found ${fixtures.length} fixtures:`);
    fixtures.forEach((f: any) => {
        console.log(` - ${f.fixture.date}: ${f.teams.home.name} vs ${f.teams.away.name} (League: ${f.league.id})`);
    });
}

testTeam();
