import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { getSupabaseCategoryBooks, getSupabaseBooksByLanguage, getSupabaseTopicBooks } from '@/lib/supabaseDb';
import { Product } from '@/lib/products';
import { BreadcrumbJsonLd, FAQJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { getBaseUrl } from '@/lib/url';
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
  lang?: string;
  bookIds?: number[];
  verdict: string;
}

export const LISTICLES: Record<string, ListicleData> = {
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
  'best-ai-machine-learning-books': {
    title: 'Best Free AI & Machine Learning PDF Handbooks (2026)',
    metaTitle: 'Best Free AI, Deep Learning & LLM PDF Books (2026) | Bookshelf',
    metaDesc: 'Download top-rated free AI prompts, machine learning workflows, neural network architectures, and Python data science PDF books.',
    h1: 'Best Free AI, LLM & Machine Learning PDF Handbooks (2026)',
    intro: 'Master artificial intelligence, prompt engineering, and modern neural network engineering with our curated selection of open-access AI playbooks and code templates.',
    categories: ['Technology', 'Programming'],
    verdict: '"100 Battle-Tested AI Prompts" and "Applied Machine Learning" are essential primers for builders in 2026.',
  },
  'best-bangla-books-novels': {
    title: 'সেরা ১০টি ফ্রি বাংলা বই ও উপন্যাস (Best Bangla PDF Books)',
    metaTitle: 'সেরা ১০টি ফ্রি বাংলা বই ও উপন্যাস PDF ডাউনলোড | Bookshelf',
    metaDesc: 'রবীন্দ্রনাথ ঠাকুর, কাজী নজরুল ইসলাম, ও শরৎচন্দ্রের অমর সাহিত্য সহ সেরা ১০টি বাংলা বই ও উপন্যাস সম্পূর্ণ বিনামূল্যে ডাউনলোড করুন।',
    h1: 'সেরা ১০টি ফ্রি বাংলা বই ও উপন্যাস PDF ডাউনলোড',
    intro: 'বাংলা সাহিত্যের শ্রেষ্ঠ ক্লাসিক উপন্যাস, কাব্যগ্রন্থ ও বিখ্যাত সাহিত্যের নির্বাচিত সংকলন। স্পষ্ট বাংলা ফন্টে মোবাইল ও কম্পিউটারে পড়ার জন্য সম্পূর্ণ ফ্রি গুগল ড্রাইভ সরাসরি ডাউনলোড।',
    categories: ['Literature'],
    lang: 'bn',
    verdict: 'বাংলা সাহিত্যের গভীরতা ও অনুভূতির সেরা অভিজ্ঞতা পেতে রবীন্দ্রনাথের "গোরা" ও শরৎচন্দ্রের "দেবদাস" দিয়ে পাঠ শুরু করুন।',
  },
  'best-hindi-books-kahaniya': {
    title: 'सर्वश्रेष्ठ हिन्दी पुस्तकें एवं कहानियां (Best Hindi PDF Books)',
    metaTitle: 'सर्वश्रेष्ठ हिन्दी पुस्तकें एवं कहानियां PDF डाउनलोड | Bookshelf',
    metaDesc: 'मुंशी प्रेमचंद, हरिवंश राय बच्चन और आधुनिक लेखकों की शीर्ष हिन्दी कहानियां व पुस्तकें मुफ्त पीडीएफ में डाउनलोड करें।',
    h1: 'सर्वश्रेष्ठ हिन्दी पुस्तकें, कहानियां एवं उपन्यास PDF',
    intro: 'भारतीय साहित्य के कालजयी रचनाकारों की प्रसिद्ध कहानियां, काव्य संग्रह और ज्ञानवर्धक पुस्तकें। उच्च-गुणवत्ता वाली पीडीएफ में सीधे गूगल ड्राइव से मुफ्त डाउनलोड करें।',
    categories: ['Literature'],
    lang: 'hi',
    verdict: 'हिन्दी कथा साहित्य को गहराई से समझने के लिए मुंशी प्रेमचंद का महाकाव्यात्मक उपन्यास "गोदान" अवश्य पढ़ें।',
  },
  'best-urdu-novels-shayari': {
    title: 'بہترین اردو کتب، ناول اور شاعری (Best Urdu PDF Books)',
    metaTitle: 'بہترین شاہکار اردو کتب، ناول اور شاعری پی ڈی ایف ڈاؤن لوڈ | Bookshelf',
    metaDesc: 'علامہ اقبال، مرزا غالب، اور سعادت حسن منٹو کی شاہکار اردو کتب اور شاعری کی مفت پی ڈی ایف ڈاؤن لوڈ کریں۔',
    h1: 'بہترین شاہکار اردو کتب، ناول اور شاعری پی ڈی ایف',
    intro: 'اردو ادب کی لازوال کتب، دیوانِ غالب، اقبال کی انقلابی شاعری اور منٹو کے شاہکار افسانے۔ تمام پی ڈی ایف کتب موبائل اور ٹیبلٹ کے لیے بالکل مفت۔',
    categories: ['Literature'],
    lang: 'ur',
    verdict: 'اردو شاعری کے لازوال ذوق کے لیے علامہ اقبال کی "بانگ درا" اور مرزا غالب کا "دیوان غالب" اولین انتخاب ہیں۔',
  },
};

export const revalidate = 86400;

export async function generateStaticParams() {
  return Object.keys(LISTICLES).map(slug => ({ slug }));
}

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

  const canonicalUrl = `${getBaseUrl()}/best/${slug}`;

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

  const baseUrl = getBaseUrl();

  // Targeted indexed book query instead of full-table scan
  let filteredBooks: Product[] = [];
  if (listicle.lang) {
    const { books } = await getSupabaseBooksByLanguage(listicle.lang, 8);
    filteredBooks = books;
  } else {
    for (const cat of listicle.categories) {
      const { books } = await getSupabaseCategoryBooks(cat, 6);
      filteredBooks.push(...books);
      if (filteredBooks.length >= 8) break;
    }
  }

  // Fallback to local seed books if needed
  if (filteredBooks.length === 0) {
    filteredBooks = getAllBooks()
      .filter(b => listicle.categories.some(cat => cat.toLowerCase() === b.cat.toLowerCase()))
      .slice(0, 7);
  } else {
    filteredBooks = filteredBooks.slice(0, 8);
  }

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Best Of 2026', url: `${baseUrl}/library` },
    { name: listicle.title, url: `${baseUrl}/best/${slug}` },
  ];

  const itemList = filteredBooks.map((b, idx) => ({
    name: `${b.title} by ${b.author}`,
    url: `${baseUrl}/pdf/${b.slug}`,
    position: idx + 1,
  }));

  const listicleFaqs = [
    {
      question: `Are all books on this "${listicle.title}" list free?`,
      answer: `Yes! Every title featured in this roundup is available for 100% free direct PDF download via Google Drive on Bookshelf.`,
    },
    {
      question: `How are books selected for this curated roundup?`,
      answer: `Books are selected based on verified reader ratings (4.6+ stars), actionable depth, DRM-free licensing, and formatting quality for tablets and e-readers.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        title={listicle.title}
        description={listicle.metaDesc}
        url={`${baseUrl}/best/${slug}`}
        items={itemList}
      />
      <FAQJsonLd faqs={listicleFaqs} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Curated Roundups</Link> › <span>{listicle.title}</span>
        </div>

        {/* Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '36px 30px', borderRadius: 14, margin: '14px 0 28px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              ★ Curated Best Of 2026
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>· Updated August 2026 · {filteredBooks.length} Selected Titles</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '6px 0 12px' }}>
            {listicle.h1}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', maxWidth: 680, lineHeight: 1.6, margin: 0 }}>
            {listicle.intro}
          </p>
        </div>

        {/* Client Interactive Component */}
        <BestClient books={filteredBooks} verdict={listicle.verdict} faqs={listicleFaqs} />
      </div>
    </>
  );
}
