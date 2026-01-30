import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://prode.digital' // Ideally from env

    // Static Routes
    const routes = [
        '',
        '/login',
        '/register',
        '/rankings',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic Competitions (Public & Active only)
    const competitions: MetadataRoute.Sitemap = [];

    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('competitions')
            .select('id, updated_at')
            .eq('type', 'public')
            .eq('status', 'active');

        if (data) {
            competitions.push(...data.map((comp) => ({
                url: `${baseUrl}/play/${comp.id}`,
                lastModified: new Date(comp.updated_at || new Date()),
                changeFrequency: 'hourly' as const,
                priority: 0.9,
            })));
        }
    } catch (e) {
        console.error('Sitemap Error:', e);
    }

    return [...routes, ...competitions]
}
