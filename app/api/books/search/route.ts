import { NextResponse } from 'next/server';
import { getAllBooks } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { cleanTitle } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const cat = searchParams.get('cat');
    const type = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '7', 10), 1), 20);

    // Fast lightweight column selection
    let query = supabase
      .from('books')
      .select('id, slug, title, sub, author, cat, type, price, list, rating, reviews, badge, bg, fg, ac, downloads, cover_image');

    if (cat && cat !== 'All' && cat !== 'All PDFs') {
      query = query.ilike('cat', cat);
    }
    if (type && type !== 'all' && type !== 'All') {
      query = query.eq('type', type);
    }

    if (q) {
      // Sanitize input to prevent SQL LIKE wildcard manipulation
      const sanitized = q.replace(/[%_]/g, ' ').trim();
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,author.ilike.%${sanitized}%`);
      }
    }

    query = query.order('downloads', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const results = data.map((row: any) => ({
        id: Number(row.id),
        slug: row.slug,
        title: cleanTitle(row.title || ''),
        sub: row.sub || '',
        author: row.author || 'Unknown Author',
        cat: row.cat || 'General',
        type: row.type || 'free',
        price: Number(row.price) || 0,
        list: row.list != null ? Number(row.list) : null,
        rating: Number(row.rating) || 4.8,
        reviews: Number(row.reviews) || 120,
        badge: row.badge || null,
        bg: row.bg || '#0f2a43',
        fg: row.fg || '#ffffff',
        ac: row.ac || '#f59e0b',
        coverImage: row.cover_image || '',
        downloads: Number(row.downloads) || 0,
      }));

      return NextResponse.json(
        { success: true, count: results.length, books: results },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // Local DB fallback if Supabase table is empty or error
    let fallback = getAllBooks();
    if (cat && cat !== 'All' && cat !== 'All PDFs') {
      fallback = fallback.filter(b => b.cat?.toLowerCase() === cat.toLowerCase());
    }
    if (type && type !== 'all' && type !== 'All') {
      fallback = fallback.filter(b => b.type === type);
    }
    if (q) {
      const low = q.toLowerCase();
      fallback = fallback.filter(b =>
        (b.title + ' ' + b.author + ' ' + b.cat).toLowerCase().includes(low)
      );
    }

    const results = fallback.slice(0, limit).map(b => ({
      id: b.id,
      slug: b.slug,
      title: cleanTitle(b.title || ''),
      sub: b.sub || '',
      author: b.author || 'Unknown Author',
      cat: b.cat || 'General',
      type: b.type || 'free',
      price: b.price || 0,
      list: b.list || null,
      rating: b.rating || 4.8,
      reviews: b.reviews || 120,
      badge: b.badge || null,
      bg: b.bg || '#0f2a43',
      fg: b.fg || '#ffffff',
      ac: b.ac || '#f59e0b',
      coverImage: b.coverImage || b.coverUrl || '',
      downloads: b.downloads || 0,
    }));

    return NextResponse.json({ success: true, count: results.length, books: results });
  } catch (err: any) {
    console.error('API GET /api/books/search error:', err);
    return NextResponse.json({ success: false, error: err.message, books: [] }, { status: 500 });
  }
}
