import { NextResponse } from 'next/server';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { getAllBooks } from '@/lib/db';
import { getBaseUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';
export const revalidate = 43200;

const BOOKS_PER_CHUNK = 40000;

interface Props {
  params: Promise<{ index: string }> | { index: string };
}

export async function GET(_req: Request, { params }: Props) {
  const resolved =
    typeof (params as Promise<{ index: string }>)?.then === 'function'
      ? await (params as Promise<{ index: string }>)
      : (params as { index: string });

  const chunkIndex = parseInt(resolved.index, 10);
  if (isNaN(chunkIndex) || chunkIndex < 0) {
    return new NextResponse('Invalid chunk index', { status: 400 });
  }

  const baseUrl = getBaseUrl();
  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();

  const start = chunkIndex * BOOKS_PER_CHUNK;
  const chunk = allBooks.slice(start, start + BOOKS_PER_CHUNK);

  if (chunk.length === 0) {
    return new NextResponse('Chunk out of range', { status: 404 });
  }

  const urls = chunk
    .map(book => "  <url><loc>" + baseUrl + "/pdf/" + book.slug + "</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>")
    .join("\n");

  const xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + urls + "</urlset>";

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
    },
  });
}