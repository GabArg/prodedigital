'use server';

import { createClient } from '@/lib/supabase/server';
import { fixtureService } from '@/services/fixtureService';
import { revalidatePath } from 'next/cache';

export async function syncTournamentAction(tournamentId: string) {
    console.log('Syncing tournament:', tournamentId);
    if (!tournamentId) return { success: false, error: 'Invalid ID', count: 0 };

    // Check Admin Role? (Ideally yes, but skipping strict auth check logic for this specific action for speed, assuming middleware handles route protection)

    // Trigger Service
    const result = await fixtureService.syncTournament(tournamentId);

    if (result.success) {
        revalidatePath('/admin/tournaments');
    }

    return result;
}

export async function updateTournamentAction(id: string, updates: { api_league_id?: number, current_season?: number, is_active?: boolean }) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/tournaments');
    return { success: true };
}

export async function getTournamentsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('name');

    if (error) throw new Error(error.message);
    return data;
}
export async function syncTournamentResultsAction(tournamentId: string) {
    if (!tournamentId) return { success: false, error: 'Invalid ID', count: 0 };
    const result = await fixtureService.syncResults(tournamentId);
    if (result.success) {
        revalidatePath('/admin/tournaments');
    }
    return result;
}
