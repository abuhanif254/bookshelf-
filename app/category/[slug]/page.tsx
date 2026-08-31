import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks, getCategories } from '@/lib/db';
import { getSupabaseBooks, getSupabaseCategories } from '@/lib/supabaseDb';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { BreadcrumbJsonLd, CollectionPageJsonLd, FAQJsonLd } from '@/components/JsonLd';
import CategoryClient from './CategoryClient';

// Cache category hub pages at the CDN edge for 24 hours (ISR).
// With 450+ categories, this prevents a Supabase full-table scan
// on every visitor landing on any category page.
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

const CATEGORY_META: Record<string, { title: string; desc: string; h1: string; intro: string }> = {
  productivity: {
    title: 'Best Free Productivity PDF Books & Focus Systems (2026)',
    desc: 'Download top-rated free productivity PDF books, deep work planners, and time management systems. Instant direct Google Drive downloads.',
    h1: 'Free Productivity PDF Books & Guides',
    intro: 'Reclaim your attention, master daily deep-work blocks, and build unbreakable focus habits with our curated collection of free productivity PDFs.',
  },
  programming: {
    title: 'Free Programming PDF Books, Cheat Sheets & Coding Handbooks',
    desc: 'Download verified free programming PDF books, JavaScript patterns, Python for analysts, and SQL cheat sheets. 100% free with instant access.',
    h1: 'Free Programming & Software Engineering PDFs',
    intro: 'From modern JavaScript patterns to data science and SQL query cheat sheets, explore battle-tested coding books written by experienced software engineers.',
  },
  business: {
    title: 'Free Business & Indie Founder Playbooks PDF Downloads (2026)',
    desc: 'Download free business PDF books, solo-founder launch checklists, pricing frameworks, and negotiation scripts with instant download links.',
    h1: 'Free Business, Startup & Solo-Founder PDFs',
    intro: 'Practical field manuals and real-world launch teardowns designed to take your digital products from idea to profitability without VC capital.',
  },
  design: {
    title: 'Free UI/UX Design Systems & Typography PDF Handbooks',
    desc: 'Download free design PDF books on design systems, typography for screens, Figma workflows, and creative exercises. Instant direct download.',
    h1: 'Free UI/UX, Design Systems & Typography PDFs',
    intro: 'Master design tokens, responsive component architecture, and modular typography scales with our handpicked free design books and checklists.',
  },
  marketing: {
    title: 'Free Digital Marketing & Email Sequences PDF Books',
    desc: 'Download free marketing PDF books, high-converting launch sequences, and audience growth guides. Instant direct Google Drive downloads.',
    h1: 'Free Digital Marketing & Copywriting PDFs',
    intro: 'Proven email flows, copy-paste launch scripts, and digital product distribution playbooks tested across millions of subscribers.',
  },
  'self-help': {
    title: 'Free Self-Help & Habit Building PDF Starter Kits',
    desc: 'Download free self-help PDF books, morning reset routines, and printable habit tracker cards. 100% free forever with instant delivery.',
    h1: 'Free Self-Help, Habits & Personal Growth PDFs',
    intro: 'Science-backed protocols to reset your daily routines, sustain positive habits, and eliminate burnout in practical, short reads.',
  },
  technology: {
    title: 'Free AI Prompts & Technology Handbook PDF Downloads',
    desc: 'Download free technology PDF books, 100 battle-tested AI prompts, and machine learning workflows for 2026. Instant direct downloads.',
    h1: 'Free AI & Technology PDF Handbooks',
    intro: 'Up-to-date AI prompts, model comparison guides, and modern tech workflows to accelerate your daily software and analysis tasks.',
  },
  finance: {
    title: 'Free Personal Finance & Investing Blueprint PDF Books',
    desc: 'Download free personal finance PDF books, money automation diagrams, and net-worth spreadsheets with instant Google Drive links.',
    h1: 'Free Personal Finance & Money Management PDFs',
    intro: 'Set up automated financial systems, index investing plans, and net-worth tracking in one weekend without hype or guesswork.',
  },
  health: {
    title: 'Free Sleep & Wellness Protocol PDF Books',
    desc: 'Download free health and wellness PDF books based on CBT-I protocols and evidence-based routines. 100% free direct downloads.',
    h1: 'Free Health, Sleep & Wellness PDFs',
    intro: 'Evidence-based protocols for better sleep, mental clarity, and daily energy without expensive supplements or clinic waitlists.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const slug = resolved.slug.toLowerCase();
  const meta = CATEGORY_META[slug];

  if (!meta) {
    const formatted = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      title: `Free ${formatted} PDF Books | Bookshelf`,
      description: `Download verified free ${formatted} PDF books and guides with instant direct delivery.`,
    };
  }

  const canonicalUrl = `https://www.pdf-bookshelf.com/category/${slug}`;

  return {
    title: meta.title,
    description: meta.desc,
    keywords: [
      `free ${slug} pdf books`,
      `download ${slug} pdf`,
      `best ${slug} books free`,
      `${slug} cheat sheets pdf`,
      'instant pdf downloads',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.desc,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(meta.title)}`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.desc,
      images: [`/api/og?title=${encodeURIComponent(meta.title)}`],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolved = typeof (params as Promise<{ slug: string }>)?.then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });

  const slug = resolved.slug.toLowerCase();
  const supaBooks = await getSupabaseBooks();
  const allBooks = supaBooks && supaBooks.length > 0 ? supaBooks : getAllBooks();

  // Match category by slug
  const matchingBooks = allBooks.filter(
    b => b.cat.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug || b.cat.toLowerCase() === slug
  );

  const supaCats = await getSupabaseCategories();
  const foundCustomCat = supaCats?.find(c => c.slug === slug);

  if (matchingBooks.length === 0 && !CATEGORY_META[slug] && !foundCustomCat) {
    notFound();
  }

  const catInfo = CATEGORY_META[slug] || (foundCustomCat ? {
    title: foundCustomCat.seoTitle || `Free ${foundCustomCat.name} PDF Books`,
    desc: foundCustomCat.intro || `Download free ${foundCustomCat.name} PDF books and guides.`,
    h1: foundCustomCat.h1 || `Free ${foundCustomCat.name} PDF Books`,
    intro: foundCustomCat.intro || `Explore our collection of free ${foundCustomCat.name} books with instant Google Drive downloads.`,
  } : {
    title: `Free ${slug.toUpperCase()} PDF Books`,
    desc: `Browse all free ${slug} PDF books and toolkits.`,
    h1: `Free ${slug.charAt(0).toUpperCase() + slug.slice(1)} PDF Books`,
    intro: `Explore our collection of free ${slug} books with instant Google Drive downloads.`,
  });

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.pdf-bookshelf.com' },
    { name: 'Categories', url: 'https://www.pdf-bookshelf.com/library' },
    { name: catInfo.h1, url: `https://www.pdf-bookshelf.com/category/${slug}` },
  ];

  const categoryFaqs = [
    {
      question: `Are all ${catInfo.h1} free to download on Bookshelf?`,
      answer: `Yes! Bookshelf provides 100% free PDF downloads for titles in the ${slug} catalog. Downloads are hosted on secure Google Drive streams with no credit card required.`,
    },
    {
      question: `Can I read these ${slug} PDFs on iPad, Kindle, or Android phones?`,
      answer: `All our PDF books are DRM-free and formatted for standard mobile screens, tablet readers, and desktop monitors. You can import them directly into Apple Books, Kindle, or any PDF reader app.`,
    },
    {
      question: `How often are new ${slug} titles added?`,
      answer: `We update the library every week, including our popular Free PDF Fridays drops featuring new toolkits, cheat sheets, and books.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd
        name={catInfo.h1}
        description={catInfo.desc}
        url={`https://www.pdf-bookshelf.com/category/${slug}`}
        count={matchingBooks.length}
      />
      <FAQJsonLd faqs={categoryFaqs} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> â€º <Link href="/library">Categories</Link> â€º <span>{catInfo.h1}</span>
        </div>

        {/* Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '36px 30px', borderRadius: 12, margin: '14px 0 28px' }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)' }}>
            Category Hub Â· {matchingBooks.length} Verified PDFs
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '8px 0 10px' }}>
            {catInfo.h1}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
            {catInfo.intro}
          </p>
        </div>

        {/* Client Interactive Grid */}
        <CategoryClient books={matchingBooks} categoryName={catInfo.h1} faqs={categoryFaqs} />
      </div>
    </>
  );
}
