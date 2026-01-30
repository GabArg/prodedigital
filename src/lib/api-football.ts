export type APIMatchStatus = {
    long: string;
    short: string;
    elapsed: number | null;
};

export type APITeam = {
    id: number;
    name: string;
    logo: string;
    winner: boolean | null;
};

export type APIGoals = {
    home: number | null;
    away: number | null;
};

export type APIFixtureResponse = {
    fixture: {
        id: number;
        referee: string | null;
        timezone: string;
        date: string;
        timestamp: number;
        periods: {
            first: number | null;
            second: number | null;
        };
        venue: {
            id: number | null;
            name: string;
            city: string;
        };
        status: APIMatchStatus;
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        flag: string | null;
        season: number;
        round: string;
    };
    teams: {
        home: APITeam;
        away: APITeam;
    };
    goals: APIGoals;
    score: {
        halftime: APIGoals;
        fulltime: APIGoals;
        extratime: APIGoals;
        penalty: APIGoals;
    };
};

const BASE_URL = 'https://v3.football.api-sports.io';

async function apiFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    if (!API_KEY) {
        throw new Error('API_FOOTBALL_KEY is not defined in environment variables');
    }

    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
    });

    console.log("Using API Key:", API_KEY ? `${API_KEY.substring(0, 5)}...` : "UNDEFINED");

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'x-apisports-key': API_KEY,
        },
        next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Football Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
        console.error('API-Football Logic Error:', data.errors);
        throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
    }

    return data.response as T;
}

export const apiFootball = {
    /**
     * Fetch fixtures for a specific league and season
     */
    getFixtures: async (leagueId: number, season: number, from?: string, to?: string) => {
        const params: Record<string, string | number> = {
            league: leagueId,
            season: season,
        };

        if (from && to) {
            params.from = from;
            params.to = to;
        }

        return apiFetch<APIFixtureResponse[]>('/fixtures', params);
    },

    /**
     * Get details for a specific fixture (useful for live updates)
     */
    getFixtureById: async (fixtureId: number) => {
        const results = await apiFetch<APIFixtureResponse[]>('/fixtures', { id: fixtureId });
        return results[0] || null;
    }
};
