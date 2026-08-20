import React from 'react';
import { Product } from '@/lib/products';
import { getBaseUrl } from '@/lib/url';

interface BookJsonLdProps {
  book: Product;
  url?: string;
}

export function BookJsonLd({ book, url }: BookJsonLdProps) {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    headline: `${book.title}: ${book.sub}`,
    description: book.blurb || book.desc.replace(/<[^>]*>?/gm, ''),
    author: {
      '@type': 'Person',
      name: book.author,
      url: `${baseUrl}/author/${book.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`,
    },
    genre: book.cat,
    numberOfPages: book.pages,
    inLanguage: 'en',
    bookFormat: 'https://schema.org/EBook',
    encodingFormat: 'application/pdf',
    url: url || `${baseUrl}/pdf/${book.slug}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: book.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: book.reviews,
    },
    offers: {
      '@type': 'Offer',
      price: book.type === 'free' ? '0' : String(book.price),
      priceCurrency: 'USD',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      category: book.type === 'free' ? 'Free PDF Download' : 'Paid PDF Book',
    },
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
    alternateName: ['Bookshelf PDF Library', 'Bookshelf.com'],
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    jobTitle: jobTitle || 'Author & Publisher',
    url: url,
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url,
    numberOfItems: count,
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
  items: { name: string; url: string; position: number }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: url,
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
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
      email: 'support@bookshelf.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
