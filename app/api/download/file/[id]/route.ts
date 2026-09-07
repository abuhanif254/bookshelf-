import { NextResponse } from 'next/server';
import { getSupabaseBookById, incrementSupabaseDownloads } from '@/lib/supabaseDb';
import { getBookById, incrementStat, updateBook } from '@/lib/db';
import { extractDriveId } from '@/lib/drive';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

const WIKIMEDIA_USER_AGENT = 'BookshelfApp/1.0 (https://pdf-bookshelf.com; books@bookshelf.org)';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const resolved = typeof (params as Promise<{ id: string }>).then === 'function'
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

    const id = parseInt(resolved.id, 10);
    if (isNaN(id)) {
      return new Response('Invalid book ID', { status: 400 });
    }

    let book = await getSupabaseBookById(id);
    if (!book) {
      book = getBookById(id) || null;
    }
    if (!book) {
      return new Response('Book not found', { status: 404 });
    }

    // Increment download statistics
    incrementStat('totalDownloads');
    await incrementSupabaseDownloads(id);
    try {
      updateBook(id, { downloads: (book.downloads || 0) + 1 });
    } catch {}

    const rawUrl = (book.driveUrl || '').trim();
    if (!rawUrl) {
      return new Response('Download file not available for this book', { status: 404 });
    }

    // 1. Google Drive direct export redirect
    const driveId = extractDriveId(rawUrl);
    if (driveId) {
      return NextResponse.redirect(`https://drive.google.com/uc?export=download&id=${driveId}`, 302);
    }

    // 2. Project Gutenberg direct redirect
    if (rawUrl.includes('gutenberg.org')) {
      return NextResponse.redirect(rawUrl, 302);
    }

    // 3. Clean and prepare upstream URL
    let upstreamUrl = rawUrl.split('?')[0];

    // Language-specific routing for Wikisource Special:FilePath
    if (upstreamUrl.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
      if (book.lang === 'bn' || /[\u0980-\u09FF]/.test(upstreamUrl)) {
        upstreamUrl = upstreamUrl.replace('commons.wikimedia.org', 'bn.wikisource.org');
      } else if (book.lang === 'hi' || /[\u0900-\u097F]/.test(upstreamUrl)) {
        upstreamUrl = upstreamUrl.replace('commons.wikimedia.org', 'hi.wikisource.org');
      }
    }

    const isDjvu = upstreamUrl.toLowerCase().endsWith('.djvu');
    const ext = isDjvu ? 'djvu' : 'pdf';

    // Fetch upstream file with official User-Agent header (no Referer)
    let upstreamRes = await fetch(upstreamUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': WIKIMEDIA_USER_AGENT,
        'Accept': '*/*',
      },
    });

    // Fallback between Wikisource and Commons if initial fetch fails
    if (!upstreamRes.ok && upstreamUrl.includes('.wikisource.org/wiki/Special:FilePath/')) {
      const commonsFallback = upstreamUrl.replace(/(bn|hi)\.wikisource\.org/, 'commons.wikimedia.org');
      const fallbackRes = await fetch(commonsFallback, {
        redirect: 'follow',
        headers: { 'User-Agent': WIKIMEDIA_USER_AGENT, 'Accept': '*/*' },
      });
      if (fallbackRes.ok) {
        upstreamRes = fallbackRes;
      }
    }

    if (!upstreamRes.ok || !upstreamRes.body) {
      return new Response(`Unable to download file directly (Upstream HTTP ${upstreamRes.status}). Please try reading online.`, { status: upstreamRes.status || 502 });
    }

    // Clean safe filenames supporting Unicode (Devanagari, Bengali, Latin)
    const cleanTitle = (book.title || 'Book').replace(/[/\\?%*:|"<>]/g, '_').trim().slice(0, 100);
    const filename = `${cleanTitle}.${ext}`;
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_');

    const headers = new Headers();
    headers.set('Content-Type', isDjvu ? 'application/x-djvu' : (upstreamRes.headers.get('content-type') || 'application/pdf'));
    headers.set('Content-Disposition', `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(upstreamRes.body as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new Response('Error streaming download: ' + (error?.message || 'unknown'), { status: 500 });
  }
}
