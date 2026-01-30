import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient(); // Uses server context

        // 1. Get a tournament ID (Liga Profesional)
        const { data: tournaments } = await supabase.from('tournaments')
            .select('id, name')
            .ilike('name', '%Liga Profesional%')
            .limit(1);

        if (!tournaments || tournaments.length === 0) {
            return NextResponse.json({ error: 'No tournament found' }, { status: 404 });
        }

        const targetTournamentId = tournaments[0].id;

        // 2. Update Orphans
        const { data, error } = await supabase
            .from('matches')
            .update({
                tournament_id: targetTournamentId,
                round_name: 'Fecha 1 - Reparada'
            })
            .is('tournament_id', null)
            .select('id');

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Updated matches`,
            count: data?.length || 0,
            tournament: tournaments[0].name
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
