import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBookBySlug, getAllBooks } from '@/lib/db';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { BookJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import ProductClient from './ProductClient';
import DynamicBookFallback from './DynamicBookFallback';
import { getBaseUrl } from '@/lib/url';

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

  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();
  const book = allBooks.find(b => b.slug === resolvedParams.slug || normalizeSlug(b.title) === resolvedParams.slug) || getBookBySlug(resolvedParams.slug);

  if (!book) {
    const formattedTitle = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `${formattedTitle} — Download Free PDF | Bookshelf`,
      description: `Download ${formattedTitle} PDF book with high-speed Google Drive download.`,
    };
  }

  const title = `${book.title} by ${book.author} — Download Free PDF (${book.pages} Pages)`;
  const description = `Download "${book.title}" PDF book by ${book.author}. ${book.blurb || book.sub} 100% free direct Google Drive download. DRM-free for personal use.`;
  const canonicalUrl = `${getBaseUrl()}/pdf/${book.slug}`;

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

  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();
  const book = allBooks.find(b => b.slug === resolvedParams.slug || normalizeSlug(b.title) === resolvedParams.slug) || getBookBySlug(resolvedParams.slug);

  if (!book) {
    return <DynamicBookFallback slug={resolvedParams.slug} />;
  }

  const catSlug = normalizeSlug(book.cat);
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.pdf-bookshelf.com' },
    { name: book.cat, url: `https://www.pdf-bookshelf.com/category/${catSlug}` },
    { name: book.title, url: `https://www.pdf-bookshelf.com/pdf/${book.slug}` },
  ];

  const bookFaqs = [
    {
      question: `How can I download "${book.title}" in PDF format?`,
      answer: `Click the "Download Free PDF" button above. After a quick 8-second sponsor message, your high-speed Google Drive direct download link will activate immediately.`,
    },
    {
      question: `Is "${book.title}" by ${book.author} completely free?`,
      answer: `Yes! "${book.title}" is 100% free to download on Bookshelf with no subscription fees, registration, or credit card required.`,
    },
    {
      question: `Can I open this PDF on mobile, iPad, and Kindle?`,
      answer: `Yes. This ${book.pages}-page edition is formatted as a standard, high-resolution PDF with searchable text, compatible with all PDF readers, iPads, Apple Books, and Kindle devices.`,
    },
  ];

  return (
    <>
      <BookJsonLd book={book} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={bookFaqs} />
      <ProductClient p={book} faqs={bookFaqs} />
    </>
  );
}
