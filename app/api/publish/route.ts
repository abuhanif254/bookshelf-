import { NextResponse } from 'next/server';
import { addCreatorSubmission, getCreatorSubmissions, approveCreatorSubmission, rejectCreatorSubmission, getAdSettings } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, sub, author, authorEmail, cat, pages, driveUrl, blurb, desc, bg, ac, pat } = body;

    if (!title || !author || !driveUrl) {
      return NextResponse.json({ success: false, message: 'Title, Author, and Google Drive URL are required' }, { status: 400 });
    }

    const submission = addCreatorSubmission({
      title,
      sub: sub || 'Practical digital guide',
      author,
      authorEmail: authorEmail || 'author@example.com',
      cat: cat || 'Productivity',
      pages: Number(pages) || 80,
      driveUrl,
      blurb: blurb || title,
      desc: desc || `<p>${title} by ${author}.</p>`,
      bg: bg || '#0f2a43',
      ac: ac || '#f59e0b',
      pat: pat || 'p-rings',
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
    const { searchParams } = new URL(request.url);
    const passcode = searchParams.get('passcode');

    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const submissions = getCreatorSubmissions();
    return NextResponse.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to retrieve submissions' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { passcode, id, action } = body;

    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'approve') {
      const newBook = approveCreatorSubmission(id);
      if (!newBook) return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Book approved and published to catalog!', book: newBook });
    } else if (action === 'reject') {
      const success = rejectCreatorSubmission(id);
      return NextResponse.json({ success, message: 'Submission rejected.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Action failed' }, { status: 500 });
  }
}
