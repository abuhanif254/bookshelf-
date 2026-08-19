import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bookshelf.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: ['/admin', '/admin/', '/api/', '/cart', '/account/', '/account'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
