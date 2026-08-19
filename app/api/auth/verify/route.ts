import { NextResponse } from 'next/server';
import { verifyMagicTokenOrPin, COOKIE_NAME } from '@/lib/auth';

/**
 * Handle 1-Click Link from Email (GET /api/auth/verify?token=...)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/admin?error=missing_token', request.url));
  }

  const result = verifyMagicTokenOrPin(token);
  if (!result.success || !result.sessionToken) {
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(result.message || 'invalid_token')}`, request.url));
  }

  // Set secure 30-day session cookie and redirect to admin
  const response = NextResponse.redirect(new URL('/admin?login=success', request.url));
  response.cookies.set({
    name: COOKIE_NAME,
    value: result.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}

/**
 * Handle 6-Digit PIN or Token submission via AJAX (POST /api/auth/verify)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, pin } = body;
    const identifier = token || pin;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ success: false, message: 'PIN or token is required' }, { status: 400 });
    }

    const result = verifyMagicTokenOrPin(identifier);
    if (!result.success || !result.sessionToken) {
      return NextResponse.json({ success: false, message: result.message || 'Verification failed' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      email: result.email,
      message: 'Login successful! Welcome back Mohammad.',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('API POST /api/auth/verify error:', error);
    return NextResponse.json({ success: false, message: 'Verification error' }, { status: 500 });
  }
}
