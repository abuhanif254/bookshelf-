import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { getSupabaseTopAuthors, getSupabaseAuthorBooks } from '@/lib/supabaseDb';
import { BreadcrumbJsonLd, PersonJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { getBaseUrl } from '@/lib/url';
import { toListingBook } from '@/lib/helpers';
import AuthorClient from './AuthorClient';

// Cache author profile pages at the CDN edge for 24 hours (ISR).
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  return Promise.race([
    promise.then(val => { clearTimeout(timer); return val; }).catch(() => fallback),
    new Promise<T>(resolve => {
      timer = setTimeout(() => resolve(fallback), ms);
    }),
  ]);
}

export async function generateStaticParams() {
  const topAuthors = await withTimeout(getSupabaseTopAuthors(100), 4000, []);
  if (topAuthors && topAuthors.length > 0) {
    return topAuthors.map(a => ({ slug: a.slug }));
  }

  const authorCounts = new Map<string, number>();
  for (const book of getAllBooks()) {
    if (book.author) {
      const slug = normalizeSlug(book.author);
      if (slug) authorCounts.set(slug, (authorCounts.get(slug) || 0) + 1);
    }
  }

  return Array.from(authorCounts.keys()).slice(0, 100).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const supaAuthor = await withTimeout(getSupabaseAuthorBooks(resolved.slug, undefined, 50), 3000, []);
  const authorBooks = supaAuthor.length > 0
    ? supaAuthor
    : getAllBooks().filter(b => normalizeSlug(b.author) === resolved.slug.toLowerCase());

  if (authorBooks.length === 0) {
    return {
      title: 'Author Profile | Bookshelf',
      description: 'Discover authors and free PDF books on Bookshelf.',
    };
  }

  const authorName = authorBooks[0].author;
  const canonicalUrl = `${getBaseUrl()}/author/${resolved.slug.toLowerCase()}`;

  return {
    title: `PDF Books by ${authorName} — Free Download | Bookshelf`,
    description: `Browse and download all free PDF books, playbooks, and guides written by ${authorName}. Verified 1-click Google Drive downloads.`,
    keywords: [
      `${authorName} books pdf`,
      `${authorName} free pdf`,
      `download books by ${authorName}`,
      'digital pdf books',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Free PDF Books by ${authorName}`,
      description: `Download verified PDF books and playbooks by ${authorName}.`,
      url: canonicalUrl,
      type: 'profile',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent('Books by ' + authorName)}`,
          width: 1200,
          height: 630,
          alt: `Books by ${authorName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Free PDF Books by ${authorName}`,
      description: `Download verified PDF books and playbooks by ${authorName}.`,
      images: [`/api/og?title=${encodeURIComponent('Books by ' + authorName)}`],
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const slug = resolved.slug.toLowerCase();
  const supaAuthor = await withTimeout(getSupabaseAuthorBooks(slug, undefined, 100), 3500, []);
  const authorBooks = supaAuthor.length > 0
    ? supaAuthor
    : getAllBooks().filter(b => normalizeSlug(b.author) === slug);

  if (authorBooks.length === 0) {
    notFound();
  }

  const baseUrl = getBaseUrl();
  const authorName = authorBooks[0].author;
  const authorUrl = `${baseUrl}/author/${slug}`;

  // Aggregate author telemetry & literary metrics
  const totalDownloads = authorBooks.reduce((sum, b) => sum + (b.downloads || b.reviews * 14 || 120), 0);
  const categories = Array.from(new Set(authorBooks.map(b => b.cat).filter(Boolean)));
  const avgRating = (authorBooks.reduce((sum, b) => sum + (b.rating || 4.8), 0) / authorBooks.length).toFixed(1);
  const wikiSearchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(authorName)}`;

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Authors', url: `${baseUrl}/library` },
    { name: authorName, url: authorUrl },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PersonJsonLd
        name={authorName}
        jobTitle={`Author & Writer (${categories.slice(0, 2).join(', ') || 'Literature'})`}
        booksCount={authorBooks.length}
        url={authorUrl}
      />
      <ItemListJsonLd
        title={`Books by ${authorName}`}
        description={`Download free PDF books written by ${authorName}.`}
        url={authorUrl}
        items={authorBooks.slice(0, 30).map((b, i) => ({
          name: b.title,
          url: `${baseUrl}/pdf/${b.slug}`,
          position: i + 1,
        }))}
      />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Authors</Link> › <span>{authorName}</span>
        </div>

        {/* Author E-E-A-T Biography & Knowledge Card */}
        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 14,
            padding: '32px',
            border: '1px solid #e2e8f0',
            margin: '14px 0 28px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  color: '#ffffff',
                  fontSize: 28,
                  fontWeight: 900,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
                  border: '3px solid #ffffff',
                }}
              >
                {authorName.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#b45309',
                      background: '#fef3c7',
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid #fde68a',
                    }}
                  >
                    Verified Author Archive
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    ⚡ Open Access
                  </span>
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', margin: '6px 0 4px' }}>
                  {authorName}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                  Cataloged Author &amp; Literary Creator · Bookshelf Digital Archives
                </p>
              </div>
            </div>

            {/* Readership Metric Counters */}
            <div style={{ display: 'flex', gap: 20, background: '#ffffff', padding: '12px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)' }}>{authorBooks.length}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Titles</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>{totalDownloads.toLocaleString()}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Downloads</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--smile)' }}>★ {avgRating}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Rating</div>
              </div>
            </div>
          </div>

          {/* Biographical Context & E-E-A-T Entity Links */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>
                Primary Genres:
              </span>
              {categories.map(cat => (
                <Link
                  key={cat}
                  href={`/category/${normalizeSlug(cat)}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    background: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    textDecoration: 'none',
                  }}
                >
                  📁 {cat}
                </Link>
              ))}
            </div>

            <a
              href={wikiSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--link)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              <span>Explore {authorName} on Wikipedia</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <AuthorClient books={authorBooks.slice(0, 100).map(toListingBook)} authorName={authorName} />
      </div>
    </>
  );
}
