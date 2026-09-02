import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og', '/api/sitemap-books/'],
        disallow: ['/admin', '/admin/', '/api/', '/cart', '/account/', '/account'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
