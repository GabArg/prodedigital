export type PredictionValue = '1' | 'X' | '2';

export interface CompetitionDB {
    id: string;
    name: string;
    slug: string;
}

export interface MatchDB {
    id: string;
    slip_id: string;
    home_team: string;
    away_team: string;
    start_time: string;
    final_result?: string;
}

export interface ProdeSlipDB {
    id: string;
    tournament_name: string;
    round_name: string;
    close_date: string;
    entry_cost: number;
    status: 'open' | 'closed' | 'settled';
    matches?: MatchDB[]; // Hydrated
    competition_id?: string;
}

export interface UserPredictionDB {
    id: string;
    user_id: string;
    slip_id: string;
    picks: Record<string, string>; // match_id -> result
    created_at: string;
}
