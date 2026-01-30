'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitPredictionAction(matchId: string, prediction: '1' | 'X' | '2') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Check if bets are locked for this match
    const { data: match } = await supabase.from('matches').select('bets_locked, start_time').eq('id', matchId).single();
    if (!match) return { success: false, error: 'Match not found' };

    // Double check lock Status
    if (match.bets_locked) return { success: false, error: 'Bets are locked for this match' };

    // Optional: Check time just in case background job didn't run
    const now = new Date();
    const start = new Date(match.start_time);
    if (now >= start) return { success: false, error: 'Match already started' };


    // 2. Upsert prediction
    const { error } = await supabase
        .from('predictions')
        .upsert({
            user_id: user.id,
            match_id: matchId,
            value: prediction,
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id, match_id' });

    if (error) {
        console.error('Prediction Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/play');
    return { success: true };
}
