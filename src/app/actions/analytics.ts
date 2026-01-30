'use server';

import { createClient } from '@/lib/supabase/server';
import { AnalyticsService } from '@/services/analyticsService';

export async function trackEventAction(
    eventType: string,
    metadata: Record<string, any> = {},
    tournamentId?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Anonymous tracking not supported for this MVP

    await AnalyticsService.trackEvent(eventType, user.id, metadata, tournamentId);
}
