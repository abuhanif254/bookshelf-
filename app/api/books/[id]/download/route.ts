import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(_req: Request, { params }: RouteContext) {
  const resolved = typeof (params as Promise<{ id: string }>).then === 'function'
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });

  const idNum = parseInt(resolved.id, 10);
  if (isNaN(idNum)) return NextResponse.json({ success: false }, { status: 400 });

  try {
    const { data: book } = await supabase.from('books').select('downloads').eq('id', idNum).single();
    if (book) {
      await supabase.from('books').update({ downloads: (book.downloads || 0) + 1 }).eq('id', idNum);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}