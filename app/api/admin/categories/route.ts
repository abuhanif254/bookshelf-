import { NextResponse } from 'next/server';
import { getCategories, saveCategory, deleteCategory } from '@/lib/db';
import { isRequestAuthorized } from '@/lib/auth';
import { sanitizeString } from '@/lib/security';

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { category } = body;

    if (!category || !category.name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    const name = sanitizeString(category.name);
    const slug = (category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));

    const saved = saveCategory({
      id: sanitizeString(category.id) || slug,
      name,
      slug,
      badge: sanitizeString(category.badge) || 'General',
      seoTitle: sanitizeString(category.seoTitle) || `Free ${name} PDF Books | Bookshelf`,
      seoDesc: sanitizeString(category.seoDesc) || `Download verified free ${name} PDF books and toolkits with instant direct delivery.`,
      h1: sanitizeString(category.h1) || `Free ${name} PDF Books & Handbooks`,
      intro: sanitizeString(category.intro) || `Explore our curated collection of free ${name} books and practical guides.`,
    });

    return NextResponse.json({ success: true, category: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 });
    }

    const cleanId = sanitizeString(id);
    const success = deleteCategory(cleanId);
    return NextResponse.json({ success, message: success ? 'Category deleted' : 'Category not found' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
