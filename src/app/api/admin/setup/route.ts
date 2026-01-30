import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        console.log("Configuring tournaments...");
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log(`[Setup] URL: ${url}, Has Service Key: ${hasKey}`);

        // 1. Upsert Tournaments
        const tournaments = [
            { name: 'Liga Profesional', slug: 'liga-profesional', api_league_id: 128, current_season: 2026, is_active: true },
            { name: 'UEFA Champions League', slug: 'champions-league', api_league_id: 2, current_season: 2025, is_active: true }, // Champions 25/26
            { name: 'Copa Libertadores', slug: 'libertadores', api_league_id: 13, current_season: 2026, is_active: true },
            { name: 'Copa Sudamericana', slug: 'sudamericana', api_league_id: 11, current_season: 2026, is_active: true }
        ];

        const { error } = await supabase
            .from('tournaments')
            .upsert(tournaments, { onConflict: 'api_league_id' });

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Tournaments configured successfully' });

    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
