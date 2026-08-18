import { NextResponse } from 'next/server';
import { getBookById, updateBook, deleteBook } from '@/lib/db';

interface Params {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const resolved = typeof (params as Promise<{ id: string }>)?.then === 'function'
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = parseInt(resolved.id, 10);
    const book = getBookById(id);

    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, book });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error retrieving book' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const resolved = typeof (params as Promise<{ id: string }>)?.then === 'function'
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = parseInt(resolved.id, 10);
    const updates = await request.json();

    const updated = updateBook(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, book: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating book' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const resolved = typeof (params as Promise<{ id: string }>)?.then === 'function'
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });
    const id = parseInt(resolved.id, 10);
    const success = deleteBook(id);

    if (!success) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error deleting book' }, { status: 500 });
  }
}
