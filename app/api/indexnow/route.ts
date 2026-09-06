import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/url';
import { getSupabaseRecentBooks } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

const DEFAULT_INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'e4d7a8b92c104e76a54f9810dc3b589a';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let urlList: string[] = Array.isArray(body.urls) ? body.urls : [];

    const baseUrl = getBaseUrl();
    const host = new URL(baseUrl).hostname;

    // If no URLs provided in payload, automatically gather recent book URLs
    if (urlList.length === 0) {
      const recentBooks = await getSupabaseRecentBooks(100);
      if (recentBooks && recentBooks.length > 0) {
        urlList = recentBooks.map(b => `${baseUrl}/pdf/${b.slug}`);
      } else {
        urlList = [`${baseUrl}/`, `${baseUrl}/library`];
      }
    }

    // Limit batch to 10,000 URLs per IndexNow specification
    urlList = urlList.slice(0, 10000);

    const payload = {
      host,
      key: DEFAULT_INDEXNOW_KEY,
      keyLocation: `${baseUrl}/${DEFAULT_INDEXNOW_KEY}.txt`,
      urlList,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok || res.status === 200 || res.status === 202,
      status: res.status,
      submittedCount: urlList.length,
      host,
      message: res.status === 200 || res.status === 202
        ? `Successfully submitted ${urlList.length} URLs to IndexNow search engine network`
        : `IndexNow returned HTTP ${res.status}`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Failed to submit URLs to IndexNow',
    }, { status: 500 });
  }
}
