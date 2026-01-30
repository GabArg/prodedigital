import { createClient } from './src/lib/supabase/server';

async function seed() {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://jkkotpgquthwjhnljkco.supabase.co';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impra290cGdxdXRod2pobmxqa2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTg3MzksImV4cCI6MjA4NDg5NDczOX0.Pzdd_M4hGgshq3nCVaLZERA5ooRCDLf3g3q87XRLp6s';

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

    console.log('--- SEEDING DATABASE (MINIMAL) ---');

    // 1. Seed Tournaments
    const tournaments = [
        { name: 'Liga Profesional Argentina', api_league_id: 128, current_season: 2024 },
        { name: 'Copa del Mundo', api_league_id: 1, current_season: 2026 }
    ];

    for (const t of tournaments) {
        const { error } = await supabase.from('tournaments').upsert(t, { onConflict: 'api_league_id' });
        if (error) console.error(`Error tournament ${t.name}:`, error.message);
        else console.log(`✓ Tournament: ${t.name}`);
    }

    // 2. Seed Competitions
    const competitions = [
        { name: 'Prode Oficial 2024', slug: 'prode-oficial-2024' },
        { name: 'Mundial 2026', slug: 'mundial-2026' }
    ];

    for (const c of competitions) {
        const { error } = await supabase.from('competitions').upsert(c, { onConflict: 'slug' });
        if (error) console.error(`Error competition ${c.name}:`, error.message);
        else console.log(`✓ Competition: ${c.name}`);
    }

    console.log('--- SEEDING COMPLETE ---');
}

seed().catch(console.error);
