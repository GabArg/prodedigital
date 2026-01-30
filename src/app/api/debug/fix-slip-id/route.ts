import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient(); // Uses service role if env set, or just pool? 
        // We need privileges. In Vercel/Node environment with Service Key in env, `createClient` might auto-use if configured?
        // Actually, let's use the explicit Service Key client pattern to be safe.

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey || !supabaseUrl) return NextResponse.json({ error: 'No Service Key' }, { status: 500 });

        const { createClient: createClientJs } = require('@supabase/supabase-js');
        const adminClient = createClientJs(supabaseUrl, serviceRoleKey);

        // Raw SQL via RPC is best if enabled, but we might not have `exec_sql` function.
        // If we don't have RPC, we can't run DDL (ALTER TABLE) via JS client unless we use the REST API `pg` extension? No.
        // We can only run DML (Insert/Update/Delete).
        // EXCEPT if we have a function defined? 
        // Checking `migration_fixture_management.sql`... no generic exec function.

        // Alternative: Assign a "GLOBAL DEFAULT SLIP" for all synced matches.
        // Create a slip called "Uncategorized" and use its ID.
        // This keeps the constraint happy.

        // 1. Find or Create Default Slip
        const { data: slips } = await adminClient.from('prode_slips').select('id').eq('tournament_name', 'System Default').limit(1);
        let defaultSlipId = slips?.[0]?.id;

        if (!defaultSlipId) {
            const { data: newSlip, error } = await adminClient.from('prode_slips').insert({
                tournament_name: 'System Default',
                round_name: 'General',
                close_date: new Date(2030, 0, 1).toISOString(),
                entry_cost: 0,
                status: 'open',
                competition_id: null // Assuming nullable?
            }).select().single();

            if (error) throw error;
            defaultSlipId = newSlip.id;
        }

        return NextResponse.json({ success: true, defaultSlipId });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
