import { NextResponse } from 'next/server';
import { getBookById, incrementStat, updateBook } from '@/lib/db';
import { getSupabaseBookById, incrementSupabaseDownloads } from '@/lib/supabaseDb';
import { getDirectDownloadUrl } from '@/lib/drive';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`download:${clientIp}`, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Download rate limit reached. Please wait a minute before downloading more titles.',
      }, { status: 429 });
    }

    const { bookId } = await request.json();
    const id = parseInt(bookId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid book ID' }, { status: 400 });
    }

    // Attempt retrieval from Supabase first, then local DB fallback
    let book = await getSupabaseBookById(id);
    if (!book) {
      book = getBookById(id) || null;
    }
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    // Increment downloads count for this book and global counter
    incrementStat('totalDownloads');
    incrementStat('adUnlocks');
    await incrementSupabaseDownloads(id);
    try {
      updateBook(id, { downloads: (book.downloads || 0) + 1 });
    } catch {}

    // Determine target download link: route through our secure streaming download endpoint
    const downloadUrl = `/api/download/file/${book.id}`;

    // Clean filename while preserving Bengali, Arabic/Urdu, Devanagari, CJK, and standard characters
    const safeFileName = `${book.title.replace(/[^\w\s\u0600-\u06FF\u0980-\u09FF\u0900-\u097F\u4e00-\u9fa5-]/g, '_').trim().slice(0, 80)}.pdf`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: safeFileName,
      title: book.title,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to process download link' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || searchParams.get('bookId');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing book ID' }, { status: 400 });
  }
  return NextResponse.redirect(new URL(`/api/download/file/${id}`, request.url));
}
