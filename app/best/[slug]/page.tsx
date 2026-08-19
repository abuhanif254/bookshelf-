import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { Product } from '@/lib/products';
import { BreadcrumbJsonLd, FAQJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import BestClient from './BestClient';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

interface ListicleData {
  title: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  intro: string;
  categories: string[];
  bookIds?: number[];
  verdict: string;
}

const LISTICLES: Record<string, ListicleData> = {
  'free-programming-books-2026': {
    title: '7 Best Free Programming & Coding Books (2026 Edition)',
    metaTitle: '7 Best Free Programming & Software Engineering Books (2026) | Bookshelf',
    metaDesc: 'Download the top 7 free programming PDF books, JavaScript patterns, Python for data analysis, and software engineering handbooks. Instant Google Drive downloads.',
    h1: '7 Best Free Programming & Software Engineering PDF Books (2026)',
    intro: 'Whether you are an aspiring software engineer or a senior architect looking to master modern clean architecture, these 7 battle-tested programming books offer actionable frameworks, code snippets, and cheat sheets with zero filler.',
    categories: ['Programming', 'Technology'],
    verdict: 'For fullstack developers, "JavaScript Patterns 2nd Ed." is our top pick, while analysts should start with "Python for Analysts & Builders".',
  },
  'top-productivity-books-for-founders': {
    title: 'Top 6 Productivity & Focus Systems for Busy Founders',
    metaTitle: 'Top 6 Productivity & Focus PDF Books for Founders (2026) | Bookshelf',
    metaDesc: 'Explore the 6 highest-rated free productivity PDF books for builders, solo founders, and creators. Master deep work sprints and habit systems.',
    h1: 'Top 6 Productivity, Focus & Attention PDF Systems for Founders',
    intro: 'Building a business requires ruthless attention management. We curated the 6 most practical focus books that help you eliminate digital distraction, run 90-minute deep work sprints, and protect your energy.',
    categories: ['Productivity', 'Self-Help'],
    verdict: 'If you struggle with daily screen distraction, start with "Deep Focus" by Dr. Mara Chen.',
  },
  'best-personal-finance-books': {
    title: 'Best Free Personal Finance & Investing Blueprints',
    metaTitle: 'Best Free Personal Finance & Investing PDF Books (2026) | Bookshelf',
    metaDesc: 'Download top-rated free personal finance PDF books, money automation frameworks, and index investing blueprints with 1-click Google Drive downloads.',
    h1: 'Best Free Personal Finance & Money Management PDF Books',
    intro: 'Take control of your money without complex spreadsheets. These curated personal finance guides break down automated savings, tax-efficient investing, and salary negotiation into simple weekend routines.',
    categories: ['Finance', 'Business'],
    verdict: '"The Weekend Money Plan" is the fastest way to automate your finances in under 48 hours.',
  },
  'ui-ux-design-systems-guides': {
    title: 'Top Free UI/UX Design Systems & Typography Handbooks',
    metaTitle: 'Top Free UI/UX & Design Systems PDF Handbooks (2026) | Bookshelf',
    metaDesc: 'Download free UI/UX design PDF books, design system token architecture, and screen typography guidelines. Instant direct downloads.',
    h1: 'Top Free UI/UX Design Systems & Typography PDF Handbooks',
    intro: 'Scale your user interfaces with reusable design tokens, accessible components, and modular typographic scales tested in real-world product companies.',
    categories: ['Design'],
    verdict: '"Design Systems Handbook" by Studio Norr remains the benchmark for modern token architecture.',
  },
  'best-business-startup-playbooks': {
    title: 'Best Free Business & Indie Founder Playbooks',
    metaTitle: 'Best Free Business & Solo-Founder PDF Playbooks (2026) | Bookshelf',
    metaDesc: 'Download free business PDF playbooks, 0 to $10K MRR launch teardowns, and B2B sales templates with instant direct downloads.',
    h1: 'Best Free Business & Solo-Founder PDF Playbooks',
    intro: 'Learn how solo founders build profitable software, newsletters, and digital products from scratch without venture capital.',
    categories: ['Business', 'Marketing'],
    verdict: '"The Indie Founder Playbook" offers the highest density of actionable launch templates.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const slug = resolved.slug.toLowerCase();
  const listicle = LISTICLES[slug];

  if (!listicle) {
    return {
      title: 'Curated PDF Books Roundups | Bookshelf',
      description: 'Discover top-rated free PDF book roundups and reading guides.',
    };
  }

  const canonicalUrl = `https://bookshelf.com/best/${slug}`;

  return {
    title: listicle.metaTitle,
    description: listicle.metaDesc,
    keywords: [
      `${slug.replace(/-/g, ' ')}`,
      'best free pdf books',
      'top rated digital books 2026',
      'google drive free pdf',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: listicle.metaTitle,
      description: listicle.metaDesc,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(listicle.title)}`,
          width: 1200,
          height: 630,
          alt: listicle.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: listicle.metaTitle,
      description: listicle.metaDesc,
      images: [`/api/og?title=${encodeURIComponent(listicle.title)}`],
    },
  };
}

export default async function BestOfPage({ params }: Props) {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const slug = resolved.slug.toLowerCase();
  const listicle = LISTICLES[slug];

  if (!listicle) {
    notFound();
  }

  const allBooks = getAllBooks();
  const filteredBooks = allBooks.filter(b => listicle.categories.some(cat => cat.toLowerCase() === b.cat.toLowerCase())).slice(0, 7);

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Best Of 2026', url: 'https://bookshelf.com/library' },
    { name: listicle.title, url: `https://bookshelf.com/best/${slug}` },
  ];

  const itemList = filteredBooks.map((b, idx) => ({
    name: `${b.title} by ${b.author}`,
    url: `https://bookshelf.com/pdf/${b.slug}`,
    position: idx + 1,
  }));

  const listicleFaqs = [
    {
      question: `Are all books on this "${listicle.title}" list free?`,
      answer: `Yes! Every title featured in this roundup is available for 100% free direct PDF download via Google Drive on Bookshelf.`,
    },
    {
      question: `How are books selected for this curated roundup?`,
      answer: `Books are selected based on verified reader ratings (4.5+ stars), actionable depth, DRM-free licensing, and formatting quality for tablets and e-readers.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        title={listicle.title}
        description={listicle.metaDesc}
        url={`https://bookshelf.com/best/${slug}`}
        items={itemList}
      />
      <FAQJsonLd faqs={listicleFaqs} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Best Of 2026</Link> › <span>{listicle.title}</span>
        </div>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '36px 30px', borderRadius: 12, margin: '14px 0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 10px', borderRadius: 20 }}>
              🏆 Curated Editorial Roundup (2026)
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>· Updated Weekly</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '4px 0 12px' }}>
            {listicle.h1}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', maxWidth: 680, lineHeight: 1.5, margin: 0 }}>
            {listicle.intro}
          </p>
        </div>

        {/* Client Interactive Listicle */}
        <BestClient books={filteredBooks} verdict={listicle.verdict} faqs={listicleFaqs} />
      </div>
    </>
  );
}
