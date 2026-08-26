import { supabase } from './supabase';
import { Product, P } from './products';
import { AdSettings, BookReview, CategoryConfig } from './db';

// ── Database Table Mappers ──────────────────────────────────────────────────

function mapDbRowToProduct(row: any): Product {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    sub: row.sub || '',
    author: row.author,
    cat: row.cat,
    type: (row.type as any) || 'free',
    price: Number(row.price) || 0,
    list: row.list != null ? Number(row.list) : null,
    rating: Number(row.rating) || 4.8,
    reviews: Number(row.reviews) || 250,
    pages: Number(row.pages) || 100,
    badge: row.badge || null,
    bought: row.bought || 'Instant download',
    bg: row.bg || '#0f2a43',
    fg: row.fg || '#ffffff',
    ac: row.ac || '#f59e0b',
    pat: row.pat || 'p-rings',
    blurb: row.blurb || '',
    feat: Array.isArray(row.feat) ? row.feat : (typeof row.feat === 'string' ? JSON.parse(row.feat || '[]') : []),
    desc: row.desc_html || row.desc || '',
    driveUrl: row.drive_url || '',
    coverImage: row.cover_image || '',
    coverUrl: row.cover_image || '',
    partner: row.partner || '',
    partnerUrl: row.partner_url || '',
    downloads: Number(row.downloads) || 0,
    createdAt: row.created_at,
  };
}

function mapProductToDbRow(p: Partial<Product>): any {
  const row: any = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.title !== undefined) row.title = p.title;
  if (p.sub !== undefined) row.sub = p.sub;
  if (p.author !== undefined) row.author = p.author;
  if (p.cat !== undefined) row.cat = p.cat;
  if (p.type !== undefined) row.type = p.type;
  if (p.price !== undefined) row.price = p.price;
  if (p.list !== undefined) row.list = p.list;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviews !== undefined) row.reviews = p.reviews;
  if (p.pages !== undefined) row.pages = p.pages;
  if (p.badge !== undefined) row.badge = p.badge;
  if (p.bought !== undefined) row.bought = p.bought;
  if (p.bg !== undefined) row.bg = p.bg;
  if (p.fg !== undefined) row.fg = p.fg;
  if (p.ac !== undefined) row.ac = p.ac;
  if (p.pat !== undefined) row.pat = p.pat;
  if (p.blurb !== undefined) row.blurb = p.blurb;
  if (p.feat !== undefined) row.feat = p.feat;
  if (p.desc !== undefined) row.desc_html = p.desc;
  if (p.driveUrl !== undefined) row.drive_url = p.driveUrl;
  if (p.coverImage !== undefined || p.coverUrl !== undefined) row.cover_image = p.coverImage || p.coverUrl;
  if (p.partner !== undefined) row.partner = p.partner;
  if (p.partnerUrl !== undefined) row.partner_url = p.partnerUrl;
  if (p.downloads !== undefined) row.downloads = p.downloads;
  return row;
}

// ── Books ───────────────────────────────────────────────────────────────────

export async function getSupabaseBooks(): Promise<Product[] | null> {
  try {
    let allBooks: any[] = [];
    let from = 0;
    const step = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false })
        .range(from, from + step - 1);

      if (error) {
        console.error('Fetch books error:', error);
        break;
      }
      
      if (data) {
        allBooks.push(...data);
      }
      
      if (!data || data.length < step) {
        break;
      }
      
      from += step;
    }

    if (allBooks.length === 0) {
      // Seed default books if table is empty
      await seedInitialBooks();
      return P;
    }

    return allBooks.map(mapDbRowToProduct);
  } catch (err) {
    console.error('Fetch books exception:', err);
    return null;
  }
}

export async function getSupabaseBooksPaginated(options: { page: number, limit: number, search?: string, cat?: string, type?: string, sort?: string }) {
  try {
    let query = supabase.from('books').select('*', { count: 'exact' });

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,author.ilike.%${options.search}%,cat.ilike.%${options.search}%`);
    }
    if (options.cat) {
      query = query.eq('cat', options.cat);
    }
    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.sort === 'title') {
      query = query.order('title', { ascending: true });
    } else if (options.sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (options.sort === 'pages') {
      query = query.order('pages', { ascending: false });
    } else {
      query = query.order('id', { ascending: false });
    }

    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) {
      console.error('Paginated fetch error:', error);
      return null;
    }

    return {
      books: data ? data.map(mapDbRowToProduct) : [],
      total: count || 0,
      page: options.page,
      limit: options.limit,
      totalPages: count ? Math.ceil(count / options.limit) : 0
    };
  } catch (err) {
    console.error('Paginated exception:', err);
    return null;
  }
}

export async function addSupabaseBook(bookData: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const row = mapProductToDbRow(bookData);
    
    // Fetch max ID to bypass out-of-sync PostgreSQL sequence caused by seeding
    const { data: maxData } = await supabase.from('books').select('id').order('id', { ascending: false }).limit(1);
    if (maxData && maxData.length > 0) {
      row.id = maxData[0].id + 1;
    } else {
      delete row.id;
    }

    const { data, error } = await supabase
      .from('books')
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase insert error:', error);
      return null;
    }
    return mapDbRowToProduct(data);
  } catch (err) {
    console.error('Supabase add error:', err);
    return null;
  }
}

export async function addSupabaseBooksBulk(booksData: Omit<Product, 'id'>[]): Promise<Product[] | null> {
  try {
    const { data: maxData } = await supabase.from('books').select('id').order('id', { ascending: false }).limit(1);
    let nextId = (maxData && maxData.length > 0) ? maxData[0].id + 1 : 1;

    const rows = booksData.map(book => {
      const row = mapProductToDbRow(book);
      row.id = nextId++;
      return row;
    });

    const { data, error } = await supabase
      .from('books')
      .insert(rows)
      .select();

    if (error || !data) {
      console.error('Bulk insert error:', error);
      return null;
    }
    return data.map(mapDbRowToProduct);
  } catch (err) {
    console.error('Bulk insert exception:', err);
    return null;
  }
}

export async function updateSupabaseBook(id: number, updates: Partial<Product>): Promise<Product | null> {
  try {
    const row = mapProductToDbRow(updates);
    delete row.id;
    const { data, error } = await supabase
      .from('books')
      .update(row)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbRowToProduct(data);
  } catch {
    return null;
  }
}

export async function deleteSupabaseBook(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function getSupabaseSettings(): Promise<AdSettings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error || !data) return null;

    return {
      adNetwork: data.ad_network || 'adsterra',
      countdownSeconds: Number(data.ad_timer_seconds) || 8,
      adCode: data.banner_ad_code || '',
      directSmartLink: data.direct_smart_link || 'https://www.highcpmgate.com/example',
      sponsorTitle: 'Sponsored Partner Recommendation',
      sponsorSubtitle: 'Support our free PDF library by checking out our partner.',
      sponsorCta: 'Access Sponsor Offer ↗',
      sponsorUrl: data.direct_smart_link || 'https://www.highcpmgate.com/example',
      adminPasscode: data.passcode || 'bookshelf2026',
      siteName: 'Bookshelf',
      siteTagline: '100% Free & DRM-Free PDF Books',
      supportEmail: data.admin_email || 'mohammadbitullah@gmail.com',
      stats: {
        totalDownloads: 0,
        adImpressions: 0,
        adUnlocks: 0,
        vipReferralUnlocks: 0,
      },
    };
  } catch {
    return null;
  }
}

export async function updateSupabaseSettings(updates: Partial<AdSettings>): Promise<boolean> {
  try {
    const row: any = {
      id: 'global',
      updated_at: new Date().toISOString(),
    };
    if (updates.adminPasscode !== undefined) row.passcode = updates.adminPasscode;
    if (updates.supportEmail !== undefined) row.admin_email = updates.supportEmail;
    if (updates.directSmartLink !== undefined) row.direct_smart_link = updates.directSmartLink;
    if (updates.adCode !== undefined) row.banner_ad_code = updates.adCode;
    if (updates.countdownSeconds !== undefined) row.ad_timer_seconds = updates.countdownSeconds;

    const { error } = await supabase
      .from('settings')
      .upsert(row, { onConflict: 'id' });

    return !error;
  } catch {
    return false;
  }
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export async function getSupabaseReviews(bookId?: number): Promise<BookReview[] | null> {
  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (bookId) {
      query = query.eq('book_id', bookId);
    }
    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((r: any) => ({
      id: r.id,
      bookId: Number(r.book_id),
      userName: r.author || 'Reader',
      rating: Number(r.rating) || 5,
      title: r.title,
      body: r.body,
      date: r.date || 'Aug 2026',
      verified: r.verified ?? true,
      helpfulCount: Number(r.helpful_count) || 0,
      approved: true,
      createdAt: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return null;
  }
}

export async function addSupabaseReview(review: Omit<BookReview, 'id' | 'date' | 'helpfulCount' | 'approved' | 'createdAt'>): Promise<BookReview | null> {
  try {
    const newId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const row = {
      id: newId,
      book_id: review.bookId,
      title: review.title,
      body: review.body,
      author: review.userName,
      rating: review.rating,
      date: dateStr,
      verified: review.verified ?? true,
      helpful_count: 0,
    };

    const { error } = await supabase.from('reviews').insert(row);
    if (error) return null;

    return {
      id: newId,
      bookId: review.bookId,
      userName: review.userName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      date: dateStr,
      verified: review.verified ?? true,
      helpfulCount: 0,
      approved: true,
      createdAt: nowIso,
    };
  } catch {
    return null;
  }
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function getSupabaseCategories(): Promise<CategoryConfig[] | null> {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error || !data || data.length === 0) return null;
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      badge: c.badge || 'Popular',
      seoTitle: c.seo_title,
      h1: c.h1,
      intro: c.intro,
    }));
  } catch {
    return null;
  }
}

export async function saveSupabaseCategory(cat: CategoryConfig): Promise<CategoryConfig | null> {
  try {
    const row = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      badge: cat.badge || 'Popular',
      seo_title: cat.seoTitle || cat.name,
      h1: cat.h1 || cat.name,
      intro: cat.intro || '',
    };
    const { error } = await supabase.from('categories').upsert(row, { onConflict: 'id' });
    if (error) return null;
    return cat;
  } catch {
    return null;
  }
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ── Subscribers ─────────────────────────────────────────────────────────────

export async function addSupabaseSubscriber(email: string): Promise<boolean> {
  try {
    const newId = `sub-${Date.now()}`;
    const { error } = await supabase.from('subscribers').upsert({ id: newId, email }, { onConflict: 'email' });
    return !error;
  } catch {
    return false;
  }
}

// ── Auto-Seed Initial Catalog ───────────────────────────────────────────────

async function seedInitialBooks() {
  try {
    const rows = P.map(p => {
      const row = mapProductToDbRow(p);
      return row;
    });
    await supabase.from('books').upsert(rows, { onConflict: 'slug' });
  } catch (e) {
    console.error('Failed to seed initial books:', e);
  }
}
