import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllBooks } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';

// force-dynamic so the book list is always fresh from Supabase
export const dynamic = 'force-dynamic';

const BOOKS_PER_CHUNK = 40000;

interface RouteContext {
  params: Promise<{ index: string }> | { index: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const resolved =
    typeof (params as Promise<{ index: string }>)?.then === 'function'
      ? await (params as Promise<{ index: string }>)
      : (params as { index: string });

  const chunkIndex = parseInt(resolved.index, 10);
  if (isNaN(chunkIndex) || chunkIndex < 0) {
    return new NextResponse('Invalid chunk index', { status: 400 });
  }

  const baseUrl = getBaseUrl();
  const start = chunkIndex * BOOKS_PER_CHUNK;
  const end = start + BOOKS_PER_CHUNK - 1;

  let chunk: { slug: string; created_at?: string }[] = [];
  try {
    const { data, error } = await supabase
      .from('books')
      .select('slug, created_at')
      .order('id', { ascending: true })
      .range(start, end);

    if (!error && data && data.length > 0) {
      chunk = data;
    }
  } catch {}

  if (chunk.length === 0 && chunkIndex === 0) {
    chunk = getAllBooks().slice(start, start + BOOKS_PER_CHUNK).map(b => ({
      slug: b.slug,
      created_at: b.createdAt,
    }));
  }

  if (chunk.length === 0) {
    return new NextResponse('Chunk out of range', { status: 404 });
  }

  const urlTags = chunk
    .map((
      book
    ) => '<url><loc>' + baseUrl + '/pdf/' + book.slug + '</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>')
    .join('');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urlTags +
    '</urlset>';

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
    },
  });
}
