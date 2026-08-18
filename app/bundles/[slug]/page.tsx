import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBundleBySlug, getBundleBooks } from '@/lib/bundles';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import BundleClient from './BundleClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = getBundleBySlug(slug);
  if (!bundle) return { title: 'Bundle Not Found' };

  return {
    title: `${bundle.title} | Bookshelf Bundles`,
    description: `${bundle.desc} Includes ${bundle.bookIds.length} complete PDF books with instant download.`,
    openGraph: {
      title: `${bundle.title} — 3-Book PDF Stack`,
      description: bundle.desc,
      url: `https://bookshelf.com/bundles/${bundle.slug}`,
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
    { name: 'Bundles', url: 'https://bookshelf.com/bundles' },
    { name: bundle.title, url: `https://bookshelf.com/bundles/${bundle.slug}` },
  ];

  const itemList = books.map((b, i) => ({
    name: b.title,
    url: `https://bookshelf.com/pdf/${b.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        title={bundle.title}
        description={bundle.desc}
        url={`https://bookshelf.com/bundles/${bundle.slug}`}
        items={itemList}
      />
      <BundleClient bundle={bundle} books={books} />
    </>
  );
}
