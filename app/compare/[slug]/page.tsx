import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks, getBookBySlug } from '@/lib/db';
import { BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import CompareClient from './CompareClient';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const parts = resolved.slug.split('-vs-');
  if (parts.length !== 2) {
    return { title: 'Book Comparison | Bookshelf' };
  }

  const bookA = getBookBySlug(parts[0]);
  const bookB = getBookBySlug(parts[1]);

  if (!bookA || !bookB) {
    return { title: 'Book Comparison | Bookshelf' };
  }

  const title = `${bookA.title} vs ${bookB.title} — Which PDF Should You Read? (2026)`;
  const desc = `Detailed side-by-side comparison of "${bookA.title}" by ${bookA.author} vs "${bookB.title}" by ${bookB.author}. Compare page count, difficulty, key takeaways, and free PDF download links.`;
  const canonicalUrl = `https://bookshelf.com/compare/${resolved.slug}`;

  return {
    title,
    description: desc,
    keywords: [
      `${bookA.title} vs ${bookB.title}`,
      `${bookA.title} comparison`,
      `${bookB.title} comparison`,
      'free pdf book comparison',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: desc,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(bookA.title + ' vs ' + bookB.title)}`,
          width: 1200,
          height: 630,
          alt: `${bookA.title} vs ${bookB.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [`/api/og?title=${encodeURIComponent(bookA.title + ' vs ' + bookB.title)}`],
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const parts = resolved.slug.split('-vs-');
  if (parts.length !== 2) {
    notFound();
  }

  const bookA = getBookBySlug(parts[0]);
  const bookB = getBookBySlug(parts[1]);

  if (!bookA || !bookB) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Comparisons', url: 'https://bookshelf.com/library' },
    { name: `${bookA.title} vs ${bookB.title}`, url: `https://bookshelf.com/compare/${resolved.slug}` },
  ];

  const compareFaqs = [
    {
      question: `Which book should I download first: "${bookA.title}" or "${bookB.title}"?`,
      answer: `If you want a focus on ${bookA.cat.toLowerCase()}, choose "${bookA.title}" (${bookA.pages} pages). For ${bookB.cat.toLowerCase()}, "${bookB.title}" (${bookB.pages} pages) is the recommended pick. Both are available for free PDF download.`,
    },
    {
      question: `Are both PDFs free to download on Bookshelf?`,
      answer: `Yes, both books feature direct Google Drive downloads with zero registration required.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={compareFaqs} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Comparisons</Link> › <span>{bookA.title} vs {bookB.title}</span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', margin: '20px 0 32px' }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)', background: '#fef3c7', padding: '4px 12px', borderRadius: 20 }}>
            Side-by-Side Comparison (2026)
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: 'var(--ink)', margin: '10px 0 6px' }}>
            {bookA.title} <span style={{ color: 'var(--amber)' }}>vs</span> {bookB.title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 640, margin: '0 auto' }}>
            Which digital book fits your goals better? Compare pages, difficulty, takeaways, and download both free.
          </p>
        </div>

        <CompareClient bookA={bookA} bookB={bookB} faqs={compareFaqs} />
      </div>
    </>
  );
}
