import { NextResponse } from 'next/server';
import { getSectionsData, updateSectionsData } from '@/lib/db';
import { isRequestAuthorized } from '@/lib/auth';

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
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { sections } = body;

    if (!sections) {
      return NextResponse.json({ success: false, message: 'No section updates provided' }, { status: 400 });
    }

    const updated = updateSectionsData(sections);
    return NextResponse.json({ success: true, ...updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update sections' }, { status: 500 });
  }
}
