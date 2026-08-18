import { Product, byId, P } from './products';

export interface Bundle {
  slug: string;
  title: string;
  sub: string;
  tagline: string;
  desc: string;
  bookIds: number[];
  badge: string;
  bg: string;
}

export const BUNDLES: Bundle[] = [
  {
    slug: 'indie-founder-stack',
    title: 'The Indie Founder 3-Book Power Stack',
    sub: 'From $0 to $10K MRR, Deep Focus Architecture & High-Converting Copy',
    tagline: 'Save 65% on the definitiveIndie Maker trilogy (480 total pages).',
    desc: 'Everything you need to conceptualize, code, launch, and monetize a digital SaaS or information product without VC funding.',
    bookIds: [2, 1, 6],
    badge: 'Best Value Bundle',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  },
  {
    slug: 'fullstack-developer-kit',
    title: 'The Full-Stack Software Engineer Toolkit',
    sub: 'AI Handbooks, SQL Queries & Architecture Design Systems',
    tagline: 'Three comprehensive engineering guides for modern tech stacks.',
    desc: 'Master prompt patterns, database indexing protocols, and modular design tokens with handpicked PDFs created by experienced staff engineers.',
    bookIds: [20, 5, 4],
    badge: 'Popular for Engineers',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
  {
    slug: 'high-performance-habits',
    title: 'The High-Performance Habit Reset Collection',
    sub: 'Sleep Mastery, Cognitive Stamina & Daily Deep Work Protocols',
    tagline: 'Evidence-based protocols to reclaim your attention and energy.',
    desc: 'Science-backed daily routines, nutrition for focus, and workspace distractions audits in three short, high-impact PDF manuals.',
    bookIds: [1, 7, 18],
    badge: 'Wellness & Focus',
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
  },
];

export function getAllBundles(): Bundle[] {
  return BUNDLES;
}

export function getBundleBySlug(slug: string): Bundle | undefined {
  return BUNDLES.find(b => b.slug === slug);
}

export function getBundleBooks(bundle: Bundle): Product[] {
  return bundle.bookIds.map(id => byId(id)).filter(Boolean) as Product[];
}
