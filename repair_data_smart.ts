import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual Env Load
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

async function repairDataSmart() {
    const env = loadEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    console.log('--- SMART REPAIR ---');

    // 1. Get Tournaments
    const { data: tournaments } = await supabase.from('tournaments').select('id, name');
    const ligaId = tournaments?.find(t => t.name.includes('Liga Profesional'))?.id;
    const libId = tournaments?.find(t => t.name.includes('Copa Libertadores'))?.id;

    if (!ligaId || !libId) {
        console.error('Missing tournaments:', { ligaId, libId });
        return;
    }

    // 2. Define Filters
    const libTeams = ['Flamengo', 'Palmeiras', 'Millionarios', 'Liberty', 'River Plate', 'San Lorenzo', 'Nacional Potos', 'Racing', 'Sp. Luque'];
    // Note: River, San Lorenzo, Racing play both, but for this repair assuming current dataset logic
    // Actually, visually separating them based on the user screenshot:
    // Flamengo vs Millionarios
    // Argentinos vs Sarmiento (Liga)
    // Boca vs Riestra (Liga)

    // We will query ALL matches and categorize them one by one
    const { data: matches } = await supabase.from('matches').select('*');

    for (const m of matches || []) {
        let targetId = ligaId;
        let round = 'Fecha 1 - Reparada';

        const teams = (m.home_team + ' ' + m.away_team).toLowerCase();

        if (teams.includes('flamengo') || teams.includes('millionarios') || teams.includes('palmeiras')) {
            targetId = libId;
            round = 'Fase de Grupos';
        }

        // Apply Update
        await supabase.from('matches').update({
            tournament_id: targetId,
            round_name: round
        }).eq('id', m.id);

        console.log(`Updated ${m.home_team} vs ${m.away_team} -> ${targetId === libId ? 'Libertadores' : 'Liga'}`);
    }
}

repairDataSmart().catch(console.error);
