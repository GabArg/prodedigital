import { NextResponse } from 'next/server';
import { fixtureService } from '@/services/fixtureService';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
    // 1. Auth Check (Simple Header Check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running if no secret defined in dev, but strictly enforce in prod
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const supabase = await createClient();

        // 2. Get Active Tournaments
        const { data: tournaments } = await supabase
            .from('tournaments')
            .select('id, name')
            .eq('is_active', true);

        if (!tournaments || tournaments.length === 0) {
            return NextResponse.json({ message: 'No active tournaments' });
        }

        // 3. Sync Each
        const results = [];
        for (const t of tournaments) {
            console.log(`[Cron] Syncing ${t.name}...`);
            const res = await fixtureService.syncTournament(t.id);
            results.push({
                tournament: t.name,
                result: res.success ? res : { success: false, error: res.error instanceof Error ? res.error.message : String(res.error) }
            });
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
