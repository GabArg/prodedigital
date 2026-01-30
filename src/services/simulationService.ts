import { CompetitionDB, ProdeSlipDB, UserPredictionDB } from './dataService';

// --- MOCK DATA ---
const MOCK_USERS = [
    { id: 'user-1', name: 'ProdeMaster', alias: 'ProdeMaster', email: 'master@demo.com', role: 'admin', credits: 1500, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProdeMaster', isProfileComplete: true, birthDate: '1990-01-01', nationality: 'Argentina', nickname: 'ProdeMaster', favoriteTeam: 'Boca Juniors' },
    { id: 'user-2', name: 'FutbolFan', alias: 'FutbolFan', email: 'fan@demo.com', role: 'user', credits: 800, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FutbolFan', isProfileComplete: true, birthDate: '1995-05-05', nationality: 'Argentina', nickname: 'FutbolFan', favoriteTeam: 'River Plate' },
    { id: 'user-3', name: 'LaBestia', alias: 'LaBestia', email: 'bestia@demo.com', role: 'user', credits: 200, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LaBestia', isProfileComplete: true, birthDate: '2000-10-10', nationality: 'Argentina', nickname: 'LaBestia', favoriteTeam: 'Racing Club' },
];

const MOCK_COMPETITIONS: CompetitionDB[] = [
    { id: 'comp-1', name: 'Liga Profesional 2026', slug: 'liga-2026' },
    { id: 'comp-2', name: 'Copa del Mundo 2026', slug: 'mundial' },
];

const MOCK_SLIPS: ProdeSlipDB[] = [
    {
        id: 'fecha-1-2026',
        tournament_name: 'Torneo Apertura 2026',
        round_name: 'Fecha 1',
        close_date: '2026-01-25T21:00:00Z',
        entry_cost: 200,
        status: 'open',
        competition_id: 'comp-1',
        matches: [
            { id: 'm-f1-1', slip_id: 'fecha-1-2026', home_team: 'Barracas Central', away_team: 'River Plate', start_time: '2026-01-24T18:00:00Z', final_result: '2' },
            { id: 'm-f1-2', slip_id: 'fecha-1-2026', home_team: 'Independiente', away_team: 'Estudiantes LP', start_time: '2026-01-23T18:00:00Z', final_result: 'X' },
            { id: 'm-f1-3', slip_id: 'fecha-1-2026', home_team: 'San Lorenzo', away_team: 'Lanús', start_time: '2026-01-23T16:00:00Z', final_result: '2' },
            { id: 'm-f1-4', slip_id: 'fecha-1-2026', home_team: 'Gimnasia LP', away_team: 'Racing Club', start_time: '2026-01-24T20:00:00Z', final_result: '1' },
            { id: 'm-f1-5', slip_id: 'fecha-1-2026', home_team: 'Talleres', away_team: 'Newells', start_time: '2026-01-23T20:00:00Z', final_result: '1' },
            { id: 'm-f1-6', slip_id: 'fecha-1-2026', home_team: 'Rosario Central', away_team: 'Belgrano', start_time: '2026-01-24T21:00:00Z', final_result: '2' },
            { id: 'm-f1-7', slip_id: 'fecha-1-2026', home_team: 'Boca Juniors', away_team: 'Deportivo Riestra', start_time: '2026-01-25T18:30:00Z' },
            { id: 'm-f1-8', slip_id: 'fecha-1-2026', home_team: 'Argentinos Jrs', away_team: 'Sarmiento', start_time: '2026-01-25T21:00:00Z' },
            { id: 'm-f1-9', slip_id: 'fecha-1-2026', home_team: 'Tigre', away_team: 'Estudiantes (RC)', start_time: '2026-01-25T21:00:00Z' },
            { id: 'm-f1-10', slip_id: 'fecha-1-2026', home_team: 'Instituto', away_team: 'Vélez Sarsfield', start_time: '2026-01-22T18:00:00Z', final_result: '2' },
        ]
    },
    {
        id: 'fecha-2-2026',
        tournament_name: 'Torneo Apertura 2026',
        round_name: 'Fecha 2',
        close_date: '2026-02-01T21:00:00Z',
        entry_cost: 200,
        status: 'open',
        competition_id: 'comp-1',
        matches: [
            { id: 'm-f2-1', slip_id: 'fecha-2-2026', home_team: 'River Plate', away_team: 'Independiente', start_time: '2026-01-31T18:00:00Z' },
            { id: 'm-f2-2', slip_id: 'fecha-2-2026', home_team: 'Estudiantes LP', away_team: 'San Lorenzo', start_time: '2026-01-31T20:00:00Z' },
            { id: 'm-f2-3', slip_id: 'fecha-2-2026', home_team: 'Lanús', away_team: 'Gimnasia LP', start_time: '2026-02-01T17:00:00Z' },
            { id: 'm-f2-4', slip_id: 'fecha-2-2026', home_team: 'Racing Club', away_team: 'Talleres', start_time: '2026-02-01T19:00:00Z' },
            { id: 'm-f2-5', slip_id: 'fecha-2-2026', home_team: 'Newells', away_team: 'Rosario Central', start_time: '2026-02-01T21:00:00Z' },
            { id: 'm-f2-6', slip_id: 'fecha-2-2026', home_team: 'Belgrano', away_team: 'Boca Juniors', start_time: '2026-02-02T18:00:00Z' },
            { id: 'm-f2-7', slip_id: 'fecha-2-2026', home_team: 'Dep. Riestra', away_team: 'Argentinos Jrs', start_time: '2026-02-02T20:00:00Z' },
            { id: 'm-f2-8', slip_id: 'fecha-2-2026', home_team: 'Sarmiento', away_team: 'Tigre', start_time: '2026-02-03T18:00:00Z' },
            { id: 'm-f2-9', slip_id: 'fecha-2-2026', home_team: 'Estudiantes RC', away_team: 'Instituto', start_time: '2026-02-03T20:00:00Z' },
            { id: 'm-f2-10', slip_id: 'fecha-2-2026', home_team: 'Vélez Sarsfield', away_team: 'Platense', start_time: '2026-02-01T17:00:00Z' },
            { id: 'm-f2-11', slip_id: 'fecha-2-2026', home_team: 'Huracán', away_team: 'Banfield', start_time: '2026-02-02T19:00:00Z' },
            { id: 'm-f2-12', slip_id: 'fecha-2-2026', home_team: 'Godoy Cruz', away_team: 'Central Córdoba', start_time: '2026-01-31T17:00:00Z' },
            { id: 'm-f2-13', slip_id: 'fecha-2-2026', home_team: 'Defensa y Justicia', away_team: 'Atl. Tucumán', start_time: '2026-01-31T19:00:00Z' },
            { id: 'm-f2-14', slip_id: 'fecha-2-2026', home_team: 'Unión', away_team: 'Indep. Rivadavia', start_time: '2026-02-02T17:00:00Z' },
            { id: 'm-f2-15', slip_id: 'fecha-2-2026', home_team: 'Aldosivi', away_team: 'Barracas Central', start_time: '2026-02-03T19:00:00Z' }
        ]
    },
    {
        id: 'mundial-f1-2026',
        tournament_name: 'Copa del Mundo 2026',
        round_name: 'Fase de Grupos - Fecha 1',
        close_date: '2026-06-11T13:00:00Z',
        entry_cost: 0,
        status: 'open',
        competition_id: 'comp-2',
        matches: [
            { id: 'm-wc-1', slip_id: 'mundial-f1-2026', home_team: 'Argentina', away_team: 'Arabia Saudita', start_time: '2026-06-11T16:00:00Z' },
            { id: 'm-wc-2', slip_id: 'mundial-f1-2026', home_team: 'Brasil', away_team: 'Serbia', start_time: '2026-06-12T16:00:00Z' },
            { id: 'm-wc-3', slip_id: 'mundial-f1-2026', home_team: 'Francia', away_team: 'Australia', start_time: '2026-06-12T20:00:00Z' },
            { id: 'm-wc-4', slip_id: 'mundial-f1-2026', home_team: 'España', away_team: 'Costa Rica', start_time: '2026-06-13T16:00:00Z' },
            { id: 'm-wc-5', slip_id: 'mundial-f1-2026', home_team: 'Alemania', away_team: 'Japón', start_time: '2026-06-13T19:00:00Z' }
        ]
    }
];

const MOCK_GROUPS = [
    {
        id: 'group-2026',
        name: 'Prode Oficial 2026',
        invite_code: 'AP2026',
        owner_user_id: 'user-1',
        competitions: [MOCK_COMPETITIONS[0]],
        is_public: true,
        prizes_info: { grand_prize: 'Camiseta Oficial a elección', round_prize: 'Carga de Créditos' },
        members: [
            { userId: 'user-1', name: 'ProdeMaster', joinedAt: new Date().toISOString(), avatarUrl: MOCK_USERS[0].avatarUrl, status: 'active' },
            { userId: 'user-2', name: 'FutbolFan', joinedAt: new Date().toISOString(), avatarUrl: MOCK_USERS[1].avatarUrl, status: 'active' },
        ]
    }
];

const MOCK_PREDICTIONS: UserPredictionDB[] = [];
let MOCK_MESSAGES: any[] = [];

export const SimulationService = {
    getCompetitions: async () => MOCK_COMPETITIONS,
    getSlips: async () => MOCK_SLIPS,
    getUpcomingMatchesGrouped: async () => MOCK_SLIPS, // Reuse MOCK_SLIPS for simulation as they match structure
    getSlipById: async (id: string) => MOCK_SLIPS.find(s => s.id === id) || null,

    submitPrediction: async (slipId: string, picks: any, cost: number, tournamentName: string, userId?: string): Promise<{ success: boolean; error?: string }> => {
        const targetUserId = userId || 'user-1';
        const existingIndex = MOCK_PREDICTIONS.findIndex(p => p.user_id === targetUserId && p.slip_id === slipId);
        if (existingIndex >= 0) MOCK_PREDICTIONS[existingIndex] = { ...MOCK_PREDICTIONS[existingIndex], picks, created_at: new Date().toISOString() };
        else MOCK_PREDICTIONS.push({ id: `p-${Date.now()}`, user_id: targetUserId, slip_id: slipId, picks, created_at: new Date().toISOString() });
        return { success: true };
    },

    getUserPrediction: async (userId: string, slipId: string) => {
        return MOCK_PREDICTIONS.find(p => p.user_id === userId && p.slip_id === slipId) || null;
    },

    getMyGroups: async (userId: string) => {
        return MOCK_GROUPS.filter(g => g.members.some(m => m.userId === userId && m.status === 'active'))
            .map(g => ({
                id: g.id,
                name: g.name,
                inviteCode: g.invite_code,
                ownerUserId: g.owner_user_id,
                joinedAt: new Date().toISOString()
            }));
    },

    createGroup: async (name: string, userId: string, compIds: string[], isPublic: boolean) => {
        const newGroup = {
            id: `group-${Date.now()}`,
            name,
            invite_code: Math.random().toString(36).substring(7).toUpperCase(),
            owner_user_id: userId,
            is_public: isPublic,
            prizes_info: {},
            competitions: MOCK_COMPETITIONS.filter(c => compIds.includes(c.id)),
            members: [{ userId, name: 'ProdeMaster', joinedAt: new Date().toISOString(), status: 'active', avatarUrl: MOCK_USERS[0].avatarUrl }]
        };
        MOCK_GROUPS.push(newGroup as any);
        return newGroup;
    },

    getGroupDetails: async (groupId: string) => {
        const g = MOCK_GROUPS.find(g => g.id === groupId);
        if (!g) return null;
        return { ...g, members: g.members.filter(m => m.status === 'active') };
    },

    joinGroup: async (code: string, userId: string) => {
        const group = MOCK_GROUPS.find(g => g.invite_code === code);
        if (!group) throw new Error("Código inválido");
        return true;
    },

    getSimulatedUser: (email?: string) => {
        return email ? MOCK_USERS.find(u => u.email === email) : MOCK_USERS[0];
    },

    getGroupActiveSlips: async (groupId: string) => {
        const group = MOCK_GROUPS.find(g => g.id === groupId);
        if (!group) return [];
        const compIds = group.competitions.map(c => c.id);
        return MOCK_SLIPS.filter(s => compIds.includes(s.competition_id || '') && s.status === 'open');
    },

    getGroupRanking: async (groupId: string, competitionId?: string, slipId?: string) => {
        const group = MOCK_GROUPS.find(g => g.id === groupId);
        if (!group) return [];
        let members = group.members.filter(m => m.status === 'active');
        return members.map(m => ({
            userId: m.userId,
            userName: m.name,
            avatarUrl: m.avatarUrl,
            points: 10 // Mock points for start of season
        })).sort((a, b) => b.points - a.points);
    },

    getGroupWinnersHistory: async (groupId: string) => [],
    getGroupMessages: async (groupId: string) => [],
    sendGroupMessage: async (groupId: string, userId: string, content: string) => true,
    getPendingMembers: async (groupId: string) => [],
    approveMember: async (groupId: string, userId: string) => true,
    rejectMember: async (groupId: string, userId: string) => true,
    updateGroupPrizes: async (groupId: string, prizes: any) => true
};
