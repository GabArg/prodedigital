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

async function diagnose() {
    const env = loadEnv();
    const apiKey = env.API_FOOTBALL_KEY;
    const date = '2026-01-26'; // Date we know has matches

    const variations = [
        { name: 'Date Only', url: `https://v3.football.api-sports.io/fixtures?date=${date}` },
        { name: 'League + Date', url: `https://v3.football.api-sports.io/fixtures?league=128&date=${date}` },
        { name: 'League + Season + Date', url: `https://v3.football.api-sports.io/fixtures?league=128&season=2026&date=${date}` }
    ];

    for (const v of variations) {
        console.log(`Testing ${v.name}: ${v.url}`);
        const res = await fetch(v.url, {
            headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        });
        const json = await res.json();
        console.log(` -> Result: ${json.response?.length || 0} fixtures`);
        if (json.errors && Object.keys(json.errors).length > 0) {
            console.log(` -> Errors: ${JSON.stringify(json.errors)}`);
        }
    }
}

diagnose().catch(console.error);
