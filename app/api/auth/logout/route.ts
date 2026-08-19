import { NextResponse } from 'next/server';
import { COOKIE_NAME, revokeAllSessions } from '@/lib/auth';

export async function POST() {
  // Invalidate all sessions server-side
  revokeAllSessions();

  const response = NextResponse.json({ success: true, message: 'Logged out securely' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
