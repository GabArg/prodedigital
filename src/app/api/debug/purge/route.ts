import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!serviceRoleKey || !supabaseUrl) return NextResponse.json({ error: 'No Service Key' }, { status: 500 });
        const { createClient: createClientJs } = require('@supabase/supabase-js');
        const adminClient = createClientJs(supabaseUrl, serviceRoleKey);

        console.log('--- PURGING ALL DATA ---');
        const { error } = await adminClient.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;

        // Reset sync timestamps to force fresh fetch
        await adminClient.from('tournaments').update({ last_synced_at: null });

        return NextResponse.json({ success: true, message: "Matches purged and sync reset." });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
