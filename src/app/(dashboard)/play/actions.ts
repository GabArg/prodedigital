'use server';

import { createClient } from '@/lib/supabase/server';
import { MatchOutcome } from '@/services/scoringService';
import { revalidatePath } from 'next/cache';
import { AnalyticsService } from '@/services/analyticsService';

import { isMatchLocked, getLockReason } from '@/services/predictionRules';

export async function submitPredictionAction(matchId: string, prediction: MatchOutcome) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    // 2. Check Lock Status
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('bets_locked, start_time')
        .eq('id', matchId)
        .single();

    if (matchError || !match) return { success: false, error: 'Match not found' };

    if (match.bets_locked) {
        return { success: false, error: 'Apuestas cerradas (Cierre Manual)' };
    }

    // 3. Check Time Lock
    if (isMatchLocked(match.start_time)) {
        const reason = getLockReason(match.start_time);
        return { success: false, error: reason || 'Apuestas cerradas' };
    }

    // 4. Upsert Prediction
    const { error } = await supabase
        .from('match_predictions')
        .upsert({
            user_id: user.id,
            match_id: matchId,
            prediction: prediction,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, match_id' });

    if (error) {
        console.error('Prediction Error:', error);
        return { success: false, error: 'Could not save prediction' };
    }

    // Analytics
    await AnalyticsService.trackEvent('slip_played', user.id, {
        match_id: matchId,
        prediction: prediction
    });

    revalidatePath('/play');
    return { success: true };
}

export async function submitBatchPredictionsAction(predictions: { matchId: string; prediction: MatchOutcome }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    if (predictions.length === 0) return { success: true };

    // 1. Validate Matches (Fetch start_time)
    const matchIds = predictions.map(p => p.matchId);
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, start_time, bets_locked')
        .in('id', matchIds);

    if (matchError || !matches) {
        return { success: false, error: 'Error validating matches' };
    }

    // 2. Filter Valid Predictions
    const validPredictions = predictions.filter(p => {
        const match = matches.find(m => m.id === p.matchId);
        if (!match) return false; // Match not found in DB
        if (match.bets_locked) return false; // Manual lock
        if (isMatchLocked(match.start_time)) return false; // Time lock
        return true;
    });

    if (validPredictions.length === 0) {
        return { success: false, error: 'No se pudieron guardar las predicciones (Partidos cerrados o inválidos)' };
    }

    // 3. Upsert Valid Only
    const payload = validPredictions.map(p => ({
        user_id: user.id,
        match_id: p.matchId,
        prediction: p.prediction,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('match_predictions')
        .upsert(payload, { onConflict: 'user_id, match_id' });

    if (error) {
        console.error('Batch Error:', error);
        return { success: false, error: 'Error saving predictions' };
    }

    const skippedCount = predictions.length - validPredictions.length;

    revalidatePath('/play');

    if (skippedCount > 0) {
        return { success: true, warning: `Se guardaron ${validPredictions.length} predicciones. ${skippedCount} fueron ignoradas por estar cerradas.` };
    }

    return { success: true };
}

export async function getUserPredictionsAction(matchIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('user_id', user.id)
        .in('match_id', matchIds);

    return data || [];
}

export async function getCompetitionMatchesAction(slipId: string) {
    // Note: We rename or keep the name but change logic to fetch the SLIP
    const { DataService } = await import('@/services/dataService');
    const slip = await DataService.getSlipById(slipId);

    if (!slip) return null;

    return {
        competition: { name: slip.tournament_name, description: slip.round_name }, // Map slip to what UI expects for title
        matches: slip.matches || []
    };
}

export async function getUpcomingMatchesAction() {
    const { DataService } = await import('@/services/dataService');
    const data = await DataService.getUpcomingMatchesGrouped();
    return data || [];
}
