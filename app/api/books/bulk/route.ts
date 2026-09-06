import { NextResponse } from 'next/server';
import { addSupabaseBooksBulk, getSupabaseCategories, saveSupabaseCategory } from '@/lib/supabaseDb';
import { isRequestAuthorized } from '@/lib/auth';
import { Product } from '@/lib/products';

export async function POST(request: Request) {
  try {
    if (!isRequestAuthorized(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.books || !Array.isArray(body.books)) {
      return NextResponse.json({ success: false, message: 'Invalid payload. Expected an array of books.' }, { status: 400 });
    }

    const uniqueCategories = new Set<string>();

    const booksToInsert: Omit<Product, 'id'>[] = body.books.map((b: any) => {
      const rawTitle = b.title || 'Untitled Book';
      const title = rawTitle
        .replace(/\s*:\s*\$b\s*/gi, ': ')
        .replace(/\s*\$b\s*/gi, ' ')
        .replace(/\s*:\s*;\s*/g, ': ')
        .replace(/\s*\/\s*$/, '')
        .trim();

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

      const catName = b.cat || 'General';
      uniqueCategories.add(catName);

      let finalCoverImage = b.coverImage || b.coverimage || b.cover_image || b.image || b.imageurl || '';
      const driveMatch = finalCoverImage.match(/\/d\/([a-zA-Z0-9_-]+)/) || finalCoverImage.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        finalCoverImage = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
      }

      const authorBio = b.authorBio || b.author_bio || '';
      let descHtml = b.desc || `<p>${title} by ${b.author || 'Unknown'}. Download your free PDF copy instantly.</p>`;
      if (authorBio && !descHtml.includes('About the Author')) {
        descHtml += `<div class="author-bio" style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;"><h3>About the Author</h3><p>${authorBio}</p></div>`;
      }

      return {
        slug,
        title,
        sub: b.sub || `A free public domain ${catName.toLowerCase()} book`,
        author: b.author || 'Unknown',
        cat: catName,
        type: b.type || 'free',
        price: Number(b.price) || 0,
        list: b.list ? Number(b.list) : null,
        rating: Number(b.rating) || 4.8,
        reviews: Math.floor(Math.random() * 500) + 120,
        pages: Number(b.pages) || 80,
        badge: b.badge || (b.type === 'free' ? 'Free' : 'New'),
        bought: 'Instant download',
        bg: b.bg || '#0f2a43',
        fg: b.fg || '#ffffff',
        ac: b.ac || '#f59e0b',
        pat: b.pat || 'p-rings',
        blurb: b.blurb || title,
        feat: Array.isArray(b.feat) && b.feat.length > 0 ? b.feat : ['Instant PDF download', 'DRM-free for personal use', 'Clean layout for screen & print'],
        desc: descHtml,
        driveUrl: b.driveUrl || b.driveurl || b.drive_url || '',
        coverImage: finalCoverImage,
        partner: b.partner || '',
        partnerUrl: b.partnerUrl || b.partnerurl || '',
      };
    });

    // Auto-sync missing categories
    try {
      const existingCats = await getSupabaseCategories();
      const existingNames = new Set((existingCats || []).map(c => c.name.toLowerCase()));
      
      for (const catName of Array.from(uniqueCategories)) {
        if (!existingNames.has(catName.toLowerCase())) {
          const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          await saveSupabaseCategory({
            id: slug,
            name: catName,
            slug: slug,
            badge: 'General',
            seoTitle: `Free ${catName} PDF Books | Bookshelf`,
            seoDesc: `Download verified free ${catName} PDF books and toolkits with instant direct delivery.`,
            h1: `Free ${catName} PDF Books & Handbooks`,
            intro: `Explore our curated collection of free ${catName} books and practical guides.`
          });
        }
      }
    } catch (e) {
      console.error('Failed to auto-sync categories during bulk upload:', e);
    }

    const result = await addSupabaseBooksBulk(booksToInsert);

    if (result) {
      return NextResponse.json({ success: true, count: result.length, books: result });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to insert books into database.' }, { status: 500 });
    }
  } catch (error) {
    console.error('API POST /api/books/bulk error:', error);
    return NextResponse.json({ success: false, message: 'Server error processing bulk upload.' }, { status: 500 });
  }
}
