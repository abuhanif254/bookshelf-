import { NextResponse } from 'next/server';
import { getSupabaseBooksPaginated } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const cat = searchParams.get('cat') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'newest';

    const result = await getSupabaseBooksPaginated({ page, limit, search, cat, type, sort });
    
    if (!result) {
      return NextResponse.json({ success: false, message: 'Failed to fetch books' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      ...result 
    });
  } catch (error) {
    console.error('API GET /api/books/paginated error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
