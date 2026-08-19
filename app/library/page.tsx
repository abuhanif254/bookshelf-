import { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllBooks } from '@/lib/db';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/JsonLd';
import LibraryClient from './LibraryClient';

export const metadata: Metadata = {
  title: 'Full Free PDF Book Library & Catalog | Bookshelf',
  description: 'Search, filter, and download all verified free PDF books, cheat sheets, and toolkits across productivity, coding, business, design, and self-help. 100% free with instant direct downloads.',
  keywords: [
    'free pdf book library',
    'download all pdf books',
    'free ebooks catalog',
    'coding cheat sheets pdf',
    'productivity handbooks pdf',
    'business startup pdfs',
    'instant google drive pdfs',
  ],
  alternates: {
    canonical: 'https://bookshelf.com/library',
  },
  openGraph: {
    title: 'Complete Free PDF Book Catalog | Bookshelf',
    description: 'Instant direct downloads of high-quality PDF books across 9 essential categories. Free titles every Friday.',
    url: 'https://bookshelf.com/library',
    type: 'website',
    images: [
      {
        url: '/api/og?title=' + encodeURIComponent('Full Free PDF Library & Catalog'),
        width: 1200,
        height: 630,
        alt: 'Bookshelf Full Free PDF Book Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full Free PDF Book Library | Bookshelf',
    description: 'Download verified free PDF books and toolkits with instant direct delivery.',
    images: ['/api/og?title=' + encodeURIComponent('Full Free PDF Library & Catalog')],
  },
};

export default function LibraryPage() {
  const books = getAllBooks();
  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Full Library Catalog', url: 'https://bookshelf.com/library' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd
        name="Bookshelf Complete PDF Book Catalog"
        description="Comprehensive collection of verified DRM-free PDF books, cheat sheets, and playbooks."
        url="https://bookshelf.com/library"
        count={books.length}
      />
      <Suspense fallback={<div className="wrap" style={{ padding: '60px 0' }}>Loading library…</div>}>
        <LibraryClient />
      </Suspense>
    </>
  );
}
