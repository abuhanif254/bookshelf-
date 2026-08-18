import { NextResponse } from 'next/server';
import { addSubscriber, getSubscribers, getAdSettings } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    const result = addSubscriber(email);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to subscribe' }, { status: 500 });
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

    const subscribers = getSubscribers();
    return NextResponse.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
