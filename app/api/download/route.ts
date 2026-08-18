import { NextResponse } from 'next/server';
import { getBookById, incrementStat, updateBook } from '@/lib/db';
import { getDirectDownloadUrl } from '@/lib/drive';

export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();
    const id = parseInt(bookId, 10);
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

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: `${book.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      title: book.title,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to process download link' }, { status: 500 });
  }
}
