import { NextResponse } from 'next/server';
import { getAllBooks, addBook } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { addSupabaseBook } from '@/lib/supabaseDb';
import { isRequestAuthorized } from '@/lib/auth';
import { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get('cat');
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const author = searchParams.get('author');
    const lang = searchParams.get('lang');
    const slug = searchParams.get('slug');
    const limitParam = searchParams.get('limit');
    const limit = limitParam === '0' ? 0 : Math.min(parseInt(limitParam || '24', 10), 1000);

    let query = supabase.from('books').select('*');

    if (slug) {
      query = query.eq('slug', slug);
    }
    if (cat && cat !== 'All') {
      query = query.ilike('cat', cat);
    }
    if (author) {
      query = query.ilike('author', `%${author}%`);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (lang && lang !== 'all') {
      const norm = lang.toLowerCase();
      if (norm === 'en') {
        query = query.or('lang.eq.en,lang.is.null');
      } else {
        query = query.eq('lang', norm);
      }
    }
    if (q) {
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%,cat.ilike.%${q}%`);
    }

    query = query.order('downloads', { ascending: false });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const mappedBooks: Product[] = data.map((row: any) => ({
        id: Number(row.id),
        slug: row.slug,
        title: row.title,
        sub: row.sub || '',
        author: row.author,
        cat: row.cat,
        type: row.type || 'free',
        price: Number(row.price) || 0,
        list: row.list != null ? Number(row.list) : null,
        rating: Number(row.rating) || 4.8,
        reviews: Number(row.reviews) || 250,
        pages: Number(row.pages) || 100,
        badge: row.badge || null,
        bought: row.bought || 'Instant download',
        bg: row.bg || '#0f2a43',
        fg: row.fg || '#ffffff',
        ac: row.ac || '#f59e0b',
        pat: row.pat || 'p-rings',
        blurb: row.blurb || '',
        feat: Array.isArray(row.feat) ? row.feat : (typeof row.feat === 'string' ? JSON.parse(row.feat || '[]') : []),
        desc: row.desc_html || row.desc || '',
        driveUrl: row.drive_url || '',
        coverImage: row.cover_image || '',
        coverUrl: row.cover_image || '',
        partner: row.partner || '',
        partnerUrl: row.partner_url || '',
        downloads: Number(row.downloads) || 0,
        lang: row.lang || 'en',
        createdAt: row.created_at,
      }));
      return NextResponse.json({ success: true, count: mappedBooks.length, books: mappedBooks });
    }

    // Local DB fallback
    let fallback = getAllBooks();
    if (slug) fallback = fallback.filter(b => b.slug === slug);
    if (cat && cat !== 'All') fallback = fallback.filter(b => b.cat.toLowerCase() === cat.toLowerCase());
    if (type && type !== 'all') fallback = fallback.filter(b => b.type === type);
    if (q) {
      const low = q.toLowerCase();
      fallback = fallback.filter(b => (b.title + ' ' + b.author + ' ' + b.cat).toLowerCase().includes(low));
    }
    const result = limit > 0 ? fallback.slice(0, limit) : fallback;
    return NextResponse.json({ success: true, count: result.length, books: result });
  } catch (error) {
    console.error('API GET /api/books error:', error);
    const fallback = getAllBooks();
    return NextResponse.json({ success: true, count: fallback.length, books: fallback.slice(0, 24) });
  }
}

export async function POST(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      sub,
      author,
      cat,
      type = 'free',
      price = 0,
      list = null,
      rating = 4.8,
      pages = 100,
      badge = 'Free',
      bg = '#0f2a43',
      fg = '#ffffff',
      ac = '#f59e0b',
      pat = 'p-rings',
      blurb = '',
      feat = [],
      desc = '',
      partner = '',
      partnerUrl = '',
      driveUrl = '',
      coverImage = '',
      coverUrl = '',
    } = body;

    if (!title || !author) {
      return NextResponse.json({ success: false, message: 'Title and Author are required.' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const bookData = {
      slug,
      title,
      sub: sub || 'Practical digital handbook',
      author,
      cat: cat || 'General',
      type,
      price: Number(price) || 0,
      list: list ? Number(list) : null,
      rating: Number(rating) || 4.8,
      reviews: Math.floor(Math.random() * 500) + 120,
      pages: Number(pages) || 80,
      badge: badge || (type === 'free' ? 'Free' : 'New'),
      bought: 'Instant download',
      bg: bg || '#0f2a43',
      fg: fg || '#ffffff',
      ac: ac || '#f59e0b',
      pat: pat || 'p-rings',
      blurb: blurb || title,
      feat: Array.isArray(feat) && feat.length > 0 ? feat : ['Instant PDF download', 'DRM-free for personal use', 'Clean layout for screen & print'],
      desc: desc || `<p>${title} by ${author}. Download your free PDF copy instantly.</p>`,
      partner: partner || undefined,
      partnerUrl: partnerUrl || undefined,
      driveUrl: driveUrl || undefined,
      coverImage: coverImage || coverUrl || undefined,
      coverUrl: coverUrl || coverImage || undefined,
    };

    let newBook = await addSupabaseBook(bookData);
    if (!newBook) {
      newBook = addBook(bookData);
    } else {
      // Also sync to local DB cache
      try { addBook(newBook); } catch {}
    }

    return NextResponse.json({ success: true, book: newBook }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/books error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create book.' }, { status: 500 });
  }
}
