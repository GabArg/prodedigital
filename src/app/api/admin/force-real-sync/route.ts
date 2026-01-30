import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { footballApi } from '@/services/footballApi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('--- EXCLUSIVE REAL SYNC TRIGGERED ---');
    try {
        const supabase = await createClient();
        console.log('--- EXCLUSIVE REAL SYNC ---');

        // 1. Refresh Tournament Config
        // (Assuming user might have called admin/setup manually, but let's do it implicitly here for 128 if needed)
        const { data: tournaments } = await supabase.from('tournaments')
            .select('*')
            .eq('is_active', true);

        if (!tournaments || tournaments.length === 0) {
            return NextResponse.json({ error: 'No active tournaments' }, { status: 404 });
        }

        const reports = [];

        for (const t of tournaments) {
            if (!t.api_league_id) continue;

            console.log(`[RealSync] Syncing ${t.name} (ID: ${t.api_league_id}, Season: ${t.current_season})...`);

            // Bypass cache by setting last_synced_at to null
            await supabase.from('tournaments').update({ last_synced_at: null }).eq('id', t.id);

            const result = await footballApi.syncFixtures(t.id, t.api_league_id, t.current_season);
            reports.push({ tournament: t.name, ...result });
        }

        return NextResponse.json({ success: true, reports });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
