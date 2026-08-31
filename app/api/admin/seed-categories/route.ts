import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isRequestAuthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-\$)+/g, '');
}

function capitalize(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Builds SEO metadata for one category. Deterministic - safe to re-run.
function buildCategoryMeta(name: string, count: number) {
  const cap = capitalize(name);
  const slug = toSlug(name);
  return {
    id: slug,
    name: cap,
    slug,
    seo_title: 'Free ' + cap + ' PDF Books - Download Instantly | Bookshelf',
    h1: 'Free ' + cap + ' PDF Books & Guides',
    intro:
      'Browse our collection of ' +
      (count > 1 ? count + ' ' : '') +
      'free ' + name.toLowerCase() + ' books, guides, and resources available as'
      + ' instant PDF downloads. No registration required - 100% free on Bookshelf.',
  };
}

// POST /api/admin/seed-categories
// Upserts SEO fields for every category that is missing them.
// Categories that already have seo_title are skipped.
export async function POST(request: Request) {
  if (!isRequestAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { data: bookRows, error: bookErr } = await supabase.from('books').select('cat');
    if (bookErr || !bookRows) {
      return NextResponse.json({ success: false, message: 'Failed to fetch books.' }, { status: 500 });
    }
    const catCount: Record<string, number> = {};
    for (const row of bookRows) {
      if (row.cat) catCount[row.cat] = (catCount[row.cat] || 0) + 1;
    }
    const { data: existingRows } = await supabase.from('categories').select('id, seo_title');
    const existingMap: Record<string, boolean> = {};
    for (const row of existingRows || []) existingMap[row.id] = !!row.seo_title;
    const toUpsert = Object.keys(catCount)
      .filter((name) => !existingMap[toSlug(name)])
      .map((name) => buildCategoryMeta(name, catCount[name]));
    if (toUpsert.length === 0) {
      return NextResponse.json({ success: true, message: 'All categories already seeded.', seeded: 0 });
    }
    const BATCH = 100;
    let seeded = 0;
    const errors: string[] = [];
    for (let i = 0; i < toUpsert.length; i += BATCH) {
      const { error } = await supabase
        .from('categories')
        .upsert(toUpsert.slice(i, i + BATCH), { onConflict: 'id', ignoreDuplicates: false });
      if (error) errors.push('Batch ' + (Math.floor(i / BATCH) + 1) + ': ' + error.message);
      else seeded += Math.min(BATCH, toUpsert.length - i);
    }
    return NextResponse.json({
      success: true,
      message: 'Seeded ' + seeded + ' of ' + toUpsert.length + ' categories.',
      total: Object.keys(catCount).length,
      seeded,
      skipped: Object.keys(catCount).length - toUpsert.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Seed categories error:', err);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

// GET /api/admin/seed-categories
// Dry-run preview - returns counts without writing anything.
export async function GET(request: Request) {
  if (!isRequestAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { data: bookRows } = await supabase.from('books').select('cat');
    const { data: existingRows } = await supabase.from('categories').select('id, seo_title');
    const catCount: Record<string, number> = {};
    for (const row of bookRows || []) {
      if (row.cat) catCount[row.cat] = (catCount[row.cat] || 0) + 1;
    }
    const existingMap: Record<string, boolean> = {};
    for (const row of existingRows || []) existingMap[row.id] = !!row.seo_title;
    const missing = Object.keys(catCount).filter((n) => !existingMap[toSlug(n)]);
    return NextResponse.json({
      success: true,
      dryRun: true,
      total: Object.keys(catCount).length,
      alreadySeeded: Object.keys(catCount).length - missing.length,
      toBeSeeded: missing.length,
      preview: missing.slice(0, 10).map((n) => buildCategoryMeta(n, catCount[n])),
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
