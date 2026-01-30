import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually without dotenv
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.local not found');
        return;
    }
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            process.env[key] = value;
        }
    });
}

loadEnv();

async function check() {
    console.log('Testing Supabase Connection...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing env vars:', { url: !!supabaseUrl, key: !!supabaseServiceKey });
        return;
    }

    console.log('URL:', supabaseUrl);

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Try a simple select
        console.log('Attempting to fetch tournaments count...');
        const { count, error } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Connection verified.');
            console.log('Tournaments Count:', count);
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

check();
