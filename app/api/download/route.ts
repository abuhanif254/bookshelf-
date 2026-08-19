import { NextResponse } from 'next/server';
import { getBookById, incrementStat, updateBook } from '@/lib/db';
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

    const book = getBookById(id);
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    // Increment downloads count for this book and global counter
    incrementStat('totalDownloads');
    incrementStat('adUnlocks');
    updateBook(id, { downloads: (book.downloads || 0) + 1 });

    // Determine target download link
    const downloadUrl = book.driveUrl
      ? getDirectDownloadUrl(book.driveUrl)
      : `https://drive.google.com/uc?export=download&id=SAMPLE_${book.slug}`;

    const safeFileName = `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)}.pdf`;

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
