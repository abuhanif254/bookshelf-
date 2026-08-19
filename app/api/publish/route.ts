import { NextResponse } from 'next/server';
import { addCreatorSubmission, getCreatorSubmissions, approveCreatorSubmission, rejectCreatorSubmission } from '@/lib/db';
import { isRequestAuthorized } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeString, isValidHttpUrl, isValidEmail, sanitizeUrl } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // Rate limit: 10 submissions per 60 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`publish:${clientIp}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Too many submissions. Please wait before submitting another book.',
      }, { status: 429 });
    }

    const body = await request.json();
    const { title, sub, author, authorEmail, cat, pages, driveUrl, blurb, desc, bg, ac, pat } = body;

    const cleanTitle = sanitizeString(title);
    const cleanAuthor = sanitizeString(author);
    const cleanDriveUrl = (driveUrl || '').trim();

    if (!cleanTitle || !cleanAuthor || !cleanDriveUrl) {
      return NextResponse.json({ success: false, message: 'Title, Author, and Google Drive URL are required' }, { status: 400 });
    }

    if (!isValidHttpUrl(cleanDriveUrl)) {
      return NextResponse.json({ success: false, message: 'Please provide a valid HTTP/HTTPS Google Drive URL' }, { status: 400 });
    }

    const cleanEmail = authorEmail && isValidEmail(authorEmail) ? authorEmail.trim().toLowerCase() : 'author@example.com';
    const cleanPages = Math.min(5000, Math.max(1, Number(pages) || 80));

    const submission = addCreatorSubmission({
      title: cleanTitle,
      sub: sanitizeString(sub) || 'Practical digital guide',
      author: cleanAuthor,
      authorEmail: cleanEmail,
      cat: sanitizeString(cat) || 'Productivity',
      pages: cleanPages,
      driveUrl: cleanDriveUrl,
      blurb: sanitizeString(blurb) || cleanTitle,
      desc: desc ? String(desc).slice(0, 5000) : `<p>${cleanTitle} by ${cleanAuthor}.</p>`,
      bg: sanitizeString(bg) || '#0f2a43',
      ac: sanitizeString(ac) || '#f59e0b',
      pat: sanitizeString(pat) || 'p-rings',
    });

    return NextResponse.json({
      success: true,
      message: 'Your PDF book was submitted successfully! Our editorial team reviews submissions within 24 hours.',
      submission,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Submission failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const submissions = getCreatorSubmissions();
    return NextResponse.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to retrieve submissions' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, message: 'Submission ID is required' }, { status: 400 });
    }

    const cleanId = sanitizeString(id);

    if (action === 'approve') {
      const newBook = approveCreatorSubmission(cleanId);
      if (!newBook) return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Book approved and published to catalog!', book: newBook });
    } else if (action === 'reject') {
      const success = rejectCreatorSubmission(cleanId);
      return NextResponse.json({ success, message: 'Submission rejected.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Action failed' }, { status: 500 });
  }
}
