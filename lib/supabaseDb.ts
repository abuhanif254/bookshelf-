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
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) return null;

    if (data.length === 0) {
      // Seed default books if table is empty
      await seedInitialBooks();
      return P;
    }

    return data.map(mapDbRowToProduct);
  } catch {
    return null;
  }
}

export async function addSupabaseBook(bookData: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const row = mapProductToDbRow(bookData);
    delete row.id;
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
