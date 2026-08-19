import { NextResponse } from 'next/server';
import { createMagicLink, AUTHORIZED_ADMIN_EMAIL } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return NextResponse.json({
        success: false,
        message: `Unauthorized. Only ${AUTHORIZED_ADMIN_EMAIL} is allowed to access this admin panel.`,
      }, { status: 403 });
    }

    const result = createMagicLink(cleanEmail);
    if (!result.success || !result.token || !result.pin) {
      return NextResponse.json({ success: false, message: result.message || 'Failed to create login token' }, { status: 500 });
    }

    // Determine host origin for the 1-click URL
    const urlObj = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || `${urlObj.protocol}//${urlObj.host}`;
    const magicLinkUrl = `${origin}/api/auth/verify?token=${result.token}`;

    // Send email
    const emailResult = await sendMagicLinkEmail({
      to: cleanEmail,
      magicLinkUrl,
      pin: result.pin,
    });

    if (!emailResult.sent) {
      return NextResponse.json({
        success: false,
        smtpConfigured: false,
        message: 'Gmail SMTP is not configured yet. Please log in using your Secret Passcode below, or configure GMAIL_USER & GMAIL_APP_PASSWORD in .env.local to enable email links.',
      });
    }

    return NextResponse.json({
      success: true,
      smtpConfigured: true,
      message: `Security PIN and 1-click link sent to ${cleanEmail}! Please check your inbox.`,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('API POST /api/auth/magic-link error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
