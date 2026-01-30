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

async function checkApi() {
    const env = loadEnv();
    const apiKey = env.API_FOOTBALL_KEY;
    if (!apiKey) { console.error('No API Key'); return; }

    const leagues = [128, 1032, 13, 11]; // Liga, Copa de la Liga, Lib, Sud
    const seasons = [2024, 2025, 2026];

    for (const l of leagues) {
        for (const s of seasons) {
            console.log(`Checking League ${l} Season ${s}...`);
            const res = await fetch(`https://v3.football.api-sports.io/fixtures?league=${l}&season=${s}`, {
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            const json = await res.json();
            console.log(` -> Fixtures: ${json.response?.length || 0}`);
            if (json.response?.length > 0) {
                const sample = json.response[0];
                console.log(` -> Sample: ${sample.fixture.date} - ${sample.teams.home.name} vs ${sample.teams.away.name}`);
            }
        }
    }
}

checkApi().catch(console.error);
