'use server';

import { createClient } from '@/lib/supabase/server';
import { fixtureService } from '@/services/fixtureService';
import { scoringService } from '@/services/scoringService';
import { revalidatePath } from 'next/cache';

export async function getAllSlipsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('prode_slips')
        .select('*')
        .order('close_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getSlipMatchesAction(slipId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('prode_slip_matches')
        .select(`
            match:matches(*)
        `)
        .eq('slip_id', slipId);

    if (error) throw error;
    return data.map((d: any) => d.match);
}

export async function syncTournamentResultsAction(tournamentId: string) {
    const res = await fixtureService.syncResults(tournamentId);
    if (res.success) {
        revalidatePath('/admin/results');
    }
    return res;
}

export async function settleSlipPointsAction(slipId: string) {
    const res = await scoringService.settleSlip(slipId);
    if (res.success) {
        revalidatePath('/admin/results');
    }
    return res;
}

export async function updateMatchResultAction(matchId: string, result: '1' | 'X' | '2') {
    const supabase = await createClient();
    const { error } = await supabase
        .from('matches')
        .update({
            final_result: result,
            status: 'finished'
        })
        .eq('id', matchId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/results');
    return { success: true };
}
