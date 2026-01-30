// Services/mockData.ts (Now Persistence Bridge)
import { StorageService } from './storage';

export type PredictionValue = '1' | 'X' | '2';

export type Match = {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    finalResult?: PredictionValue; // Admin sets this
};

export type ProdeSlip = {
    id: string;
    tournamentName: string;
    roundName: string;
    closeDate: string;
    entryCost: number;
    status: 'open' | 'closed' | 'settled';
    matches: Match[];
};

export type UserPrediction = {
    userId: string;
    slipId: string;
    picks: Record<string, PredictionValue>;
    timestamp: string;
};

export type FriendTournament = {
    id: string;
    name: string;
    inviteCode: string;
    ownerUserId: string;
    createdAt: string;
};

export type FriendTournamentMember = {
    tournamentId: string;
    userId: string;
    joinedAt: string;
};

// STATIC DEFINITIONS (The fixtures themselves are hardcoded config for now, but results/picks are persistent)
const SLIP_DEFINITIONS: ProdeSlip[] = [
    {
        id: 'slip-1',
        tournamentName: 'Liga Profesional',
        roundName: 'Fecha 5',
        closeDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        entryCost: 100,
        status: 'open',
        matches: [
            { id: 'm1', homeTeam: 'River Plate', awayTeam: 'Boca Juniors', date: 'Dom 25', time: '17:00' },
            { id: 'm2', homeTeam: 'Independiente', awayTeam: 'Racing', date: 'Sab 24', time: '20:00' },
            { id: 'm3', homeTeam: 'San Lorenzo', awayTeam: 'Huracán', date: 'Sab 24', time: '18:00' },
            { id: 'm4', homeTeam: 'Vélez', awayTeam: 'Estudiantes', date: 'Vie 23', time: '21:00' },
            { id: 'm5', homeTeam: 'Talleres', awayTeam: 'Belgrano', date: 'Dom 25', time: '15:00' },
        ]
    },
    {
        id: 'slip-2',
        tournamentName: 'Champions League',
        roundName: 'Octavos - Vuelta',
        closeDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        entryCost: 250,
        status: 'open',
        matches: [
            { id: 'm6', homeTeam: 'Real Madrid', awayTeam: 'Liverpool', date: 'Mar 12', time: '16:00' },
            { id: 'm7', homeTeam: 'Man. City', awayTeam: 'Bayern Munich', date: 'Mar 12', time: '16:00' },
            { id: 'm8', homeTeam: 'PSG', awayTeam: 'Barcelona', date: 'Mie 13', time: '16:00' },
        ]
    },
    {
        id: 'slip-3',
        tournamentName: 'Copa Libertadores',
        roundName: 'Fase de Grupos - Fecha 1',
        closeDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        entryCost: 300,
        status: 'open',
        matches: [
            { id: 'm9', homeTeam: 'River Plate', awayTeam: 'Libertad', date: 'Mie 02', time: '21:30' },
            { id: 'm10', homeTeam: 'Flamengo', awayTeam: 'Millonarios', date: 'Mar 01', time: '19:00' },
            { id: 'm11', homeTeam: 'Palmeiras', awayTeam: 'San Lorenzo', date: 'Jue 03', time: '21:30' },
        ]
    },
    {
        id: 'slip-4',
        tournamentName: 'Copa Sudamericana',
        roundName: 'Fase de Grupos - Fecha 1',
        closeDate: new Date(Date.now() + 86400000 * 8).toISOString(),
        entryCost: 200,
        status: 'open',
        matches: [
            { id: 'm12', homeTeam: 'Boca Juniors', awayTeam: 'Nacional Potosí', date: 'Mie 03', time: '21:00' },
            { id: 'm13', homeTeam: 'Racing', awayTeam: 'Sp. Luqueño', date: 'Jue 04', time: '19:00' },
            { id: 'm14', homeTeam: 'Defensa y Justicia', awayTeam: 'Cesar Vallejo', date: 'Mar 02', time: '23:00' },
        ]
    },
    {
        id: 'slip-5',
        tournamentName: 'Copa Mundial',
        roundName: 'Final',
        closeDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        entryCost: 1000,
        status: 'open',
        matches: [
            { id: 'm15', homeTeam: 'Argentina', awayTeam: 'Francia', date: 'Dom 18', time: '12:00' },
        ]
    }
];

export const MOCK_SLIPS = SLIP_DEFINITIONS; // Keep export for UI compatibility

export const getSlipById = (id: string): ProdeSlip | undefined => {
    const def = SLIP_DEFINITIONS.find(s => s.id === id);
    if (!def) return undefined;

    // hydrate with persistent results
    const results = StorageService.getMatchResults();
    const hydratedMatches = def.matches.map(m => ({
        ...m,
        finalResult: (results as any)[m.id] as PredictionValue || undefined
    }));

    return { ...def, matches: hydratedMatches };
};

export const savePrediction = (userId: string, slipId: string, picks: Record<string, PredictionValue>) => {
    StorageService.savePrediction({
        userId,
        slipId,
        picks,
        timestamp: new Date().toISOString()
    });
};

export const getUserPrediction = (userId: string, slipId: string): UserPrediction | undefined => {
    return StorageService.getUserPrediction(userId, slipId);
};

export const setMatchResult = (slipId: string, matchId: string, result: PredictionValue) => {
    StorageService.setMatchResult(matchId, result);
};

export const getRankingForSlip = (slipId: string) => {
    // 1. Get Slip Meta (to know entries matches)
    const slip = getSlipById(slipId);
    if (!slip) return [];

    // 2. Get All Predictions for this slip (from storage)
    const allPredictions = StorageService.getPredictions(slipId);
    const users = StorageService.getUsers(); // To map names

    // 3. Calc Scores
    return allPredictions.map((pred: any) => {
        let points = 0;
        slip.matches.forEach(match => {
            if (match.finalResult && pred.picks[match.id] === match.finalResult) {
                points += 1;
            }
        });

        const user = users.find((u: any) => u.id === pred.userId);
        const userName = user ? user.name : `Usuario ${pred.userId.substring(0, 4)}`;

        return {
            userId: pred.userId,
            userName,
            points
        };
    }).sort((a: any, b: any) => b.points - a.points);
};
