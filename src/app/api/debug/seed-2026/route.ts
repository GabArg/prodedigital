import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey || !supabaseUrl) return NextResponse.json({ error: 'No Service Key' }, { status: 500 });

        const { createClient: createClientJs } = require('@supabase/supabase-js');
        const adminClient = createClientJs(supabaseUrl, serviceRoleKey);

        console.log('--- SEEDING 2026 ---');

        // 1. CLEAR Old Data
        await adminClient.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        // 2. Get Tournament (Liga Profesional)
        // If 'Liga 2026' doesn't exist, use 'Liga Profesional'
        let { data: tourn } = await adminClient.from('tournaments').select('id').ilike('name', '%Liga Profesional%').single();
        if (!tourn) {
            // Create it? Or just error.
            return NextResponse.json({ error: 'Liga Profesional not found' }, { status: 404 });
        }
        const compId = tourn.id;

        // 3. Insert Matches
        const matches = [
            // Fecha 1
            { home_team: 'Barracas Central', away_team: 'River Plate', start_time: '2026-01-24T18:00:00Z', round_name: 'Fecha 1', tournament_id: compId, final_result: '2' },
            { home_team: 'Independiente', away_team: 'Estudiantes LP', start_time: '2026-01-23T18:00:00Z', round_name: 'Fecha 1', tournament_id: compId, final_result: 'X' },
            { home_team: 'Gimnasia LP', away_team: 'Racing Club', start_time: '2026-01-24T20:00:00Z', round_name: 'Fecha 1', tournament_id: compId, final_result: '1' },
            { home_team: 'Boca Juniors', away_team: 'Deportivo Riestra', start_time: '2026-01-25T21:30:00Z', round_name: 'Fecha 1', tournament_id: compId }, // Future
            { home_team: 'Argentinos Jrs', away_team: 'Sarmiento', start_time: '2026-01-25T21:00:00Z', round_name: 'Fecha 1', tournament_id: compId },

            // Fecha 2
            { home_team: 'River Plate', away_team: 'Tigre', start_time: '2026-02-01T17:00:00Z', round_name: 'Fecha 2', tournament_id: compId },
            { home_team: 'Boca Juniors', away_team: 'Central Cordoba', start_time: '2026-02-01T19:15:00Z', round_name: 'Fecha 2', tournament_id: compId },
            { home_team: 'Racing Club', away_team: 'Union', start_time: '2026-02-01T21:30:00Z', round_name: 'Fecha 2', tournament_id: compId },
            { home_team: 'Estudiantes LP', away_team: 'Velez', start_time: '2026-02-02T20:00:00Z', round_name: 'Fecha 2', tournament_id: compId }
        ];

        // Default Slip ID to avoid constraint error
        const defaultSlipId = '7afcaec6-9593-4108-83d5-c226c08bf52a';

        const payload = matches.map(m => ({
            ...m,
            slip_id: defaultSlipId,
            status: new Date(m.start_time) < new Date() ? 'FT' : 'NS'
        }));

        const { data, error } = await adminClient.from('matches').insert(payload).select();

        if (error) throw error;

        return NextResponse.json({ success: true, count: data.length });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
