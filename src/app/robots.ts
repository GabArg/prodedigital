import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/dashboard/private/'],
        },
        sitemap: 'https://prode.digital/sitemap.xml', // Replace with env var if possible
    }
}
