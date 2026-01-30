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

async function listLeagues() {
    const env = loadEnv();
    const apiKey = env.API_FOOTBALL_KEY;
    if (!apiKey) return;

    console.log('--- SEARCHING ARGENTINA LEAGUES ---');
    const res = await fetch(`https://v3.football.api-sports.io/leagues?country=Argentina`, {
        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
    });
    const json = await res.json();

    json.response?.forEach(l => {
        const seasons = l.seasons.map(s => s.year).join(', ');
        console.log(`[${l.league.id}] ${l.league.name} (${l.league.type}) - Seasons: ${seasons}`);
    });
}

listLeagues().catch(console.error);
