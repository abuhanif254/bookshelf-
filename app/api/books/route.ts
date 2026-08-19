import { NextResponse } from 'next/server';
import { getAllBooks, addBook } from '@/lib/db';
import { extractDriveId } from '@/lib/drive';
import { isRequestAuthorized } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get('cat');
    const q = searchParams.get('q');
    const type = searchParams.get('type');

    let books = getAllBooks();

    if (cat) {
      books = books.filter(b => b.cat.toLowerCase() === cat.toLowerCase());
    }
    if (type) {
      books = books.filter(b => b.type === type);
    }
    if (q) {
      const query = q.toLowerCase();
      books = books.filter(b => (b.title + ' ' + b.author + ' ' + b.cat + ' ' + b.sub).toLowerCase().includes(query));
    }

    return NextResponse.json({ success: true, count: books.length, books });
  } catch (error) {
    console.error('API GET /api/books error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch books' }, { status: 500 });
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

    const newBook = addBook({
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
    });

    return NextResponse.json({ success: true, book: newBook }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/books error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create book.' }, { status: 500 });
  }
}
