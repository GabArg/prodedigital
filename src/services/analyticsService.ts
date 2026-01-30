import { createClient } from '@/lib/supabase/server';

export const AnalyticsService = {
    trackEvent: async (
        eventType: string,
        userId: string,
        metadata: Record<string, any> = {},
        tournamentId?: string
    ) => {
        try {
            const supabase = await createClient();

            await supabase.from('analytics_events').insert({
                event_type: eventType,
                user_id: userId,
                tournament_id: tournamentId || null,
                metadata: metadata
            });
        } catch (error) {
            // Analytics should not block main flow, just log error
            console.error('[Analytics Error]', error);
        }
    }
};
