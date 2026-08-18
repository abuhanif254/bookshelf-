import { NextResponse } from 'next/server';
import { trackReferralClick, getReferralCount, incrementStat } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { refCode } = await request.json();
    if (!refCode) {
      return NextResponse.json({ success: false, message: 'Referral code is required' }, { status: 400 });
    }

    const count = trackReferralClick(refCode);
    const isVipUnlocked = count >= 3;

    if (isVipUnlocked && count === 3) {
      incrementStat('vipReferralUnlocks');
    }

    return NextResponse.json({
      success: true,
      refCode,
      count,
      isVipUnlocked,
      remaining: Math.max(0, 3 - count),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to process referral' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refCode = searchParams.get('refCode');

    if (!refCode) {
      return NextResponse.json({ success: false, message: 'Referral code is required' }, { status: 400 });
    }

    const count = getReferralCount(refCode);
    const isVipUnlocked = count >= 3;

    return NextResponse.json({
      success: true,
      refCode,
      count,
      isVipUnlocked,
      remaining: Math.max(0, 3 - count),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to get referral status' }, { status: 500 });
  }
}
