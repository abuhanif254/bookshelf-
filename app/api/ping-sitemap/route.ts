import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handlePing();
}

export async function POST() {
  return handlePing();
}

async function handlePing() {
  try {
    const baseUrl = getBaseUrl();
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    const pingTargets = [
      { engine: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
      { engine: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    ];

    const results = await Promise.allSettled(
      pingTargets.map(async target => {
        const res = await fetch(target.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BookshelfBot/1.0; +https://bookshelf.app)',
          },
        });
        return {
          engine: target.engine,
          status: res.status,
          ok: res.ok || res.status < 400,
        };
      })
    );

    const reports = results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        engine: pingTargets[i].engine,
        status: 500,
        ok: false,
      };
    });

    return NextResponse.json({
      success: true,
      sitemapUrl,
      pings: reports,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Failed to ping search engines',
    }, { status: 500 });
  }
}
