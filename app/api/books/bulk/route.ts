import { NextResponse } from 'next/server';
import { addSupabaseBooksBulk } from '@/lib/supabaseDb';
import { isRequestAuthorized } from '@/lib/auth';
import { Product } from '@/lib/products';

export async function POST(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.books || !Array.isArray(body.books)) {
      return NextResponse.json({ success: false, message: 'Invalid payload. Expected an array of books.' }, { status: 400 });
    }

    const booksToInsert: Omit<Product, 'id'>[] = body.books.map((b: any) => {
      const title = b.title || 'Untitled Book';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      return {
        slug,
        title,
        sub: b.sub || 'Practical digital handbook',
        author: b.author || 'Unknown',
        cat: b.cat || 'General',
        type: b.type || 'free',
        price: Number(b.price) || 0,
        list: b.list ? Number(b.list) : null,
        rating: Number(b.rating) || 4.8,
        reviews: Math.floor(Math.random() * 500) + 120,
        pages: Number(b.pages) || 80,
        badge: b.badge || (b.type === 'free' ? 'Free' : 'New'),
        bought: 'Instant download',
        bg: b.bg || '#0f2a43',
        fg: b.fg || '#ffffff',
        ac: b.ac || '#f59e0b',
        pat: b.pat || 'p-rings',
        blurb: b.blurb || title,
        feat: Array.isArray(b.feat) && b.feat.length > 0 ? b.feat : ['Instant PDF download', 'DRM-free for personal use', 'Clean layout for screen & print'],
        desc: b.desc || `<p>${title} by ${b.author || 'Unknown'}. Download your free PDF copy instantly.</p>`,
        driveUrl: b.driveUrl || b.driveurl || '',
        coverImage: b.coverImage || b.coverimage || '',
        partner: b.partner || '',
        partnerUrl: b.partnerUrl || b.partnerurl || '',
      };
    });

    const result = await addSupabaseBooksBulk(booksToInsert);

    if (result) {
      return NextResponse.json({ success: true, count: result.length, books: result });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to insert books into database.' }, { status: 500 });
    }
  } catch (error) {
    console.error('API POST /api/books/bulk error:', error);
    return NextResponse.json({ success: false, message: 'Server error processing bulk upload.' }, { status: 500 });
  }
}
