import { NextResponse } from 'next/server';
import { addSubscriber, getSubscribers } from '@/lib/db';
import { addSupabaseSubscriber } from '@/lib/supabaseDb';
import { isRequestAuthorized } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isValidEmail } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`subscribe:${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Too many subscription attempts. Please try again later.',
      }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'A valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    await addSupabaseSubscriber(cleanEmail);
    const result = addSubscriber(cleanEmail);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const subscribers = getSubscribers();
    return NextResponse.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
