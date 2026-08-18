import { NextResponse } from 'next/server';
import { getSectionsData, updateSectionsData, getAdSettings } from '@/lib/db';

export async function GET() {
  try {
    const data = getSectionsData();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode, sections } = body;

    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    if (!sections) {
      return NextResponse.json({ success: false, message: 'No section updates provided' }, { status: 400 });
    }

    const updated = updateSectionsData(sections);
    return NextResponse.json({ success: true, ...updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update sections' }, { status: 500 });
  }
}
