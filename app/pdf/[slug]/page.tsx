import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookBySlug, getAllBooks } from '@/lib/db';
import {
  getSupabaseBookBySlug,
  getSupabaseTopBooks,
  getSupabaseRelatedBooks,
  getSupabaseAuthorBooks,
} from '@/lib/supabaseDb';
import { BookJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import { toListingBook } from '@/lib/helpers';
import {
  getLanguageConfig,
  normalizeLanguageCode,
  getLocalizedFaqs,
} from '@/lib/languages';
import ProductClient from './ProductClient';
import DynamicBookFallback from './DynamicBookFallback';
import { getBaseUrl } from '@/lib/url';

// Cache each book page at the CDN edge for 24 hours (ISR).
// Stale pages are revalidated in the background — visitors always
// get a fast cached response without waiting for Supabase.
export const revalidate = 86400;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise.then(val => { clearTimeout(timer); return val; }).catch(() => fallback),
    new Promise<T>(resolve => {
      timer = setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

// Pre-build the top 300 most downloaded books at deployment time.
// All other books are generated on-demand and cached at the edge for 24h.
export async function generateStaticParams() {
  const topBooks = await withTimeout(getSupabaseTopBooks(300), 5000, []);
  if (topBooks && topBooks.length > 0) {
    return topBooks.map(b => ({ slug: b.slug }));
  }
  return getAllBooks().slice(0, 300).map(b => ({ slug: b.slug }));
}

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const book = (await withTimeout(getSupabaseBookBySlug(resolvedParams.slug), 4000, null)) || getBookBySlug(resolvedParams.slug);

  if (!book) {
    const formattedTitle = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `${formattedTitle} — Download Free PDF | Bookshelf`,
      description: `Download ${formattedTitle} PDF book with high-speed Google Drive download.`,
    };
  }

  const bookLang = normalizeLanguageCode(book.lang);
  const langCfg = getLanguageConfig(bookLang);

  const title = `${book.title} by ${book.author} — Download Free PDF (${book.pages} Pages)`;
  const description = `Download "${book.title}" PDF book by ${book.author}. ${book.blurb || book.sub} 100% free direct Google Drive download. DRM-free for personal use.`;
  const canonicalUrl = `${getBaseUrl()}/pdf/${book.slug}`;

  const langKeywords = langCfg && langCfg.code !== 'en'
    ? [`${book.title} ${langCfg.name.toLowerCase()}`, `${book.title} ${langCfg.nativeName}`, `${langCfg.nativeName} pdf download`]
    : [];

  return {
    title,
    description,
    keywords: [
      `${book.title} pdf`,
      `${book.title} free download`,
      `${book.title} summary`,
      `${book.author} pdf`,
      `${book.cat.toLowerCase()} pdf books`,
      'free pdf book',
      'google drive pdf download',
      ...langKeywords,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${book.title} by ${book.author} — Free PDF Download`,
      description,
      url: canonicalUrl,
      type: 'book',
      authors: [book.author],
      tags: [book.cat, 'PDF Book', 'Free Download'],
      images: [
        {
          url: `${getBaseUrl()}/api/og?slug=${book.slug}`,
          width: 1200,
          height: 630,
          alt: `${book.title} by ${book.author}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.title} by ${book.author} (Free PDF Download)`,
      description,
      images: [`${getBaseUrl()}/api/og?slug=${book.slug}`],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const book = (await withTimeout(getSupabaseBookBySlug(resolvedParams.slug), 4000, null)) || getBookBySlug(resolvedParams.slug);

  if (!book) {
    return <DynamicBookFallback slug={resolvedParams.slug} />;
  }

  const baseUrl = getBaseUrl();
  const catSlug = normalizeSlug(book.cat);
  const authorSlug = normalizeSlug(book.author);

  const bookLang = normalizeLanguageCode(book.lang);
  const langCfg = getLanguageConfig(bookLang);
  const isRtl = langCfg?.isRtl || bookLang === 'ur';

  // Server-rendered related books (same category) and author books for crawlable deep links
  const [supaRelated, supaAuthor] = await Promise.all([
    withTimeout(getSupabaseRelatedBooks(book.cat, book.id, 6), 3000, []),
    withTimeout(getSupabaseAuthorBooks(book.author, book.id, 6), 3000, []),
  ]);

  const relatedBooks = supaRelated.length > 0
    ? supaRelated.map(toListingBook)
    : getAllBooks().filter(b => b.id !== book.id && b.cat?.toLowerCase() === book.cat?.toLowerCase()).slice(0, 6).map(toListingBook);

  const authorBooks = supaAuthor.length > 0
    ? supaAuthor.map(toListingBook)
    : getAllBooks().filter(b => b.id !== book.id && normalizeSlug(b.author) === authorSlug).slice(0, 6).map(toListingBook);

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    ...(langCfg && langCfg.code !== 'en' ? [{ name: `${langCfg.name} Books`, url: `${baseUrl}/books/${langCfg.slug}` }] : []),
    { name: book.cat, url: `${baseUrl}/category/${catSlug}` },
    { name: book.title, url: `${baseUrl}/pdf/${book.slug}` },
  ];

  const bookFaqs = getLocalizedFaqs(bookLang, book.title, book.author, Number(book.pages) || 80);

  return (
    <>
      <BookJsonLd book={book} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={bookFaqs} />
      <ProductClient
        p={book}
        faqs={bookFaqs}
        initialRelated={relatedBooks}
        initialAuthorBooks={authorBooks}
        isRtl={isRtl}
        langSlug={langCfg?.slug}
        langName={langCfg ? `${langCfg.name} (${langCfg.nativeName})` : undefined}
      />
    </>
  );
}
