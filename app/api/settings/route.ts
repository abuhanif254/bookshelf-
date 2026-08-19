import { NextResponse } from 'next/server';
import { getAdSettings, updateAdSettings, incrementStat, getDatabase } from '@/lib/db';
import { isRequestAuthorized, createSessionToken, AUTHORIZED_ADMIN_EMAIL, COOKIE_NAME, revokeAllSessions } from '@/lib/auth';
import { timingSafeStringEqual, sanitizeString } from '@/lib/security';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET() {
  try {
    const settings = getAdSettings();
    const { adminPasscode, ...safeSettings } = settings;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error retrieving settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode, newPasscode, updates, action } = body;

    // Public stats increment
    if (action === 'increment-impression') {
      incrementStat('adImpressions');
      return NextResponse.json({ success: true });
    }
    if (action === 'increment-unlock') {
      incrementStat('adUnlocks');
      incrementStat('totalDownloads');
      return NextResponse.json({ success: true });
    }

    const clientIp = getClientIp(request);
    const isAuth = isRequestAuthorized(request);
    const currentSettings = getAdSettings();
    const targetPasscode = process.env.ADMIN_PASSCODE || currentSettings.adminPasscode || 'bookshelf2026';
    const matchesPasscode = timingSafeStringEqual(passcode, targetPasscode);

    // If trying to authenticate with passcode and not already authorized, apply rate limiting
    if (!isAuth) {
      const rateLimit = checkRateLimit(`login_passcode:${clientIp}`, 5, 15 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json({
          success: false,
          message: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
        }, { status: 429 });
      }

      if (!matchesPasscode) {
        return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
      }
    }

    // Prepare response
    let responseData: Record<string, any> = { success: true, message: 'Authenticated successfully' };

    // Export entire database JSON
    if (action === 'export-db') {
      const fullDb = getDatabase();
      responseData = { success: true, db: fullDb };
    }

    // Change admin passcode
    if (newPasscode) {
      const cleanPasscode = sanitizeString(newPasscode);
      if (cleanPasscode.length < 6) {
        return NextResponse.json({ success: false, message: 'New passcode must be at least 6 characters' }, { status: 400 });
      }
      updateAdSettings({ adminPasscode: cleanPasscode });
      // Invalidate all existing sessions on password change
      revokeAllSessions();
      responseData = { success: true, message: 'Passcode updated successfully. All other sessions have been logged out.' };
    }

    // General settings updates
    if (updates) {
      const updated = updateAdSettings(updates);
      const { adminPasscode, ...safe } = updated;
      responseData = { success: true, settings: safe };
    }

    const res = NextResponse.json(responseData);

    // If logging in with passcode, issue 30-day signed HttpOnly session cookie
    if (matchesPasscode) {
      const sessionToken = createSessionToken(AUTHORIZED_ADMIN_EMAIL);
      res.cookies.set({
        name: COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating settings' }, { status: 500 });
  }
}
