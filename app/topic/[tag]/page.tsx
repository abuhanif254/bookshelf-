import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { BreadcrumbJsonLd, CollectionPageJsonLd, FAQJsonLd } from '@/components/JsonLd';
import TopicClient from './TopicClient';

interface Props {
  params: Promise<{ tag: string }> | { tag: string };
}

const TOPICS: Record<string, { title: string; h1: string; desc: string; keywords: string[] }> = {
  'deep-work': {
    title: 'Deep Work & Concentration PDF Books & Planners (2026)',
    h1: 'Deep Work, Focus & Concentration PDF Handbooks',
    desc: 'Download free PDF guides on 90-minute focus sprints, distraction audits, and deep work scheduling systems.',
    keywords: ['focus', 'distraction', 'attention', 'productivity'],
  },
  'startup-launch': {
    title: 'Startup Launch & Indie Founder PDF Playbooks',
    h1: 'Startup Launch, Validation & Pricing PDF Playbooks',
    desc: 'Download free solo-founder launch frameworks, pricing page teardowns, and cold-email outreach scripts.',
    keywords: ['founder', 'launch', 'business', 'marketing', 'mrr'],
  },
  'javascript-patterns': {
    title: 'Modern JavaScript & TypeScript Patterns PDF Guides',
    h1: 'JavaScript Architecture & Clean Code PDF Handbooks',
    desc: 'Download free JavaScript design patterns, TypeScript architecture, and frontend performance blueprints.',
    keywords: ['javascript', 'patterns', 'programming', 'code', 'developer'],
  },
  'design-tokens': {
    title: 'Design Tokens & UI Component Architecture PDFs',
    h1: 'Design Tokens, Figma & Component Systems PDFs',
    desc: 'Download free design tokens handbooks, Figma to code sync checklists, and accessible UI kits.',
    keywords: ['design', 'tokens', 'components', 'figma', 'ui'],
  },
  'habit-building': {
    title: 'Habit Reset & Daily Routine PDF Protocols',
    h1: 'Habit Reset, Discipline & Routine Tracker PDFs',
    desc: 'Download free 21-day habit reset protocols, printable morning checklists, and discipline systems.',
    keywords: ['morning', 'reset', 'habit', 'self-help', 'routine'],
  },
  'ai-prompts': {
    title: 'AI Prompt Engineering & Machine Learning PDFs',
    h1: 'AI Prompts & Machine Learning Workflow Handbooks',
    desc: 'Download 100+ battle-tested AI prompts, LLM workflow guides, and practical automation scripts.',
    keywords: ['ai', 'prompts', 'technology', 'models', 'machine'],
  },
  'personal-finance': {
    title: 'Personal Finance & Automated Money Blueprint PDFs',
    h1: 'Automated Money & Investing Blueprint PDFs',
    desc: 'Download free personal finance PDF roadmaps, index fund allocation charts, and net worth planners.',
    keywords: ['finance', 'money', 'investing', 'savings', 'wealth'],
  },
  'sleep-optimization': {
    title: 'Sleep Optimization & Health Protocol PDF Books',
    h1: 'Sleep Optimization, CBT-I & Recovery PDF Protocols',
    desc: 'Download evidence-based sleep protocols, circadian reset guides, and daily energy checklists.',
    keywords: ['sleep', 'health', 'wellness', 'energy', 'recovery'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = typeof (params as Promise<{ tag: string }>)?.then === 'function'
    ? await (params as Promise<{ tag: string }>)
    : (params as { tag: string });

  const tag = resolved.tag.toLowerCase();
  const info = TOPICS[tag];

  if (!info) {
    return { title: 'Topic Library | Bookshelf' };
  }

  const canonicalUrl = `https://bookshelf.com/topic/${tag}`;

  return {
    title: `${info.title} | Bookshelf`,
    description: info.desc,
    keywords: [...info.keywords, 'free pdf download', 'digital books'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: info.title,
      description: info.desc,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const resolved = typeof (params as Promise<{ tag: string }>)?.then === 'function'
    ? await (params as Promise<{ tag: string }>)
    : (params as { tag: string });

  const tag = resolved.tag.toLowerCase();
  const info = TOPICS[tag];

  if (!info) {
    notFound();
  }

  const allBooks = getAllBooks();
  const matched = allBooks.filter(b => {
    const hay = (b.title + ' ' + b.sub + ' ' + b.cat + ' ' + b.blurb + ' ' + b.feat.join(' ')).toLowerCase();
    return info.keywords.some(kw => hay.includes(kw));
  });

  const displayBooks = matched.length > 0 ? matched : allBooks.slice(0, 4);

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Topics', url: 'https://bookshelf.com/library' },
    { name: info.h1, url: `https://bookshelf.com/topic/${tag}` },
  ];

  const topicFaqs = [
    {
      question: `Are these ${info.title} available for free PDF download?`,
      answer: `Yes! Every handbook and guide in this topic collection is 100% free with direct Google Drive downloads.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <CollectionPageJsonLd
        name={info.h1}
        description={info.desc}
        url={`https://bookshelf.com/topic/${tag}`}
        count={displayBooks.length}
      />
      <FAQJsonLd faqs={topicFaqs} />

      <div className="wrap" style={{ padding: '20px 20px 60px' }}>
        {/* Breadcrumb */}
        <div className="crumb">
          <Link href="/">Home</Link> › <Link href="/library">Topics</Link> › <span>{info.h1}</span>
        </div>

        {/* Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '36px 30px', borderRadius: 12, margin: '14px 0 28px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)' }}>
            Topic Silo · {displayBooks.length} Handbooks
          </span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '6px 0 10px' }}>
            {info.h1}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
            {info.desc}
          </p>
        </div>

        <TopicClient books={displayBooks} topicTitle={info.h1} />
      </div>
    </>
  );
}
