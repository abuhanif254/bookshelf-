import { NextResponse } from 'next/server';
import { getAdSettings, updateAdSettings, incrementStat, getDatabase } from '@/lib/db';

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

    // Verify admin passcode
    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    // Export entire database JSON
    if (action === 'export-db') {
      const fullDb = getDatabase();
      return NextResponse.json({ success: true, db: fullDb });
    }

    // Change admin passcode
    if (newPasscode) {
      if (newPasscode.length < 6) {
        return NextResponse.json({ success: false, message: 'New passcode must be at least 6 characters' }, { status: 400 });
      }
      updateAdSettings({ adminPasscode: newPasscode });
      return NextResponse.json({ success: true, message: 'Passcode updated successfully' });
    }

    // General settings updates
    if (updates) {
      const updated = updateAdSettings(updates);
      const { adminPasscode, ...safe } = updated;
      return NextResponse.json({ success: true, settings: safe });
    }

    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating settings' }, { status: 500 });
  }
}
