
interface ApiFixtureResponse {
    fixture: {
        id: number;
        timezone: string;
        date: string;
        timestamp: number;
        status: {
            long: string;
            short: string;
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        season: number;
        round: string;
    };
    teams: {
        home: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        };
        away: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    score: {
        halftime: { home: number | null; away: number | null };
        fulltime: { home: number | null; away: number | null };
        extratime: { home: number | null; away: number | null };
        penalty: { home: number | null; away: number | null };
    };
}

interface ApiResponseBody {
    get: string;
    parameters: Record<string, any>;
    errors: Record<string, any> | any[];
    results: number;
    paging: { current: number; total: number };
    response: ApiFixtureResponse[];
}

export const apiFootballService = {
    async getFixtures(leagueId: number, season: number): Promise<ApiFixtureResponse[]> {
        const apiKey = process.env.API_FOOTBALL_KEY;
        const host = 'v3.football.api-sports.io';

        if (!apiKey) {
            throw new Error('API_FOOTBALL_KEY is not defined in environment variables');
        }

        const url = `https://${host}/fixtures?league=${leagueId}&season=${season}`;

        console.log(`Fetching fixtures from ${url}`); // Debug log

        const res = await fetch(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': host
            },
            next: { revalidate: 3600 } // Cache for 1 hour by default
        });

        if (!res.ok) {
            throw new Error(`API-Football request failed: ${res.status} ${res.statusText}`);
        }

        const data: ApiResponseBody = await res.json();

        // API-Football sometimes returns errors in the body with 200 OK
        if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
            console.error('API-Football Errors:', data.errors);
            // Depending on the error (e.g. rate limit), we might want to throw or just return empty
            throw new Error('API-Football returned errors: ' + JSON.stringify(data.errors));
        }

        return data.response;
    },

    async getFixtureById(fixtureId: number): Promise<ApiFixtureResponse | null> {
        const apiKey = process.env.API_FOOTBALL_KEY;
        const host = 'v3.football.api-sports.io';

        if (!apiKey) throw new Error('API_FOOTBALL_KEY missing');

        const url = `https://${host}/fixtures?id=${fixtureId}`;
        const res = await fetch(url, {
            headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': host },
            next: { revalidate: 60 } // Shorter cache for individual match updates
        });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const data: ApiResponseBody = await res.json();
        if (data.results === 0) return null;

        return data.response[0];
    }
};
