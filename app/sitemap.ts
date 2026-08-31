import { MetadataRoute } from 'next';
import { getAllBooks } from '@/lib/db';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { BUNDLES } from '@/lib/bundles';
import { getBaseUrl } from '@/lib/url';

// Google hard limit: 50,000 URLs per sitemap file.
// We use 40,000 per chunk to stay safely under that ceiling.
const BOOKS_PER_CHUNK = 40_000;

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const supaBooks = await getSupabaseBooks();
  const books = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();

  // Static core pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0  },
    { url: `${baseUrl}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/library`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${baseUrl}/publish`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
    { url: `${baseUrl}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5  },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5  },
  ];

  // Category hubs (450+)
  const categories = Array.from(new Set(books.map(b => normalizeSlug(b.cat))));
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(cat => ({
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

  // Best-of listicles
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

  // Author entity profiles
  const authors = Array.from(new Set(books.map(b => normalizeSlug(b.author))));
  const authorRoutes: MetadataRoute.Sitemap = authors.map(author => ({
    url: `${baseUrl}/author/${author}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Comparison pages
  const compareRoutes: MetadataRoute.Sitemap = [
    'deep-focus-vs-morning-reset',
    'indie-founder-playbook-vs-zero-to-launch',
    'javascript-patterns-2e-vs-design-systems-handbook',
  ].map(pair => ({
    url: `${baseUrl}/compare/${pair}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Book URLs â€” inline when small, reference chunked sub-sitemaps when large.
  // Sub-sitemaps live at /api/sitemap-books/[index] (see that route file).
  const chunkCount = Math.max(1, Math.ceil(books.length / BOOKS_PER_CHUNK));
  const bookEntries: MetadataRoute.Sitemap =
    books.length <= BOOKS_PER_CHUNK
      ? books.map(book => ({
          url: `${baseUrl}/pdf/${book.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }))
      : Array.from({ length: chunkCount }, (_, i) => ({
          url: `${baseUrl}/api/sitemap-books/${i}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...bundleRoutes,
    ...bestRoutes,
    ...topicRoutes,
    ...authorRoutes,
    ...compareRoutes,
    ...bookEntries,
  ];
}
