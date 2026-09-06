import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { getAllBooks, getCategories } from '@/lib/db';
import { getSupabaseCategories } from '@/lib/supabaseDb';
import { BUNDLES } from '@/lib/bundles';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { getBaseUrl } from '@/lib/url';
import { LISTICLES } from './best/[slug]/page';
import { COMPARISON_PAIRS } from './compare/[slug]/page';

// Google hard limit: 50,000 URLs per sitemap file.
// We chunk into 40,000 to safely guarantee Google compliance even with extra hubs.
const BOOKS_PER_CHUNK = 40_000;

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function generateSitemaps() {
  try {
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true });

    const total = !error && count ? count : 0;
    const numChunks = Math.max(1, Math.ceil(total / BOOKS_PER_CHUNK));
    return Array.from({ length: numChunks }, (_, i) => ({ id: String(i) }));
  } catch {
    return [{ id: '0' }];
  }
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const resolvedId = await props.id;
  const chunkIndex = parseInt(resolvedId, 10) || 0;

  const start = chunkIndex * BOOKS_PER_CHUNK;
  const end = start + BOOKS_PER_CHUNK - 1;

  // Query ONLY slug and created_at for this chunk to keep memory ultra-lightweight (< 2MB)
  let books: { slug: string; created_at?: string }[] = [];
  try {
    const { data, error } = await supabase
      .from('books')
      .select('slug, created_at')
      .order('id', { ascending: true })
      .range(start, end);

    if (!error && data && data.length > 0) {
      books = data;
    }
  } catch {}

  // If Supabase returned no books for chunk 0, fall back to local seed books
  if (chunkIndex === 0 && books.length === 0) {
    books = getAllBooks().map(b => ({ slug: b.slug, created_at: b.createdAt }));
  }

  const bookEntries: MetadataRoute.Sitemap = books.map(book => ({
    url: `${baseUrl}/pdf/${book.slug}`,
    lastModified: book.created_at ? new Date(book.created_at) : new Date('2026-08-01'),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // If this is chunk 0, also prepend all static hubs, categories, and collections
  if (chunkIndex === 0) {
    const staticRoutes: MetadataRoute.Sitemap = [
      { url: `${baseUrl}`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0  },
      { url: `${baseUrl}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
      { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
      { url: `${baseUrl}/publish`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
      { url: `${baseUrl}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5  },
      { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5  },
    ];

    // Categories
    const supaCats = await getSupabaseCategories();
    const dbCats = getCategories();
    const catSlugs = new Set<string>();
    ['productivity', 'programming', 'business', 'design', 'marketing', 'self-help', 'technology', 'finance'].forEach(s => catSlugs.add(s));
    if (supaCats) supaCats.forEach(c => { if (c.slug) catSlugs.add(normalizeSlug(c.slug)); });
    if (dbCats) dbCats.forEach(c => { if (c.slug) catSlugs.add(normalizeSlug(c.slug)); });

    const categoryRoutes: MetadataRoute.Sitemap = Array.from(catSlugs).map(cat => ({
      url: `${baseUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    // Bundles
    const bundleRoutes: MetadataRoute.Sitemap = BUNDLES.map(bundle => ({
      url: `${baseUrl}/bundles/${bundle.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // Best-of listicles (All 10 roundups)
    const bestRoutes: MetadataRoute.Sitemap = Object.keys(LISTICLES).map(slug => ({
      url: `${baseUrl}/best/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Topic micro-silos
    const topicRoutes: MetadataRoute.Sitemap = [
      'deep-work','startup-launch','javascript-patterns','design-tokens',
      'habit-building','ai-prompts','personal-finance','sleep-optimization',
    ].map(tag => ({
      url: `${baseUrl}/topic/${tag}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Comparisons (All 16 high-intent showdowns)
    const compareRoutes: MetadataRoute.Sitemap = COMPARISON_PAIRS.map(pair => ({
      url: `${baseUrl}/compare/${pair}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Language Hubs
    const languageRoutes: MetadataRoute.Sitemap = SUPPORTED_LANGUAGES.map(lang => ({
      url: `${baseUrl}/books/${lang.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.95,
    }));

    return [
      ...staticRoutes,
      ...languageRoutes,
      ...categoryRoutes,
      ...bundleRoutes,
      ...bestRoutes,
      ...topicRoutes,
      ...compareRoutes,
      ...bookEntries,
    ];
  }

  return bookEntries;
}
