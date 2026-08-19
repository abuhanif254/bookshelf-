import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBundleBySlug, getBundleBooks } from '@/lib/bundles';
import { BreadcrumbJsonLd, ItemListJsonLd, FAQJsonLd } from '@/components/JsonLd';
import BundleClient from './BundleClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);
  if (!bundle) return { title: 'Bundle Not Found | Bookshelf' };

  const canonicalUrl = `https://bookshelf.com/bundles/${bundle.slug}`;
  const title = `${bundle.title} — Curated ${bundle.bookIds.length}-Book PDF Stack | Bookshelf`;
  const description = `${bundle.desc} Includes ${bundle.bookIds.length} complete PDF books with 1-click Google Drive download.`;

  return {
    title,
    description,
    keywords: [
      `${bundle.title.toLowerCase()} pdf`,
      'pdf bundle',
      'multi book stack',
      'free pdf collection',
      'instant pdf download',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(bundle.title)}`,
          width: 1200,
          height: 630,
          alt: bundle.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(bundle.title)}`],
    },
  };
}

export default async function BundlePage({ params }: PageProps) {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);
  if (!bundle) notFound();

  const books = getBundleBooks(bundle);

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Bundles', url: 'https://bookshelf.com/library?preset=best' },
    { name: bundle.title, url: `https://bookshelf.com/bundles/${bundle.slug}` },
  ];

  const itemList = books.map((b, i) => ({
    name: b.title,
    url: `https://bookshelf.com/pdf/${b.slug}`,
    position: i + 1,
  }));

  const faqs = [
    {
      question: `What is included in the ${bundle.title}?`,
      answer: `This bundle includes ${bundle.bookIds.length} complete, DRM-free PDF books: ${books.map(b => b.title).join(', ')}.`,
    },
    {
      question: 'How do I download this bundle?',
      answer: 'Click the 1-Click Download Bundle button to download each verified PDF directly from Google Drive.',
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        title={bundle.title}
        description={bundle.desc}
        url={`https://bookshelf.com/bundles/${bundle.slug}`}
        items={itemList}
      />
      <FAQJsonLd faqs={faqs} />
      <BundleClient bundle={bundle} books={books} />
    </>
  );
}
