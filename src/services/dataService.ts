import { supabase } from '@/lib/supabase';
import { SimulationService } from '@/services/simulationService';
import { trackEventAction } from '@/app/actions/analytics';
import { PredictionValue, CompetitionDB, MatchDB, ProdeSlipDB, UserPredictionDB } from './types';

export type { PredictionValue, CompetitionDB, MatchDB, ProdeSlipDB, UserPredictionDB };

const IS_SIMULATION = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true';

const SupabaseDataService = {
    async getClient() {
        // We use dynamic import to avoid issues in client components if this service is imported there
        const { createClient } = await import('@/lib/supabase/server');
        return await createClient();
    },

    // --- COMPETITIONS ---
    getCompetitions: async (): Promise<CompetitionDB[]> => {
        const supabase = await SupabaseDataService.getClient();
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .order('name');

        if (error) {
            console.error(error);
            return [];
        }
        return data || [];
    },

    // --- SLIPS & MATCHES ---

    getSlips: async (): Promise<ProdeSlipDB[]> => {
        const supabase = await SupabaseDataService.getClient();
        // Fetch slips
        const { data: slips, error } = await supabase
            .from('prode_slips')
            .select('*')
            .order('close_date', { ascending: true });

        if (error) {
            console.error('Error fetching slips:', error);
            return [];
        }

        // Fetch Matches for these slips
        const slipIds = slips.map(s => s.id);
        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .in('slip_id', slipIds);

        // Hydrate
        return slips.map(slip => ({
            ...slip,
            matches: matches?.filter(m => m.slip_id === slip.id) || []
        }));
    },

    getUpcomingMatchesGrouped: async (): Promise<ProdeSlipDB[]> => {
        const supabase = await SupabaseDataService.getClient();
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const { data: matches, error } = await supabase
            .from('matches')
            .select(`
                *,
                tournaments (name, id)
            `)
            .gte('start_time', yesterday)
            .order('start_time', { ascending: true });

        if (error || !matches) {
            if (error) console.error('[getUpcomingMatchesGrouped] Error:', error);
            return [];
        }

        const groups: Record<string, ProdeSlipDB> = {};

        matches.forEach((m: any) => {
            if (!m.tournament_id || !m.round_name) return;

            const key = `${m.tournament_id}_::_VIRTUAL_::_${m.round_name}`;
            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    tournament_name: m.tournaments?.name || 'Torneo',
                    round_name: m.round_name,
                    close_date: m.start_time,
                    entry_cost: 0,
                    status: 'open',
                    matches: []
                };
            }
            groups[key].matches?.push(m);
        });

        return Object.values(groups)
            .filter(g => g.matches && g.matches.length > 0)
            .sort((a, b) => new Date(a.close_date).getTime() - new Date(b.close_date).getTime());
    },

    getSlipById: async (id: string): Promise<ProdeSlipDB | null> => {
        const supabase = await SupabaseDataService.getClient();

        if (id.includes('_::_VIRTUAL_::_') || id.includes('_%3A%3A_VIRTUAL_%3A%3A_')) {
            // 1. Attempt invalid URL decoding correction
            let decodedId = id;
            if (id.includes('%') || id.includes('_%3A%3A_')) {
                try {
                    decodedId = decodeURIComponent(id);
                } catch (e) {
                    console.error('Error decoding ID:', id, e);
                }
            }

            const [tournamentId, , rawRoundName] = decodedId.split('_::_');
            const roundName = rawRoundName ? decodeURIComponent(rawRoundName).trim() : '';

            const { data: matches, error: qError } = await supabase
                .from('matches')
                .select(`
                    *,
                    tournaments (name)
                `)
                .eq('tournament_id', tournamentId)
                .ilike('round_name', roundName)
                .order('start_time', { ascending: true });

            if (qError) console.error('[getSlipById] Query Error:', qError);

            let finalMatches = matches || [];

            // Fallback: If direct query fails, try finding in all grouped matches
            if (finalMatches.length === 0) {
                console.log(`[Debug] getSlipById: Direct query failed for ID: "${id}"`);
                const allSlips = await SupabaseDataService.getUpcomingMatchesGrouped();

                // 1. Try exact match
                let found = allSlips.find(s => s.id === id);

                // 2. Try normalized match (collapse multiple spaces)
                if (!found) {
                    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
                    const targetNorm = normalize(id);
                    console.log(`[Debug] No exact match. targetNorm="${targetNorm}"`);

                    found = allSlips.find(s => normalize(s.id) === targetNorm);

                    if (!found) {
                        if (!found) {
                            // 3. Try fuzzy match (Starts With / Contains)
                            // logic: if `targetNorm` is "Regular Season - 202" and DB is "Regular Season - 2".
                            const potentials = allSlips.filter(s => {
                                const sNorm = normalize(s.id);
                                // Check if DB ID is prefix of Input (Input validation loose)
                                if (targetNorm.startsWith(sNorm)) return true;
                                // Check if Input is prefix of DB ID (Truncated Input)
                                if (sNorm.startsWith(targetNorm)) return true;
                                return false;
                            });

                            if (potentials.length === 1) {
                                found = potentials[0];
                                console.log(`[Debug] Fuzzy match found: "${found.id}"`);
                            } else if (potentials.length > 1) {
                                // Prefer the one that matches length closest?
                                // For now just pick first or log ambiguity
                                found = potentials[0];
                                console.log(`[Debug] Multiple fuzzy matches. Picked first: "${found.id}"`);
                            }
                        }
                    }
                }

                if (found) {
                    return found;
                }
                console.log(`[Debug] Slip NOT found. Available IDs sample:`, allSlips.slice(0, 3).map(s => s.id));
                return null;
            }

            const firstMatch = finalMatches[0];
            return {
                id: id,
                tournament_name: firstMatch.tournaments?.name || 'Torneo',
                round_name: roundName,
                close_date: firstMatch.start_time,
                entry_cost: 0,
                status: 'open',
                matches: finalMatches
            };
        }

        const { data: slip, error } = await supabase
            .from('prode_slips')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !slip) return null;

        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .eq('slip_id', id);

        return {
            ...slip,
            matches: matches || []
        };
    },

    // --- PLAY ---

    submitPrediction: async (
        slipId: string,
        picks: Record<string, string>,
        entryCost: number,
        slipName: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.rpc('play_prode_slip', {
                p_slip_id: slipId,
                p_picks: picks,
                p_cost: entryCost,
                p_description: `Participación: ${slipName}`
            });

            if (error) throw error;
            return { success: true };
        } catch (err: any) {
            console.error('Submit Error:', err);
            return { success: false, error: err.message || 'Error al procesar la jugada' };
        }
    },

    getUserPrediction: async (userId: string, slipId: string): Promise<UserPredictionDB | null> => {
        const { data, error } = await supabase
            .from('user_predictions')
            .select('*')
            .eq('user_id', userId)
            .eq('slip_id', slipId)
            .maybeSingle();

        return data || null;
    },

    // --- FRIENDS TOURNAMENTS ---

    getMyGroups: async (userId: string) => {
        // Join: Members -> Tournaments
        const { data, error } = await supabase
            .from('friend_tournament_members')
            .select(`
                tournament_id,
                joined_at,
                friend_tournaments (
                    id, name, invite_code, owner_user_id
                )
            `)
            .eq('user_id', userId)
        // .eq('status', 'active'); // Assuming only active members show up in 'My Groups' or we filter in UI

        if (error) {
            console.error(error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.friend_tournaments.id,
            name: item.friend_tournaments.name,
            inviteCode: item.friend_tournaments.invite_code,
            ownerUserId: item.friend_tournaments.owner_user_id,
            joinedAt: item.joined_at
        }));
    },

    createGroup: async (name: string, userId: string, competitionIds: string[], isPublic: boolean = false) => {
        // 1. Create Tournament
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data: tournament, error } = await supabase
            .from('friend_tournaments')
            .insert([{
                name,
                invite_code: inviteCode,
                owner_user_id: userId,
                is_public: isPublic
            }])
            .select()
            .single();

        if (error) throw error;

        // 2. Add Owner as Member (Active)
        await supabase.from('friend_tournament_members').insert([{
            tournament_id: tournament.id,
            user_id: userId,
            status: 'active'
        }]);

        // 3. Link Competitions
        if (competitionIds && competitionIds.length > 0) {
            const pivotData = competitionIds.map(compId => ({
                friend_tournament_id: tournament.id,
                competition_id: compId
            }));
            await supabase.from('friend_tournament_competitions').insert(pivotData);
        }

        if (!IS_SIMULATION) {
            trackEventAction('friends_tournament_created', {
                is_public: isPublic,
                competitions_count: competitionIds?.length || 0
            }, tournament.id);
        }

        return tournament;
    },

    joinGroup: async (code: string, userId: string) => {
        // 1. Find by code
        const { data: tournament } = await supabase
            .from('friend_tournaments')
            .select('id, is_public')
            .eq('invite_code', code)
            .single();

        if (!tournament) throw new Error('Código inválido');

        // 2. Insert Member
        const status = tournament.is_public ? 'active' : 'pending';

        const { error } = await supabase
            .from('friend_tournament_members')
            .insert([{
                tournament_id: tournament.id,
                user_id: userId,
                status: status
            }]);

        if (error) {
            if (error.code === '23505') throw new Error('Ya has solicitado unirte a este grupo');
            throw error;
        }

        if (!IS_SIMULATION) {
            trackEventAction('friends_tournament_joined', {
                status: status
            }, tournament.id);
        }

        return true;
    },

    getGroupDetails: async (groupId: string) => {
        const { data: tournament, error } = await supabase
            .from('friend_tournaments')
            .select('*')
            .eq('id', groupId)
            .single();

        if (error) return null;

        // Get Members (Active Only for public view)
        const { data: members } = await supabase
            .from('friend_tournament_members')
            .select(`
                joined_at,
                user_id,
                status,
                profiles (
                   name, avatar_url, alias
                )
            `)
            .eq('tournament_id', groupId)
            .eq('status', 'active');

        // Get Linked Competitions
        const { data: competitions } = await supabase
            .from('friend_tournament_competitions')
            .select(`
                competition_id,
                competitions (id, name, slug)
            `)
            .eq('friend_tournament_id', groupId);

        const comps = competitions?.map((c: any) => c.competitions) || [];

        return {
            ...tournament,
            members: members?.map((m: any) => ({
                userId: m.user_id,
                joinedAt: m.joined_at,
                name: m.profiles?.alias || m.profiles?.name || 'Usuario',
                avatarUrl: m.profiles?.avatar_url,
                status: m.status
            })) || [],
            competitions: comps
        };
    },

    // --- ADMIN METHODS (Prizes & Approvals) ---

    updateGroupPrizes: async (groupId: string, prizes: any) => {
        const { error } = await supabase
            .from('friend_tournaments')
            .update({ prizes_info: prizes })
            .eq('id', groupId);
        return !error;
    },

    getPendingMembers: async (groupId: string) => {
        const { data: members } = await supabase
            .from('friend_tournament_members')
            .select(`
                joined_at,
                user_id,
                profiles (
                   name, avatar_url, alias
                )
            `)
            .eq('tournament_id', groupId)
            .eq('status', 'pending');

        return members?.map((m: any) => ({
            userId: m.user_id,
            joinedAt: m.joined_at,
            name: m.profiles?.alias || m.profiles?.name || 'Usuario',
            avatarUrl: m.profiles?.avatar_url
        })) || [];
    },

    approveMember: async (groupId: string, userId: string) => {
        const { error } = await supabase
            .from('friend_tournament_members')
            .update({ status: 'active' })
            .eq('tournament_id', groupId)
            .eq('user_id', userId);
        return !error;
    },

    rejectMember: async (groupId: string, userId: string) => {
        const { error } = await supabase
            .from('friend_tournament_members')
            .delete()
            .eq('tournament_id', groupId)
            .eq('user_id', userId);
        return !error;
    },

    // --- RANKINGS ---

    getRanking: async (slipId: string) => {
        // 1. Fetch Matches with Results
        const { data: matches } = await supabase
            .from('matches')
            .select('id, final_result')
            .eq('slip_id', slipId)
            .not('final_result', 'is', null);

        if (!matches || matches.length === 0) return [];

        // 2. Fetch All Predictions for this Slip
        const { data: predictions } = await supabase
            .from('user_predictions')
            .select(`
                user_id,
                picks,
                profiles (
                   name, avatar_url, alias
                )
            `)
            .eq('slip_id', slipId);

        if (!predictions) return [];

        // 3. Calculate Scores
        const leaderboard = predictions.map((p: any) => {
            let points = 0;
            const picks = p.picks as Record<string, string>;

            matches.forEach(m => {
                if (m.final_result && picks[m.id] === m.final_result) {
                    points += 1; // 1 Point per correct guess
                }
            });

            return {
                userId: p.user_id,
                userName: p.profiles?.alias || p.profiles?.name || 'Usuario',
                avatarUrl: p.profiles?.avatar_url,
                points
            };
        });

        // 4. Sort DESC
        return leaderboard.sort((a, b) => b.points - a.points);
    },

    getGroupRanking: async (groupId: string, competitionId?: string, slipId?: string) => {
        // 1. Get Group Members (Active only)
        const { data: members } = await supabase
            .from('friend_tournament_members')
            .select('user_id')
            .eq('tournament_id', groupId)
            .eq('status', 'active');

        if (!members || members.length === 0) return [];
        const memberIds = members.map(m => m.user_id);

        // 2. Resolve target slips
        let query = supabase.from('prode_slips').select('id');

        if (slipId) {
            // Filter by specific slip ("Winner of the Date")
            query = query.eq('id', slipId);
        } else if (competitionId) {
            // Filter by Competition
            query = query.eq('competition_id', competitionId);
        }

        const { data: slips } = await query;
        if (!slips || slips.length === 0) return [];
        const slipIds = slips.map(s => s.id);

        // 3. Fetch Matches with Results
        const { data: matches } = await supabase
            .from('matches')
            .select('id, final_result, slip_id')
            .in('slip_id', slipIds)
            .not('final_result', 'is', null);

        if (!matches || matches.length === 0) return [];

        // 4. Fetch Predictions
        const { data: predictions } = await supabase
            .from('user_predictions')
            .select(`
                user_id,
                picks,
                slip_id,
                profiles (
                   name, avatar_url, alias
                )
            `)
            .in('user_id', memberIds)
            .in('slip_id', slipIds);

        if (!predictions) return [];

        // 5. Aggregate
        const userScores: Record<string, any> = {};

        predictions.forEach((p: any) => {
            if (!userScores[p.user_id]) {
                userScores[p.user_id] = {
                    userId: p.user_id,
                    userName: p.profiles?.alias || p.profiles?.name || 'Usuario',
                    avatarUrl: p.profiles?.avatar_url,
                    points: 0
                };
            }

            const picks = p.picks as Record<string, string>;
            const slipMatches = matches.filter(m => m.slip_id === p.slip_id);

            slipMatches.forEach(m => {
                if (m.final_result && picks[m.id] === m.final_result) {
                    userScores[p.user_id].points += 1;
                }
            });
        });

        return Object.values(userScores).sort((a: any, b: any) => b.points - a.points);
    },

    // --- HISTORY ---
    getGroupWinnersHistory: async (groupId: string) => {
        const { data: comps } = await supabase
            .from('friend_tournament_competitions')
            .select('competition_id')
            .eq('friend_tournament_id', groupId);

        if (!comps || comps.length === 0) return [];
        const compIds = comps.map(c => c.competition_id);

        const { data: slips } = await supabase
            .from('prode_slips')
            .select('*')
            .in('competition_id', compIds)
            .in('status', ['closed', 'settled'])
            .order('close_date', { ascending: false });

        if (!slips || slips.length === 0) return [];

        const history = [];

        for (const slip of slips) {
            const leaderboard = await SupabaseDataService.getGroupRanking(groupId, undefined, slip.id);
            if (leaderboard.length > 0) {
                const winner = leaderboard[0];
                history.push({
                    slipId: slip.id,
                    slipName: `${slip.tournament_name} - ${slip.round_name}`,
                    winnerName: winner.userName,
                    winnerAvatar: winner.avatarUrl,
                    points: winner.points
                });
            }
        }

        return history;
    },

    // --- CHAT ---
    getGroupMessages: async (groupId: string) => {
        const { data, error } = await supabase
            .from('friend_tournament_messages')
            .select(`
                id, content, created_at, user_id,
                profiles (name, alias, avatar_url)
            `)
            .eq('tournament_id', groupId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) return [];

        return data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.created_at,
            userId: msg.user_id,
            userName: msg.profiles?.alias || msg.profiles?.name || 'Usuario',
            avatarUrl: msg.profiles?.avatar_url
        }));
    },

    sendGroupMessage: async (groupId: string, userId: string, content: string) => {
        const { error } = await supabase
            .from('friend_tournament_messages')
            .insert([{
                tournament_id: groupId,
                user_id: userId,
                content
            }]);
        return !error;
    },

    // --- GROUP PLAY ---
    getGroupActiveSlips: async (groupId: string) => {
        // 1. Get Group's Competition IDs
        const { data: comps } = await supabase
            .from('friend_tournament_competitions')
            .select('competition_id')
            .eq('friend_tournament_id', groupId);

        if (!comps || comps.length === 0) return [];
        const compIds = comps.map(c => c.competition_id);

        // 2. Get Open Slips for these Competitions
        const { data: slips } = await supabase
            .from('prode_slips')
            .select('*')
            .in('competition_id', compIds)
            .eq('status', 'open')
            .order('close_date', { ascending: true });

        return slips || [];
    }
};

// EXPORT EITHER REAL OR MOCK
export const DataService = IS_SIMULATION ? SimulationService : SupabaseDataService;
