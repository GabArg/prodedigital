import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing. Check .env.local (Using placeholders for build)');
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

// Type definitions ensuring Strict Separation
export type TransactionType = 'load' | 'play'; // No 'reward' mixing money/points

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string; // references auth.users
                    email: string;
                    name: string;
                    credits: number; // CR only
                    avatar_url: string;
                    role: 'user' | 'admin';
                };
            };
            wallet_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number; // Signed integer (+/-)
                    type: TransactionType;
                    description: string;
                    created_at: string;
                };
            };
            ranking_entries: {
                Row: {
                    user_id: string;
                    points: number; // PTS only
                    // No credits field here
                };
            };
        };
    };
}
