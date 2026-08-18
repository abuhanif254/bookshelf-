import { NextResponse } from 'next/server';
import { getCategories, saveCategory, deleteCategory, getAdSettings } from '@/lib/db';

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
    const body = await request.json();
    const { passcode, category } = body;

    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    if (!category || !category.name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const saved = saveCategory({
      id: category.id || slug,
      name: category.name,
      slug,
      badge: category.badge || 'General',
      seoTitle: category.seoTitle || `Free ${category.name} PDF Books | Bookshelf`,
      seoDesc: category.seoDesc || `Download verified free ${category.name} PDF books and toolkits with instant direct delivery.`,
      h1: category.h1 || `Free ${category.name} PDF Books & Handbooks`,
      intro: category.intro || `Explore our curated collection of free ${category.name} books and practical guides.`,
    });

    return NextResponse.json({ success: true, category: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const passcode = searchParams.get('passcode');

    const currentSettings = getAdSettings();
    if (passcode !== currentSettings.adminPasscode) {
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 });
    }

    const success = deleteCategory(id);
    return NextResponse.json({ success, message: success ? 'Category deleted' : 'Category not found' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}
