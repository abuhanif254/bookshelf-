import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { BreadcrumbJsonLd, PersonJsonLd } from '@/components/JsonLd';
import AuthorClient from './AuthorClient';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();
  const authorBooks = allBooks.filter(b => normalizeSlug(b.author) === resolved.slug.toLowerCase());

  if (authorBooks.length === 0) {
    return {
      title: 'Author Profile | Bookshelf',
      description: 'Discover authors and free PDF books on Bookshelf.',
    };
  }

  const authorName = authorBooks[0].author;
  const canonicalUrl = `https://bookshelf.com/author/${resolved.slug.toLowerCase()}`;

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
  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();
  const authorBooks = allBooks.filter(b => normalizeSlug(b.author) === slug);

  if (authorBooks.length === 0) {
    notFound();
  }

  const authorName = authorBooks[0].author;
  const authorUrl = `https://bookshelf.com/author/${slug}`;

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Authors', url: 'https://bookshelf.com/library' },
    { name: authorName, url: authorUrl },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PersonJsonLd name={authorName} booksCount={authorBooks.length} url={authorUrl} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Authors</Link> › <span>{authorName}</span>
        </div>

        {/* Author Header */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 30, border: '1px solid #e2e8f0', margin: '14px 0 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', fontSize: 26, fontWeight: 900, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {authorName.charAt(0)}
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--amber)', background: '#fef3c7', padding: '3px 8px', borderRadius: 4 }}>
              Verified Author &amp; Creator
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)', margin: '4px 0 2px' }}>{authorName}</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>{authorBooks.length} Published PDF Titles on Bookshelf · 100% Free Downloads</p>
          </div>
        </div>

        <AuthorClient books={authorBooks} authorName={authorName} />
      </div>
    </>
  );
}
