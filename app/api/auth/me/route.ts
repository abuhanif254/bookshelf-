import { NextResponse } from 'next/server';
import { isRequestAuthorized, AUTHORIZED_ADMIN_EMAIL } from '@/lib/auth';

export async function GET(request: Request) {
  const isAuth = isRequestAuthorized(request);
  if (!isAuth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: AUTHORIZED_ADMIN_EMAIL,
  });
}
