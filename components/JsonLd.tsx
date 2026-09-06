import React from 'react';
import { Product } from '@/lib/products';
import { getBaseUrl } from '@/lib/url';

interface BookJsonLdProps {
  book: Product;
  url?: string;
}

export function BookJsonLd({ book, url }: BookJsonLdProps) {
  const baseUrl = getBaseUrl();
  const canonicalUrl = url || `${baseUrl}/pdf/${book.slug}`;
  const rawCover = (book.coverImage || book.coverUrl || '').trim();
  const imageUrl = rawCover
    ? (rawCover.startsWith('http') ? rawCover : `${baseUrl}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`)
    : `${baseUrl}/api/og?title=${encodeURIComponent(book.title)}`;

  const cleanDesc = (book.blurb || book.desc || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  const authorSlug = book.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Book', 'Product'],
    name: book.title,
    headline: book.sub ? `${book.title}: ${book.sub}` : book.title,
    description: cleanDesc || `${book.title} PDF book by ${book.author}. Free instant download on Bookshelf.`,
    image: [imageUrl],
    url: canonicalUrl,
    inLanguage: book.lang || 'en',
    bookFormat: 'https://schema.org/EBook',
    encodingFormat: 'application/pdf',
    numberOfPages: Number(book.pages) || 80,
    genre: book.cat,
    datePublished: book.createdAt ? new Date(book.createdAt).toISOString().split('T')[0] : '2026-01-01',
    author: {
      '@type': 'Person',
      name: book.author,
      url: `${baseUrl}/author/${authorSlug}`,
    },
    brand: {
      '@type': 'Brand',
      name: book.author || 'Bookshelf',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bookshelf',
      url: baseUrl,
      logo: `${baseUrl}/api/og`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(book.rating || 4.8),
      bestRating: '5',
      worstRating: '1',
      ratingCount: Number(book.reviews) || 120,
      reviewCount: Number(book.reviews) || 120,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: book.type === 'free' ? '0' : String(book.price),
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      category: book.type === 'free' ? 'Free PDF Download' : 'Paid PDF Book',
      seller: {
        '@type': 'Organization',
        name: 'Bookshelf',
        url: baseUrl,
      },
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${canonicalUrl}#read-online`,
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/MobileWebPlatform',
          ],
        },
      },
      {
        '@type': 'DownloadAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: canonicalUrl,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bookshelf',
    alternateName: ['Bookshelf PDF Library', 'PDF-Bookshelf.com'],
    url: baseUrl,
    description: 'Download thousands of high-quality free PDF books on productivity, programming, design, and business.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/library?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const validFaqs = faqs.filter(f => f.question && f.answer);
  if (validFaqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.replace(/<[^>]*>?/gm, '').trim(),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd({ name, jobTitle, booksCount, url }: { name: string; jobTitle?: string; booksCount?: number; url: string }) {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    jobTitle: jobTitle || 'Author & Publisher',
    url: fullUrl,
    mainEntityOfPage: fullUrl,
    knowsAbout: ['Digital Publishing', 'PDF Books', 'Ebooks'],
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: booksCount || 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CollectionPageJsonLd({ name, description, url, count }: { name: string; description: string; url: string; count: number }) {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: fullUrl,
    numberOfItems: count,
    publisher: {
      '@type': 'Organization',
      name: 'Bookshelf',
      url: baseUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ItemListJsonLd({ title, description, url, items }: {
  title: string;
  description: string;
  url: string;
  items: { name: string; url: string; position?: number }[];
}) {
  const baseUrl = getBaseUrl();
  const fullListUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: fullListUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => {
      const itemUrl = item.url.startsWith('http')
        ? item.url
        : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      return {
        '@type': 'ListItem',
        position: item.position ?? (idx + 1),
        name: item.name,
        url: itemUrl,
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bookshelf',
    alternateName: 'Bookshelf Inc.',
    url: baseUrl,
    logo: `${baseUrl}/api/og`,
    description: 'Premier digital library for verified free PDF books, toolkits, and playbooks.',
    sameAs: [
      'https://twitter.com/bookshelf_pdf',
      'https://github.com/bookshelf-org',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@pdf-bookshelf.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
