import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og', '/api/sitemap-books/'],
        disallow: [
          '/admin',
          '/admin/',
          '/cart',
          '/account',
          '/account/',
          '/ad-frame',
          '/api/',
          '/*?*q=',
          '/*?*sort=',
          '/*?*price=',
          '/*?*rate=',
          '/*?*pages=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
