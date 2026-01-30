// Services/storage.ts

/**
 * This service mimics a database client (like Supabase) but uses LocalStorage.
 * It ensures data persistence across reloads.
 */

export const DB_KEYS = {
    USERS: 'prode_users',
    TRANSACTIONS: 'prode_transactions',
    PREDICTIONS: 'prode_predictions',
    MATCHES: 'prode_matches', // To store results updates
    SESSION: 'prode_session',
    FRIEND_TOURNAMENTS: 'prode_friend_tournaments',
    FRIEND_MEMBERS: 'prode_friend_members'
};

// --- Mock Initial Data Seeding ---
const SEED_USERS = [
    { id: 'admin-1', name: 'Admin User', email: 'admin@prode.com', role: 'admin', credits: 10000, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' }
];

export const StorageService = {
    // Generic Get
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    },

    // Generic Set
    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    },

    // --- User Methods ---
    getUsers: () => StorageService.get(DB_KEYS.USERS, SEED_USERS),

    saveUser: (user: any) => {
        const users = StorageService.getUsers();
        const index = users.findIndex((u: any) => u.id === user.id);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        StorageService.set(DB_KEYS.USERS, users);
    },

    findUserByEmail: (email: string) => {
        const users = StorageService.getUsers();
        return users.find((u: any) => u.email === email);
    },

    // --- Transaction Methods ---
    getTransactions: (userId: string) => {
        const txs = StorageService.get<any[]>(DB_KEYS.TRANSACTIONS, []);
        return txs.filter((t: any) => t.userId === userId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    addTransaction: (tx: any) => {
        const txs = StorageService.get<any[]>(DB_KEYS.TRANSACTIONS, []);
        txs.push(tx);
        StorageService.set(DB_KEYS.TRANSACTIONS, txs);
    },

    // --- Prediction Methods ---
    getPredictions: (slipId: string) => {
        const preds = StorageService.get<any[]>(DB_KEYS.PREDICTIONS, []);
        return preds.filter((p: any) => p.slipId === slipId);
    },

    getUserPrediction: (userId: string, slipId: string) => {
        const preds = StorageService.get<any[]>(DB_KEYS.PREDICTIONS, []);
        return preds.find((p: any) => p.userId === userId && p.slipId === slipId);
    },

    savePrediction: (prediction: any) => {
        const preds = StorageService.get<any[]>(DB_KEYS.PREDICTIONS, []);
        const index = preds.findIndex((p: any) => p.userId === prediction.userId && p.slipId === prediction.slipId);
        if (index >= 0) {
            preds[index] = prediction;
        } else {
            preds.push(prediction);
        }
        StorageService.set(DB_KEYS.PREDICTIONS, preds);
    },

    // --- Match Results (persistence for Admin) ---
    getMatchResults: () => {
        return StorageService.get<Record<string, string>>(DB_KEYS.MATCHES, {}); // Map matchId -> result
    },

    setMatchResult: (matchId: string, result: string) => {
        const results = StorageService.getMatchResults();
        results[matchId] = result;
        StorageService.set(DB_KEYS.MATCHES, results);
    },

    // --- Friend Tournaments ---
    createFriendTournament: (name: string, ownerUserId: string) => {
        const tournaments = StorageService.get<any[]>(DB_KEYS.FRIEND_TOURNAMENTS, []);
        const id = 'ft-' + Date.now();
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newTournament = {
            id,
            name,
            inviteCode,
            ownerUserId,
            createdAt: new Date().toISOString()
        };

        tournaments.push(newTournament);
        StorageService.set(DB_KEYS.FRIEND_TOURNAMENTS, tournaments);

        // Auto-join owner
        StorageService.joinFriendTournament(id, ownerUserId);

        return newTournament;
    },

    joinFriendTournament: (tournamentId: string, userId: string) => {
        const members = StorageService.get<any[]>(DB_KEYS.FRIEND_MEMBERS, []);
        // Check if already member
        if (members.some((m: any) => m.tournamentId === tournamentId && m.userId === userId)) return;

        members.push({
            tournamentId,
            userId,
            joinedAt: new Date().toISOString()
        });
        StorageService.set(DB_KEYS.FRIEND_MEMBERS, members);
    },

    getFriendTournaments: (userId: string) => {
        const members = StorageService.get<any[]>(DB_KEYS.FRIEND_MEMBERS, []);
        const myMemberships = members.filter((m: any) => m.userId === userId);
        const allTournaments = StorageService.get<any[]>(DB_KEYS.FRIEND_TOURNAMENTS, []);

        return allTournaments.filter((t: any) =>
            myMemberships.some((m: any) => m.tournamentId === t.id)
        );
    },

    getTournamentByCode: (code: string) => {
        const allTournaments = StorageService.get<any[]>(DB_KEYS.FRIEND_TOURNAMENTS, []);
        return allTournaments.find((t: any) => t.inviteCode === code);
    },

    getTournamentMembers: (tournamentId: string) => {
        const members = StorageService.get<any[]>(DB_KEYS.FRIEND_MEMBERS, []);
        const users = StorageService.getUsers();

        return members
            .filter((m: any) => m.tournamentId === tournamentId)
            .map((m: any) => {
                const user = users.find((u: any) => u.id === m.userId);
                return {
                    ...m,
                    user // Hydrate user info
                };
            });
    }
};
