import { createClient } from '@/lib/supabase/server';

const IS_SIMULATION = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true';

export interface Competition {
    id: string;
    name: string;
    slug: string;
    type: 'public' | 'private';
    status: 'active' | 'archived' | 'upcoming';
    description?: string;
    image_url?: string;
    created_at?: string;
    tournaments?: any[]; // Linked tournaments
}

export const competitionService = {
    /**
     * Get all competitions (Admin view)
     */
    getAllCompetitions: async () => {
        if (IS_SIMULATION) {
            const { SimulationService } = await import('./simulationService');
            return await SimulationService.getCompetitions() as any[];
        }
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Competition[];
    },

    /**
     * Get single competition with its linked tournaments
     */
    getCompetitionById: async (id: string) => {
        if (IS_SIMULATION) {
            const { SimulationService } = await import('./simulationService');
            const comp = (await SimulationService.getCompetitions()).find(c => c.id === id);
            const slips = (await SimulationService.getSlips()).filter(s => s.competition_id === id);
            return {
                ...comp,
                tournaments: slips // In simulation, we map slips as linked tournaments for simpler UI
            } as any;
        }
        const supabase = await createClient();

        // 1. Get Comp
        const { data: comp, error: compError } = await supabase
            .from('competitions')
            .select('*')
            .eq('id', id)
            .single();

        if (compError) throw compError;

        // 2. Get Linked Tournaments
        const { data: links, error: linkError } = await supabase
            .from('competition_tournaments')
            .select('tournament_id, tournaments(*)')
            .eq('competition_id', id);

        if (linkError) throw linkError;

        return {
            ...comp,
            tournaments: links.map((l: any) => l.tournaments)
        } as Competition;
    },

    /**
     * Create new competition
     */
    createCompetition: async (data: Partial<Competition>) => {
        const supabase = await createClient();
        const { data: newVal, error } = await supabase
            .from('competitions')
            .insert([{
                name: data.name,
                slug: data.slug,
                type: data.type || 'public',
                status: data.status || 'active',
                description: data.description
            }])
            .select()
            .single();

        if (error) throw error;
        return newVal;
    },

    /**
     * Update competition details
     */
    updateCompetition: async (id: string, updates: Partial<Competition>) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('competitions')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    /**
     * Link a tournament to a competition
     */
    linkTournament: async (competitionId: string, tournamentId: string) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('competition_tournaments')
            .insert({ competition_id: competitionId, tournament_id: tournamentId });

        if (error) {
            // Ignore duplicate key error only
            if (error.code === '23505') return true;
            throw error;
        }
        return true;
    },

    /**
     * Unlink a tournament
     */
    unlinkTournament: async (competitionId: string, tournamentId: string) => {
        const supabase = await createClient();
        const { error } = await supabase
            .from('competition_tournaments')
            .delete()
            .match({ competition_id: competitionId, tournament_id: tournamentId });

        if (error) throw error;
        return true;
    },

    /**
     * Get slips for a competition
     */
    getSlipsByCompetition: async (competitionId: string) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('prode_slips')
            .select(`
                *,
                matches:prode_slip_matches(
                    match:matches(*)
                )
            `)
            .eq('competition_id', competitionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data.map((slip: any) => ({
            ...slip,
            matches: slip.matches.map((m: any) => m.match)
        }));
    },

    /**
     * Create a new slip (Jornada)
     */
    createSlip: async (competitionId: string, data: { tournament_name: string, round_name: string, close_date: string, entry_cost: number }) => {
        const supabase = await createClient();
        const { data: slip, error } = await supabase
            .from('prode_slips')
            .insert([{
                ...data,
                competition_id: competitionId,
                status: 'open'
            }])
            .select()
            .single();

        if (error) throw error;
        return slip;
    },

    /**
     * Assign matches to a slip
     */
    assignMatchesToSlip: async (slipId: string, matchIds: string[]) => {
        const supabase = await createClient();

        // 1. Delete existing links
        await supabase.from('prode_slip_matches').delete().eq('slip_id', slipId);

        // 2. Insert new ones
        if (matchIds.length === 0) return true;

        const links = matchIds.map(id => ({ slip_id: slipId, match_id: id }));
        const { error } = await supabase.from('prode_slip_matches').insert(links);

        if (error) throw error;
        return true;
    },

    /**
     * Get available matches for tournaments linked to a competition
     */
    getAvailableMatches: async (competitionId: string) => {
        const supabase = await createClient();

        // 1. Get linked tournament IDs
        const { data: links } = await supabase
            .from('competition_tournaments')
            .select('tournament_id')
            .eq('competition_id', competitionId);

        const tournamentIds = links?.map(l => l.tournament_id) || [];
        if (tournamentIds.length === 0) return [];

        // 2. Get matches
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .in('tournament_id', tournamentIds)
            .order('match_date', { ascending: true });

        if (error) throw error;
        return data;
    }
};
