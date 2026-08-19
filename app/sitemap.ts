import { MetadataRoute } from 'next';
import { getAllBooks } from '@/lib/db';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { BUNDLES } from '@/lib/bundles';

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bookshelf.com';
  const supaBooks = await getSupabaseBooks();
  const books = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();

  // Static core canonical routes (no query params)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/publish`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Category Hubs
  const categories = Array.from(new Set(books.map(b => normalizeSlug(b.cat))));
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Curated Multi-Book PDF Bundles
  const bundleRoutes: MetadataRoute.Sitemap = BUNDLES.map(bundle => ({
    url: `${baseUrl}/bundles/${bundle.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Individual PDF Books
  const bookRoutes: MetadataRoute.Sitemap = books.map(book => ({
    url: `${baseUrl}/pdf/${book.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Best-Of Curated Listicles
  const bestOfSlugs = [
    'free-programming-books-2026',
    'top-productivity-books-for-founders',
    'best-personal-finance-books',
    'ui-ux-design-systems-guides',
    'best-business-startup-playbooks',
  ];
  const bestRoutes: MetadataRoute.Sitemap = bestOfSlugs.map(slug => ({
    url: `${baseUrl}/best/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Topic Micro-Silos
  const topicTags = [
    'deep-work',
    'startup-launch',
    'javascript-patterns',
    'design-tokens',
    'habit-building',
    'ai-prompts',
    'personal-finance',
    'sleep-optimization',
  ];
  const topicRoutes: MetadataRoute.Sitemap = topicTags.map(tag => ({
    url: `${baseUrl}/topic/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Author Entity Profiles
  const authors = Array.from(new Set(books.map(b => normalizeSlug(b.author))));
  const authorRoutes: MetadataRoute.Sitemap = authors.map(author => ({
    url: `${baseUrl}/author/${author}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Selected High-Volume Comparisons
  const comparePairs = [
    'deep-focus-vs-morning-reset',
    'indie-founder-playbook-vs-zero-to-launch',
    'javascript-patterns-2e-vs-design-systems-handbook',
  ];
  const compareRoutes: MetadataRoute.Sitemap = comparePairs.map(pair => ({
    url: `${baseUrl}/compare/${pair}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...bundleRoutes,
    ...bookRoutes,
    ...bestRoutes,
    ...topicRoutes,
    ...authorRoutes,
    ...compareRoutes,
  ];
}
