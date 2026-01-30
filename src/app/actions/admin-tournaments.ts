'use server';

import { fixtureService } from '@/services/fixtureService';
import { revalidatePath } from 'next/cache';

export async function syncTournament(tournamentId: string) {
    try {
        console.log('Syncing tournament via Server Action:', tournamentId);
        const res = await fixtureService.syncTournament(tournamentId);
        revalidatePath('/admin/tournaments');
        return res;
    } catch (e: any) {
        console.error('Sync Action Error:', e);
        return { success: false, error: e.message };
    }
}
