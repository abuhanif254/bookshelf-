import { NextResponse } from 'next/server';
import { getAllBooks } from '@/lib/db';
import { escapeHtml } from '@/lib/security';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pdf-bookshelf.com';
  const books = getAllBooks();

  const itemsXml = books
    .map(book => {
      const link = `${baseUrl}/pdf/${book.slug}`;
      const pubDate = new Date().toUTCString();
      const description = escapeHtml(book.blurb || book.sub || book.title);
      const title = escapeHtml(`${book.title} by ${book.author} (Free PDF)`);
      const category = escapeHtml(book.cat);

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bookshelf — Free PDF Books Library</title>
    <link>${baseUrl}</link>
    <description>Download verified free PDF books, toolkits, and cheat sheets on productivity, coding, business, and design.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
