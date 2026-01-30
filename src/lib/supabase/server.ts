import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Note: This creates an Admin client with full privileges (Service Role).
    // Use caution when using this in Server Actions exposed to client.
    // Ensure the route/action invoking this is protected (e.g. via Middleware or Role Check).

    if (!supabaseServiceKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations may fail.');
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: {
            persistSession: false,
        }
    });
}
