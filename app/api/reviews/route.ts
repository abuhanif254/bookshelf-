import { NextResponse } from 'next/server';
import { getBookReviews, getAllReviews, addBookReview, voteReviewHelpful, deleteReview } from '@/lib/db';
import { getSupabaseReviews, addSupabaseReview } from '@/lib/supabaseDb';
import { sanitizeString } from '@/lib/security';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { isRequestAuthorized } from '@/lib/auth';

/**
 * GET /api/reviews?bookId=1
 * Return list of approved reviews for a book (or all for admin)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookIdParam = searchParams.get('bookId');
    const all = searchParams.get('all');

    if (all === 'true') {
      if (!isRequestAuthorized(request)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      const supaAll = await getSupabaseReviews();
      return NextResponse.json({ success: true, reviews: supaAll || getAllReviews() });
    }

    if (!bookIdParam) {
      return NextResponse.json({ success: false, message: 'bookId is required' }, { status: 400 });
    }

    const bookId = Number(bookIdParam);
    const supaReviews = await getSupabaseReviews(bookId);
    const reviews = supaReviews && supaReviews.length > 0 ? supaReviews : getBookReviews(bookId);
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error retrieving reviews' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Submit a new reader review
 */
export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    // Anti-spam rate limit: max 5 reviews per 15 minutes per IP
    const rateLimit = checkRateLimit(`review:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Review submission limit reached. Please wait 15 minutes.',
      }, { status: 429 });
    }

    const body = await request.json();
    const { bookId, userName, rating, title, body: reviewBody, verified } = body;

    if (!bookId || !title || !reviewBody || typeof rating !== 'number') {
      return NextResponse.json({
        success: false,
        message: 'Please complete all review fields (rating, title, and review body)',
      }, { status: 400 });
    }

    const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));
    const cleanUserName = sanitizeString(userName || 'Anonymous Reader').slice(0, 50);
    const cleanTitle = sanitizeString(title).slice(0, 100);
    const cleanBody = sanitizeString(reviewBody).slice(0, 2000);

    const reviewData = {
      bookId: Number(bookId),
      userName: cleanUserName,
      rating: cleanRating,
      title: cleanTitle,
      body: cleanBody,
      verified: Boolean(verified),
    };

    let newReview = await addSupabaseReview(reviewData);
    if (!newReview) {
      newReview = addBookReview(reviewData);
    } else {
      try { addBookReview(newReview); } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Review published successfully! Thank you for your feedback.',
      review: newReview,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ success: false, message: 'Error submitting review' }, { status: 500 });
  }
}

/**
 * PUT /api/reviews
 * Vote review as helpful
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, message: 'reviewId is required' }, { status: 400 });
    }

    const success = voteReviewHelpful(String(reviewId));
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating review' }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews
 * Admin delete review
 */
export async function DELETE(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ success: false, message: 'Review ID required' }, { status: 400 });
    }

    const success = deleteReview(reviewId);
    return NextResponse.json({ success, message: success ? 'Review deleted' : 'Review not found' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error deleting review' }, { status: 500 });
  }
}
