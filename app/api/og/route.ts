import { NextResponse } from 'next/server';
import { getBookBySlug } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const customTitle = searchParams.get('title') || 'Bookshelf — Free PDF Library';

  const book = slug ? getBookBySlug(slug) : null;
  const title = book ? book.title : customTitle;
  const author = book ? `by ${book.author}` : 'Download & Read Free PDF Books';
  const category = book ? book.cat : 'Digital Library';
  const pages = book ? `${book.pages} Pages PDF` : '100% Free';
  const bg = book ? book.bg : '#0f172a';
  const ac = book ? book.ac : '#f59e0b';

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#050811"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <circle cx="1100" cy="100" r="300" fill="${ac}" opacity="0.08"/>
    <circle cx="100" cy="500" r="250" fill="#38bdf8" opacity="0.05"/>

    <!-- Left Content Box -->
    <g transform="translate(100, 100)">
      <!-- Brand Pill -->
      <rect width="170" height="36" rx="18" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="85" y="23" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="1">⚡ FREE PDF DROP</text>

      <!-- Category -->
      <text x="0" y="85" fill="#94a3b8" font-size="20" font-family="sans-serif" font-weight="bold" letter-spacing="2">${category.toUpperCase()}</text>

      <!-- Title -->
      <text x="0" y="150" fill="#ffffff" font-size="52" font-family="sans-serif" font-weight="900">
        ${title.length > 28 ? title.slice(0, 26) + '…' : title}
      </text>

      <!-- Author -->
      <text x="0" y="210" fill="#cbd5e1" font-size="28" font-family="sans-serif" font-weight="500">${author}</text>

      <!-- Stars Rating -->
      <text x="0" y="270" fill="#f59e0b" font-size="24" font-family="sans-serif">★★★★★ <tspan fill="#94a3b8" font-size="18"> 4.8 / 5.0 (2.3K reviews)</tspan></text>

      <!-- Features Tag Bar -->
      <g transform="translate(0, 320)">
        <rect width="150" height="42" rx="8" fill="#1e293b" stroke="#334155"/>
        <text x="75" y="26" fill="#f8fafc" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">📄 ${pages}</text>

        <rect x="165" width="180" height="42" rx="8" fill="#065f46" stroke="#059669"/>
        <text x="255" y="26" fill="#ffffff" font-size="15" font-family="sans-serif" font-weight="bold" text-anchor="middle">⚡ Instant Download</text>
      </g>
    </g>

    <!-- Right: Book 3D Cover Mockup -->
    <g transform="translate(820, 100)">
      <rect width="280" height="420" rx="14" fill="url(#bookGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="drop-shadow(0 25px 35px rgba(0,0,0,0.6))"/>
      <circle cx="230" cy="50" r="18" fill="${ac}"/>
      <text x="35" y="160" fill="#ffffff" font-size="26" font-family="sans-serif" font-weight="900">${title.slice(0, 18)}</text>
      <text x="35" y="200" fill="#94a3b8" font-size="16" font-family="sans-serif">${author}</text>
      <rect x="35" y="340" width="100" height="28" rx="6" fill="#f59e0b"/>
      <text x="85" y="359" fill="#0f172a" font-size="12" font-family="sans-serif" font-weight="900" text-anchor="middle">PDF EDITION</text>
    </g>
  </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
