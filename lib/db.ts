import fs from 'fs';
import path from 'path';
import { Product, P } from './products';

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface CreatorSubmission {
  id: string;
  title: string;
  sub: string;
  author: string;
  authorEmail: string;
  cat: string;
  pages: number;
  driveUrl: string;
  blurb: string;
  desc: string;
  bg: string;
  ac: string;
  pat: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  seoTitle?: string;
  seoDesc?: string;
  h1?: string;
  intro?: string;
}

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  sub: string;
  ctaText: string;
  ctaUrl: string;
  bg: string;
  secondaryCta?: { text: string; url: string };
}

export interface PromoBarConfig {
  enabled: boolean;
  pillText: string;
  mainText: string;
  codeText: string;
  linkText: string;
  linkUrl: string;
}

export interface QuadCardConfig {
  id: string;
  title: string;
  type: 'grid' | 'single';
  linkText: string;
  linkUrl: string;
  bookIds: number[];
}

export interface ScrollSectionConfig {
  id: string;
  title: string;
  filterType: 'category' | 'preset' | 'custom';
  filterValue: string;
  bookIds?: number[];
}

export interface AdSettings {
  adNetwork: 'built-in' | 'adsterra' | 'monetag' | 'custom';
  countdownSeconds: number;
  adCode: string;
  directSmartLink: string;
  sponsorTitle: string;
  sponsorSubtitle: string;
  sponsorCta: string;
  sponsorUrl: string;
  adminPasscode: string;
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  aiApiKey?: string;
  aiProvider?: 'gemini' | 'openai' | 'groq' | 'deepseek' | 'auto';
  stats: {
    totalDownloads: number;
    adImpressions: number;
    adUnlocks: number;
    vipReferralUnlocks: number;
  };
}

export interface BookReview {
  id: string;
  bookId: number;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  approved: boolean;
  createdAt: string;
}

export interface AppDatabase {
  books: Product[];
  categories: CategoryConfig[];
  promoBar: PromoBarConfig;
  heroSlides: HeroSlide[];
  quadCards: QuadCardConfig[];
  scrollSections: ScrollSectionConfig[];
  subscribers: Subscriber[];
  submissions: CreatorSubmission[];
  referrals: Record<string, number>;
  reviews: BookReview[];
  settings: AdSettings;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bookshelf-db.json');

const defaultCategories: CategoryConfig[] = [
  { id: '1', name: 'Productivity', slug: 'productivity', badge: 'Popular', seoTitle: 'Best Free Productivity PDF Books & Focus Systems (2026)', h1: 'Free Productivity PDF Books & Guides', intro: 'Reclaim your attention, master daily deep-work blocks, and build unbreakable focus habits with our curated collection of free productivity PDFs.' },
  { id: '2', name: 'Programming', slug: 'programming', badge: 'Hot', seoTitle: 'Free Programming PDF Books, Cheat Sheets & Coding Handbooks', h1: 'Free Programming & Software Engineering PDFs', intro: 'From modern JavaScript patterns to data science and SQL query cheat sheets, explore battle-tested coding books written by experienced software engineers.' },
  { id: '3', name: 'Business', slug: 'business', badge: 'Trending', seoTitle: 'Free Business & Indie Founder Playbooks PDF Downloads (2026)', h1: 'Free Business, Startup & Solo-Founder PDFs', intro: 'Practical field manuals and real-world launch teardowns designed to take your digital products from idea to profitability without VC capital.' },
  { id: '4', name: 'Design', slug: 'design', badge: 'Creative', seoTitle: 'Free UI/UX Design Systems & Typography PDF Handbooks', h1: 'Free UI/UX, Design Systems & Typography PDFs', intro: 'Master design tokens, responsive component architecture, and modular typography scales with our handpicked free design books and checklists.' },
  { id: '5', name: 'Marketing', slug: 'marketing', badge: 'Growth', seoTitle: 'Free Digital Marketing & Email Sequences PDF Books', h1: 'Free Digital Marketing & Copywriting PDFs', intro: 'Proven email flows, copy-paste launch scripts, and digital product distribution playbooks tested across millions of subscribers.' },
  { id: '6', name: 'Self-Help', slug: 'self-help', badge: 'Mindset', seoTitle: 'Free Self-Help & Habit Building PDF Starter Kits', h1: 'Free Self-Help, Habits & Personal Growth PDFs', intro: 'Science-backed protocols to reset your daily routines, sustain positive habits, and eliminate burnout in practical, short reads.' },
  { id: '7', name: 'Technology', slug: 'technology', badge: 'AI & Tech', seoTitle: 'Free AI Prompts & Technology Handbook PDF Downloads', h1: 'Free AI & Technology PDF Handbooks', intro: 'Up-to-date AI prompts, model comparison guides, and modern tech workflows to accelerate your daily software and analysis tasks.' },
  { id: '8', name: 'Finance', slug: 'finance', badge: 'Money', seoTitle: 'Free Personal Finance & Investing Blueprint PDF Books', h1: 'Free Personal Finance & Money Management PDFs', intro: 'Set up automated financial systems, index investing plans, and net-worth tracking in one weekend without hype or guesswork.' },
  { id: '9', name: 'Health', slug: 'health', badge: 'Wellness', seoTitle: 'Free Sleep & Wellness Protocol PDF Books', h1: 'Free Health, Sleep & Wellness PDFs', intro: 'Evidence-based protocols for better sleep, mental clarity, and daily energy without expensive supplements or clinic waitlists.' },
];

const defaultPromoBar: PromoBarConfig = {
  enabled: true,
  pillText: '⚡ FREE PDF FRIDAYS',
  mainText: 'Download 10 new handpicked productivity & coding PDFs — 100% free this week only',
  codeText: 'NO CODE NEEDED',
  linkText: 'Claim Free PDFs ↗',
  linkUrl: '/library?preset=free',
};

const defaultHeroSlides: HeroSlide[] = [
  {
    id: 's1',
    tag: 'FREE PDF FRIDAYS · 10 TITLES ADDED',
    title: 'Download best-selling PDF books. Read anywhere.',
    sub: 'DRM-free for all devices · Instant delivery · Over 40,000 readers',
    ctaText: 'Browse Free Titles ⤓',
    ctaUrl: '/library?preset=free',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
    secondaryCta: { text: 'View All Deals', url: '/library?preset=deals' },
  },
  {
    id: 's2',
    tag: '#1 NEW RELEASE IN BUSINESS',
    title: 'The Indie Founder Playbook: $0 to $10K MRR',
    sub: 'Real launch teardowns, cold outreach scripts & pricing frameworks with zero VC fluff.',
    ctaText: 'Download Preview PDF ↗',
    ctaUrl: '/pdf/indie-founder-playbook',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%)',
  },
  {
    id: 's3',
    tag: 'LIMITED TIME DEAL · 50% OFF',
    title: 'Design Systems Handbook by Studio Norr',
    sub: 'Tokens, component architecture and Figma-to-code sync workflows that scale across teams.',
    ctaText: 'Get the Handbook · $29',
    ctaUrl: '/pdf/design-systems-handbook',
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f172a 100%)',
  },
];

const defaultQuadCards: QuadCardConfig[] = [
  { id: 'q1', title: 'Free PDF Friday · Top downloads', type: 'grid', linkText: 'Explore all 12 free titles', linkUrl: '/library?preset=free', bookIds: [5, 10, 15, 18] },
  { id: 'q2', title: 'Save up to 50% · Creator toolkits', type: 'grid', linkText: 'Shop the creator sale', linkUrl: '/library?preset=deals', bookIds: [1, 2, 4, 6] },
  { id: 'q3', title: 'Under $15 · Weekend deep-dives', type: 'grid', linkText: 'See all under $15', linkUrl: '/library?maxPrice=15', bookIds: [1, 5, 11, 14] },
  { id: 'q4', title: "Today's Spotlight · Staff recommendation", type: 'single', linkText: 'Read sample chapter', linkUrl: '/pdf/deep-focus', bookIds: [1] },
];

const defaultScrollSections: ScrollSectionConfig[] = [
  { id: 'sec-trending', title: 'Trending in Business & Productivity', filterType: 'category', filterValue: 'Productivity' },
  { id: 'sec-free', title: 'Free PDF Friday — Top Downloads', filterType: 'preset', filterValue: 'free' },
  { id: 'sec-under15', title: 'Under $15 — Weekend Deep-Dives', filterType: 'preset', filterValue: 'deals' },
  { id: 'sec-best', title: 'Best Sellers in Technology & Design', filterType: 'category', filterValue: 'Design' },
];

const defaultSubscribers: Subscriber[] = [
  { id: 'sub-1', email: 'alex.chen@example.com', subscribedAt: '2026-08-10T10:20:00Z' },
  { id: 'sub-2', email: 'sarah.m@example.com', subscribedAt: '2026-08-12T14:15:00Z' },
  { id: 'sub-3', email: 'dev.lead@example.com', subscribedAt: '2026-08-15T09:40:00Z' },
];

const defaultSubmissions: CreatorSubmission[] = [
  {
    id: 'sub-c1',
    title: 'Clean Code in Python 2026',
    sub: 'Architecture patterns for scalable backend services',
    author: 'Liam Vance',
    authorEmail: 'liam.vance@example.com',
    cat: 'Programming',
    pages: 148,
    driveUrl: 'https://drive.google.com/file/d/1X9aBcDeFgHiJkLmNoPqRsTuVwXyZ123/view',
    blurb: 'A comprehensive guide to refactoring and writing robust Python code.',
    desc: '<p>Master clean architecture in Python with real-world enterprise examples.</p>',
    bg: '#1e293b',
    ac: '#38bdf8',
    pat: 'p-grid',
    submittedAt: '2026-08-16T11:00:00Z',
    status: 'pending',
  },
];

const defaultSettings: AdSettings = {
  adNetwork: 'monetag',
  countdownSeconds: 8,
  adCode: `<script>(function(s){s.dataset.zone='11608665',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`,
  directSmartLink: 'https://omg10.com/4/11608657',
  sponsorTitle: 'SkillBoost Pro — Master High-Income Tech Skills',
  sponsorSubtitle: 'Get 85% off premium project-based roadmaps, certifications, and AI tools for developers.',
  sponsorCta: 'Explore SkillBoost Free Trial ↗',
  sponsorUrl: 'https://omg10.com/4/11608657',
  adminPasscode: 'bookshelf2026',
  siteName: 'Bookshelf',
  siteTagline: 'Buy & Download Free PDF Books Instantly',
  supportEmail: 'support@bookshelf.com',
  stats: {
    totalDownloads: 1420,
    adImpressions: 3890,
    adUnlocks: 2740,
    vipReferralUnlocks: 184,
  },
};

const defaultReviews: BookReview[] = [
  {
    id: 'rev-1',
    bookId: 1,
    userName: 'Sofia M.',
    rating: 5,
    title: 'Worth 10× the price',
    body: 'I finished it in one evening and applied the framework the next morning. The printable extras alone justify it. This is the kind of PDF you actually keep.',
    date: 'July 22, 2026',
    verified: true,
    helpfulCount: 142,
    approved: true,
    createdAt: '2026-07-22T10:00:00Z',
  },
  {
    id: 'rev-2',
    bookId: 1,
    userName: 'James T.',
    rating: 5,
    title: 'Practical, zero fluff',
    body: 'Every chapter ends with something to do, not something to ponder. I have shared copies with my engineering team and we run the playbook weekly.',
    date: 'July 9, 2026',
    verified: true,
    helpfulCount: 98,
    approved: true,
    createdAt: '2026-07-09T14:30:00Z',
  },
  {
    id: 'rev-3',
    bookId: 1,
    userName: 'Aisha B.',
    rating: 4,
    title: 'Great structure and actionable templates',
    body: 'Excellent structure and beautiful layout on both tablet and print. Wish there were more advanced examples in chapter 8, but the author replies promptly.',
    date: 'June 28, 2026',
    verified: true,
    helpfulCount: 65,
    approved: true,
    createdAt: '2026-06-28T09:15:00Z',
  },
];

let memoryDb: AppDatabase | null = null;

function ensureDbFile(): AppDatabase {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.books) && parsed.settings) {
        return {
          books: parsed.books,
          categories: parsed.categories || defaultCategories,
          promoBar: parsed.promoBar || defaultPromoBar,
          heroSlides: parsed.heroSlides || defaultHeroSlides,
          quadCards: parsed.quadCards || defaultQuadCards,
          scrollSections: parsed.scrollSections || defaultScrollSections,
          subscribers: parsed.subscribers || defaultSubscribers,
          submissions: parsed.submissions || defaultSubmissions,
          referrals: parsed.referrals || {},
          reviews: parsed.reviews || defaultReviews,
          settings: { ...defaultSettings, ...parsed.settings },
        };
      }
    }
  } catch (err) {
    console.error('Error reading bookshelf DB:', err);
  }

  const initialDb: AppDatabase = {
    books: P,
    categories: defaultCategories,
    promoBar: defaultPromoBar,
    heroSlides: defaultHeroSlides,
    quadCards: defaultQuadCards,
    scrollSections: defaultScrollSections,
    subscribers: defaultSubscribers,
    submissions: defaultSubmissions,
    referrals: {},
    reviews: defaultReviews,
    settings: defaultSettings,
  };

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial bookshelf DB:', err);
  }

  return initialDb;
}

export function getDatabase(): AppDatabase {
  if (!memoryDb) {
    memoryDb = ensureDbFile();
  }
  return memoryDb;
}

export function saveDatabase(db: AppDatabase): void {
  memoryDb = db;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting bookshelf DB:', err);
  }
}

// Books
export function getAllBooks(): Product[] {
  return getDatabase().books;
}

export function getBookById(id: number): Product | undefined {
  return getDatabase().books.find(b => b.id === id);
}

export function getBookBySlug(slug: string): Product | undefined {
  return getDatabase().books.find(b => b.slug === slug);
}

export function addBook(bookData: Omit<Product, 'id'>): Product {
  const db = getDatabase();
  const nextId = db.books.length > 0 ? Math.max(...db.books.map(b => b.id)) + 1 : 1;
  const newBook: Product = {
    ...bookData,
    id: nextId,
    downloads: 0,
    createdAt: new Date().toISOString(),
  };
  db.books.unshift(newBook);
  saveDatabase(db);
  return newBook;
}

export function updateBook(id: number, updates: Partial<Product>): Product | null {
  const db = getDatabase();
  const index = db.books.findIndex(b => b.id === id);
  if (index === -1) return null;
  db.books[index] = { ...db.books[index], ...updates };
  saveDatabase(db);
  return db.books[index];
}

export function deleteBook(id: number): boolean {
  const db = getDatabase();
  const initialLen = db.books.length;
  db.books = db.books.filter(b => b.id !== id);
  if (db.books.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Categories
export function getCategories(): CategoryConfig[] {
  return getDatabase().categories;
}

export function saveCategory(category: CategoryConfig): CategoryConfig {
  const db = getDatabase();
  const index = db.categories.findIndex(c => c.id === category.id || c.slug === category.slug);
  if (index >= 0) {
    db.categories[index] = { ...db.categories[index], ...category };
  } else {
    db.categories.push({ ...category, id: category.id || String(Date.now()) });
  }
  saveDatabase(db);
  return category;
}

export function deleteCategory(id: string): boolean {
  const db = getDatabase();
  const init = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== id && c.slug !== id);
  if (db.categories.length !== init) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// Creator Submissions
export function getCreatorSubmissions(): CreatorSubmission[] {
  return getDatabase().submissions || [];
}

export function addCreatorSubmission(submission: Omit<CreatorSubmission, 'id' | 'submittedAt' | 'status'>): CreatorSubmission {
  const db = getDatabase();
  if (!Array.isArray(db.submissions)) db.submissions = [];
  const newSubmission: CreatorSubmission = {
    ...submission,
    id: 'sub-' + Date.now(),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  db.submissions.unshift(newSubmission);
  saveDatabase(db);
  return newSubmission;
}

export function approveCreatorSubmission(id: string): Product | null {
  const db = getDatabase();
  const subIndex = db.submissions.findIndex(s => s.id === id);
  if (subIndex === -1) return null;

  const sub = db.submissions[subIndex];
  sub.status = 'approved';

  const slug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newBook = addBook({
    slug,
    title: sub.title,
    sub: sub.sub || 'Community Author Publication',
    author: sub.author,
    cat: sub.cat,
    type: 'free',
    price: 0,
    list: 14.99,
    rating: 4.8,
    reviews: 140,
    pages: sub.pages,
    badge: '#1 New Release',
    bought: 'Instant download',
    bg: sub.bg || '#0f2a43',
    fg: '#ffffff',
    ac: sub.ac || '#f59e0b',
    pat: sub.pat || 'p-rings',
    blurb: sub.blurb || sub.title,
    feat: ['Instant PDF download', 'DRM-free edition', 'Community verified author'],
    desc: sub.desc || `<p>${sub.title} by ${sub.author}. Download your free PDF copy instantly.</p>`,
    driveUrl: sub.driveUrl,
  });

  saveDatabase(db);
  return newBook;
}

export function rejectCreatorSubmission(id: string): boolean {
  const db = getDatabase();
  const subIndex = db.submissions.findIndex(s => s.id === id);
  if (subIndex === -1) return false;
  db.submissions[subIndex].status = 'rejected';
  saveDatabase(db);
  return true;
}

// Referrals
export function trackReferralClick(refCode: string): number {
  const db = getDatabase();
  if (!db.referrals) db.referrals = {};
  const current = (db.referrals[refCode] || 0) + 1;
  db.referrals[refCode] = current;
  saveDatabase(db);
  return current;
}

export function getReferralCount(refCode: string): number {
  const db = getDatabase();
  return (db.referrals && db.referrals[refCode]) || 0;
}

// Subscribers
export function getSubscribers(): Subscriber[] {
  return getDatabase().subscribers || [];
}

export function addSubscriber(email: string): { success: boolean; message: string } {
  const db = getDatabase();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'Invalid email address' };
  }
  if (!Array.isArray(db.subscribers)) {
    db.subscribers = [];
  }
  const exists = db.subscribers.some(s => s.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: true, message: 'You are already subscribed to Free PDF Fridays!' };
  }
  db.subscribers.unshift({
    id: 'sub-' + Date.now(),
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
  });
  saveDatabase(db);
  return { success: true, message: 'Subscribed successfully! Check your inbox this Friday 📬' };
}

// Homepage Sections
export function getSectionsData() {
  const db = getDatabase();
  return {
    promoBar: db.promoBar,
    heroSlides: db.heroSlides,
    quadCards: db.quadCards,
    scrollSections: db.scrollSections,
  };
}

export function updateSectionsData(updates: Partial<{
  promoBar: PromoBarConfig;
  heroSlides: HeroSlide[];
  quadCards: QuadCardConfig[];
  scrollSections: ScrollSectionConfig[];
}>) {
  const db = getDatabase();
  if (updates.promoBar) db.promoBar = updates.promoBar;
  if (updates.heroSlides) db.heroSlides = updates.heroSlides;
  if (updates.quadCards) db.quadCards = updates.quadCards;
  if (updates.scrollSections) db.scrollSections = updates.scrollSections;
  saveDatabase(db);
  return getSectionsData();
}

// Settings & Analytics
export function getAdSettings(): AdSettings {
  return getDatabase().settings;
}

export function updateAdSettings(updates: Partial<AdSettings>): AdSettings {
  const db = getDatabase();
  db.settings = { ...db.settings, ...updates, stats: { ...db.settings.stats, ...(updates.stats || {}) } };
  saveDatabase(db);
  return db.settings;
}

export function incrementStat(type: 'totalDownloads' | 'adImpressions' | 'adUnlocks' | 'vipReferralUnlocks'): void {
  const db = getDatabase();
  db.settings.stats[type] = (db.settings.stats[type] || 0) + 1;
  saveDatabase(db);
}

// Reader Reviews CRUD
export function getAllReviews(): BookReview[] {
  const db = getDatabase();
  return db.reviews || [];
}

export function getBookReviews(bookId: number): BookReview[] {
  const db = getDatabase();
  return (db.reviews || []).filter(r => r.bookId === bookId && r.approved);
}

export function addBookReview(data: {
  bookId: number;
  userName: string;
  rating: number;
  title: string;
  body: string;
  verified?: boolean;
}): BookReview {
  const db = getDatabase();
  if (!db.reviews) db.reviews = [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const newReview: BookReview = {
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    bookId: data.bookId,
    userName: data.userName.trim() || 'Anonymous Reader',
    rating: Math.max(1, Math.min(5, Math.round(data.rating))),
    title: data.title.trim(),
    body: data.body.trim(),
    date: dateStr,
    verified: data.verified ?? true,
    helpfulCount: 0,
    approved: true,
    createdAt: now.toISOString(),
  };

  db.reviews.unshift(newReview);

  // Recalculate book rating and review count
  const bookIndex = db.books.findIndex(b => b.id === data.bookId);
  if (bookIndex !== -1) {
    const book = db.books[bookIndex];
    const newTotalReviews = (book.reviews || 0) + 1;
    const currentSum = (book.rating || 4.8) * (book.reviews || 100);
    const newAvg = Number(((currentSum + newReview.rating) / (newTotalReviews + 99)).toFixed(1));
    book.rating = Math.min(5.0, Math.max(1.0, newAvg));
    book.reviews = newTotalReviews;
  }

  saveDatabase(db);
  return newReview;
}

export function voteReviewHelpful(reviewId: string): boolean {
  const db = getDatabase();
  const review = (db.reviews || []).find(r => r.id === reviewId);
  if (review) {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    saveDatabase(db);
    return true;
  }
  return false;
}

export function deleteReview(reviewId: string): boolean {
  const db = getDatabase();
  const initialLength = (db.reviews || []).length;
  db.reviews = (db.reviews || []).filter(r => r.id !== reviewId);
  if (db.reviews.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}
