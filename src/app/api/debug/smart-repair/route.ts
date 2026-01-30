import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json({ error: 'No Service Key found' }, { status: 500 });
        }

        const { createClient: createClientJs } = require('@supabase/supabase-js');
        const adminClient = createClientJs(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: tournaments } = await adminClient.from('tournaments').select('id, name');
        const ligaId = tournaments?.find((t: any) => t.name.includes('Liga Profesional'))?.id;
        const libId = tournaments?.find((t: any) => t.name.includes('Copa Libertadores'))?.id;

        if (!ligaId || !libId) {
            return NextResponse.json({ error: 'Missing tournaments', ligaId, libId }, { status: 404 });
        }

        // Expanded Filters
        const libKeywords = ['flamengo', 'millionarios', 'palmeiras', 'libertad', 'nacional potos', 'sp. luque'];

        const { data: matches } = await adminClient.from('matches').select('*');
        const results = [];

        for (const m of matches || []) {
            let targetId = ligaId;
            let round = 'Fecha 1 - Reparada'; // Default for Liga

            const teams = (m.home_team + ' ' + m.away_team).toLowerCase();

            // Check if ANY keyword matches
            if (libKeywords.some(k => teams.includes(k))) {
                targetId = libId;
                round = 'Fase de Grupos';
            }

            // Apply Update
            const { error } = await adminClient.from('matches').update({
                tournament_id: targetId,
                round_name: round
            }).eq('id', m.id);

            if (targetId === libId) {
                results.push({
                    match: `${m.home_team} vs ${m.away_team}`,
                    to: 'Libertadores',
                    success: !error
                });
            }
        }

        return NextResponse.json({
            success: true,
            updatedLibertadores: results
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
