import { getBookBySlug } from '@/lib/db';
import { getSupabaseBookBySlug } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'book';
  const slug = searchParams.get('slug');
  const customTitle = searchParams.get('title') || 'Bookshelf — Free PDF Library';
  const authorParam = searchParams.get('author');
  const catParam = searchParams.get('cat');
  const countParam = searchParams.get('count');
  const langParam = searchParams.get('lang');

  // 1. Book detail card mode
  let book = null;
  if (slug) {
    try {
      book = await getSupabaseBookBySlug(slug);
    } catch {}
    if (!book) {
      book = getBookBySlug(slug) || null;
    }
  }

  let kicker = '⚡ FREE PDF DROP';
  let title = book ? book.title : customTitle;
  let subtitle = book ? `by ${book.author}` : 'Download & Read Free PDF Books';
  let category = book ? book.cat : (catParam || 'Digital Library');
  let tag1 = book ? `${book.pages} Pages PDF` : '300,000+ Titles';
  let tag2 = '⚡ Instant Download';
  let bg = book?.bg || '#0f172a';
  let ac = book?.ac || '#f59e0b';

  // 2. Author Profile card mode
  if (type === 'author' || authorParam) {
    kicker = '✍️ VERIFIED AUTHOR PROFILE';
    title = authorParam || title;
    subtitle = `${countParam ? countParam + ' ' : ''}Free PDF Books & Field Manuals`;
    category = 'Author Catalog';
    tag1 = 'Open Access';
    tag2 = '100% Free Downloads';
    bg = '#1e1b4b';
    ac = '#818cf8';
  }

  // 3. Category Hub card mode
  else if (type === 'category' || catParam) {
    kicker = '📁 CURATED SUBJECT COLLECTION';
    title = catParam ? `Free ${catParam} PDF Books` : title;
    subtitle = `Complete collection · ${countParam ? countParam + ' titles' : 'Verified PDFs'}`;
    category = catParam || category;
    tag1 = 'Updated Weekly';
    tag2 = 'High-Speed Stream';
    bg = '#064e3b';
    ac = '#34d399';
  }

  // 4. Multilingual Hub card mode
  else if (type === 'lang' || langParam) {
    kicker = '🌐 MULTILINGUAL DIGITAL LIBRARY';
    title = customTitle || 'Free Multilingual PDF Books';
    subtitle = 'Native Script Typography · Zero Paywalls';
    category = langParam ? langParam.toUpperCase() : 'World Literature';
    tag1 = 'Public Domain & CC';
    tag2 = 'Kindle & iPad Ready';
    bg = '#4c0519';
    ac = '#fb7185';
  }

  // 5. Head-to-Head Book Comparison Mode
  const isComparison = type === 'compare' || customTitle.includes(' vs ');
  if (isComparison) {
    kicker = '⚔️ HEAD-TO-HEAD BOOK SHOWDOWN';
    title = customTitle;
    subtitle = 'Direct Side-by-Side Analysis · 100% Free Downloads';
    category = 'Comparative Study';
    tag1 = 'Dual Book Guide';
    tag2 = 'Free Google Drive PDF';
    bg = '#1e1b4b';
    ac = '#f59e0b';
  }

  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeCategory = escapeXml(category);
  const safeKicker = escapeXml(kicker);
  const safeTag1 = escapeXml(tag1);
  const safeTag2 = escapeXml(tag2);

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="${bg}"/>
      </linearGradient>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#050811"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <circle cx="1100" cy="100" r="320" fill="${ac}" opacity="0.10"/>
    <circle cx="100" cy="520" r="260" fill="#38bdf8" opacity="0.06"/>

    <!-- Left Content Box -->
    <g transform="translate(100, 95)">
      <!-- Brand Pill -->
      <rect width="290" height="38" rx="19" fill="rgba(245, 158, 11, 0.15)" stroke="${ac}" stroke-width="1.5"/>
      <text x="145" y="24" fill="${ac}" font-size="12" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="1.2">${safeKicker}</text>

      <!-- Category -->
      <text x="0" y="85" fill="#94a3b8" font-size="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" letter-spacing="2">${safeCategory.toUpperCase()}</text>

      <!-- Title -->
      <text x="0" y="150" fill="#ffffff" font-size="${isComparison ? '40' : '48'}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900">
        ${safeTitle.length > 36 ? safeTitle.slice(0, 34) + '…' : safeTitle}
      </text>

      <!-- Subtitle / Author -->
      <text x="0" y="210" fill="#cbd5e1" font-size="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="500">${safeSubtitle.slice(0, 52)}</text>

      <!-- Stars Rating & Quality Seal -->
      <text x="0" y="270" fill="#f59e0b" font-size="22" font-family="sans-serif">★★★★★ <tspan fill="#94a3b8" font-size="16"> 4.9 / 5.0 (Bookshelf Verified Library)</tspan></text>

      <!-- Features Tag Bar -->
      <g transform="translate(0, 320)">
        <rect width="180" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="90" y="26" fill="#f8fafc" font-size="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" text-anchor="middle">📄 ${safeTag1}</text>

        <rect x="195" width="220" height="42" rx="8" fill="#065f46" stroke="#059669"/>
        <text x="305" y="26" fill="#ffffff" font-size="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="bold" text-anchor="middle">⚡ ${safeTag2}</text>
      </g>
    </g>

    <!-- Right: Book 3D Mockup / Dual Showdown Graphics -->
    ${isComparison ? `
    <g transform="translate(760, 100)">
      <!-- Left Card -->
      <g transform="translate(0, 40) rotate(-6)">
        <rect width="170" height="260" rx="12" fill="#0f172a" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="24" y="60" fill="#94a3b8" font-size="12" font-family="sans-serif" font-weight="bold">EDITION A</text>
        <text x="24" y="120" fill="#ffffff" font-size="18" font-family="sans-serif" font-weight="900">Book A</text>
        <text x="24" y="230" fill="#34d399" font-size="13" font-family="sans-serif" font-weight="bold">Free PDF ⤓</text>
      </g>
      <!-- Right Card -->
      <g transform="translate(130, 80) rotate(8)">
        <rect width="170" height="260" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="24" y="60" fill="#94a3b8" font-size="12" font-family="sans-serif" font-weight="bold">EDITION B</text>
        <text x="24" y="120" fill="#ffffff" font-size="18" font-family="sans-serif" font-weight="900">Book B</text>
        <text x="24" y="230" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Free PDF ⤓</text>
      </g>
      <!-- Center VS Badge -->
      <circle cx="150" cy="180" r="36" fill="#f59e0b" stroke="#ffffff" stroke-width="4"/>
      <text x="150" y="188" fill="#0f172a" font-size="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" text-anchor="middle">VS</text>
    </g>
    ` : `
    <g transform="translate(820, 105)">
      <rect width="280" height="420" rx="16" fill="url(#bookGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
      <circle cx="230" cy="50" r="18" fill="${ac}"/>
      <text x="35" y="160" fill="#ffffff" font-size="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900">${safeTitle.slice(0, 18)}</text>
      <text x="35" y="200" fill="#94a3b8" font-size="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${safeSubtitle.slice(0, 22)}</text>
      <rect x="35" y="340" width="120" height="30" rx="6" fill="${ac}"/>
      <text x="95" y="360" fill="#0f172a" font-size="12" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" text-anchor="middle">PDF-BOOKSHELF</text>
    </g>
    `}
  </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
