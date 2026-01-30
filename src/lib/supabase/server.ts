import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
    // Fallback constants for Build Time to prevent crashes
    // Netlify build might proceed without environment variables loaded in some contexts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    // Note: This creates an Admin client with full privileges (Service Role).
    // Use caution when using this in Server Actions exposed to client.
    // Ensure the route/action invoking this is protected (e.g. via Middleware or Role Check).

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations may fail (OK during build).');
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
        }
    });
}
