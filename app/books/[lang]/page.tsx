import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { getSupabaseBooks } from '@/lib/supabaseDb';
import { Product } from '@/lib/products';
import { BreadcrumbJsonLd, CollectionPageJsonLd, FAQJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { getBaseUrl } from '@/lib/url';
import { toListingBook } from '@/lib/helpers';
import {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  normalizeLanguageCode,
} from '@/lib/languages';
import LanguageClient from './LanguageClient';

// Cache language hubs at the edge for 24 hours (ISR)
export const revalidate = 86400;

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(l => ({ lang: l.slug }));
}

interface Props {
  params: Promise<{ lang: string }> | { lang: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ lang: string }>)?.then === 'function'
    ? await (params as Promise<{ lang: string }>)
    : (params as { lang: string });

  const cfg = getLanguageConfig(resolved.lang);

  if (!cfg) {
    return {
      title: 'Free Multilingual PDF Books | Bookshelf',
      description: 'Download verified free PDF books in Bangla, Hindi, Urdu, Spanish, Chinese, and English.',
    };
  }

  const canonicalUrl = `${getBaseUrl()}/books/${cfg.slug}`;

  return {
    title: cfg.seoTitle,
    description: cfg.seoDesc,
    keywords: [
      `free ${cfg.name.toLowerCase()} pdf books`,
      `download ${cfg.name.toLowerCase()} books pdf`,
      `${cfg.nativeName} pdf download`,
      `${cfg.name.toLowerCase()} literature pdf`,
      `free ${cfg.slug} ebooks`,
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${getBaseUrl()}/books/english`,
        'bn': `${getBaseUrl()}/books/bangla`,
        'hi': `${getBaseUrl()}/books/hindi`,
        'ur': `${getBaseUrl()}/books/urdu`,
        'es': `${getBaseUrl()}/books/spanish`,
        'zh': `${getBaseUrl()}/books/chinese`,
        'x-default': `${getBaseUrl()}/books/english`,
      },
    },
    openGraph: {
      title: cfg.seoTitle,
      description: cfg.seoDesc,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cfg.h1)}`,
          width: 1200,
          height: 630,
          alt: cfg.h1,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cfg.seoTitle,
      description: cfg.seoDesc,
      images: [`/api/og?title=${encodeURIComponent(cfg.h1)}`],
    },
  };
}

export default async function LanguagePage({ params }: Props) {
  const resolved = typeof (params as Promise<{ lang: string }>)?.then === 'function'
    ? await (params as Promise<{ lang: string }>)
    : (params as { lang: string });

  const cfg = getLanguageConfig(resolved.lang);
  if (!cfg) {
    notFound();
  }

  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();

  // Filter books matching this language
  const matchingBooks = allBooks.filter(b => {
    const bookLang = normalizeLanguageCode(b.lang);
    if (cfg.code === 'en') {
      return !b.lang || bookLang === 'en';
    }
    return bookLang === cfg.code;
  });

  const totalCount = matchingBooks.length;
  const availableCats = Array.from(new Set(matchingBooks.map(b => b.cat).filter(Boolean)));

  // Slice to top 48 books sorted by popularity and strip bloated descriptions to keep page payload < 50KB
  const displayBooks = [...matchingBooks]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 48)
    .map(toListingBook);

  const baseUrl = getBaseUrl();
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Languages', url: `${baseUrl}/library` },
    { name: `${cfg.name} (${cfg.nativeName})`, url: `${baseUrl}/books/${cfg.slug}` },
  ];

  // Localized FAQ items for this language hub
  const languageFaqs = [
    {
      question: `Are all ${cfg.name} PDF books 100% free to download on Bookshelf?`,
      answer: `Yes! Every book in our ${cfg.name} (${cfg.nativeName}) catalog is completely free for personal educational use, hosted on high-speed Google Drive streams with zero subscription costs.`,
    },
    {
      question: `How frequently is the ${cfg.name} library updated?`,
      answer: `We continuously expand our multilingual collections with verified public-domain and creative commons literature, updating the catalog weekly.`,
    },
    {
      question: `Can I read these ${cfg.name} PDFs on mobile devices, Kindle, and iPad?`,
      answer: `Yes. All PDFs are standard, high-resolution digital documents with native script support and clear typography, optimized for iPhones, Android smartphones, iPads, and desktop readers.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd
        name={cfg.h1}
        description={cfg.seoDesc}
        url={`${baseUrl}/books/${cfg.slug}`}
        count={totalCount}
      />
      <ItemListJsonLd
        title={cfg.h1}
        description={cfg.seoDesc}
        url={`${baseUrl}/books/${cfg.slug}`}
        items={displayBooks.slice(0, 20).map((b, i) => ({
          name: b.title,
          url: `${baseUrl}/pdf/${b.slug}`,
          position: i + 1,
        }))}
      />
      <FAQJsonLd faqs={languageFaqs} />

      <div
        className={`wrap script-${cfg.code}`}
        dir={cfg.isRtl ? 'rtl' : 'ltr'}
        lang={cfg.code}
        style={{ padding: '20px 20px 60px' }}
      >
        {/* Breadcrumbs */}
        <div className="crumb">
          <Link href="/">Home</Link> &rsaquo; <Link href="/library">Languages</Link> &rsaquo; <span>{cfg.name} ({cfg.nativeName})</span>
        </div>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          padding: '36px 30px',
          borderRadius: 12,
          margin: '14px 0 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--amber)',
            }}>
              Multilingual Hub · {totalCount.toLocaleString()} Verified PDFs
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
            }}>
              {cfg.nativeName}
            </span>
          </div>

          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(26px, 3.5vw, 38px)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: '8px 0 10px',
          }}>
            {cfg.h1}
          </h1>

          <p style={{
            fontSize: 16,
            color: '#cbd5e1',
            maxWidth: 720,
            lineHeight: 1.6,
            margin: 0,
          }}>
            {cfg.intro}
          </p>

          {/* Cross-Language Silo Links (Spider web crawling for Googlebot) */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
              Explore Other Languages:
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUPPORTED_LANGUAGES.filter(l => l.slug !== cfg.slug).map(lang => (
                <Link
                  key={lang.slug}
                  href={`/books/${lang.slug}`}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#e2e8f0',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '4px 12px',
                    borderRadius: 20,
                    textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: 'background 0.15s',
                  }}
                >
                  {lang.nativeName} ({lang.name}) &rarr;
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Client Interactive Grid with Search, Filters, and Localized FAQs */}
        <LanguageClient
          initialBooks={displayBooks}
          totalCount={totalCount}
          allCategories={availableCats}
          language={cfg}
          faqs={languageFaqs}
        />
      </div>
    </>
  );
}