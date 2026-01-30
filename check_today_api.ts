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

async function checkToday() {
    const env = loadEnv();
    const apiKey = env.API_FOOTBALL_KEY;
    if (!apiKey) return;

    const today = new Date().toISOString().split('T')[0];
    console.log(`--- CHECKING ALL FIXTURES FOR ${today} ---`);

    // API endpoint for fixtures by date
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
    });
    const json = await res.json();

    const argentinaMatches = json.response?.filter(f => f.league.country === 'Argentina');
    console.log(`Total Argentina Matches found for today: ${argentinaMatches?.length || 0}`);

    argentinaMatches?.forEach(f => {
        console.log(`[League ${f.league.id}] ${f.league.name} (S${f.league.season}) [${f.league.round}] - ${f.teams.home.name} vs ${f.teams.away.name} (${f.fixture.status.short})`);
    });

    if (argentinaMatches?.length === 0) {
        console.log('No matches found for Argentina today in the entire API database.');
    }
}

checkToday().catch(console.error);
