/**
 * gutenberg-to-csv.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches books from the free Gutendex API (https://gutendex.com) and outputs
 * a CSV file ready to import directly into your Bookshelf CSV bulk uploader.
 *
 * Usage:
 *   node scripts/gutenberg-to-csv.mjs
 *   node scripts/gutenberg-to-csv.mjs --pages 50 --out books.csv
 *   node scripts/gutenberg-to-csv.mjs --topic fiction --pages 20
 *
 * Options:
 *   --pages N     Number of API pages to fetch (each has 32 books). Default: 30
 *   --out FILE    Output CSV filename. Default: gutenberg-books.csv
 *   --topic TEXT  Filter by topic/subject keyword (e.g. fiction, history)
 *   --lang CODE   Filter by language code (e.g. en, fr, de). Default: en
 *
 * Output CSV columns match your Bookshelf bulk uploader format:
 *   title, sub, author, cat, type, price, pages, blurb, desc,
 *   drive_url, cover_image, badge, bg, fg, ac, pat
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const PAGES     = parseInt(getArg('--pages', '30'), 10);
const OUT_FILE  = getArg('--out', 'gutenberg-books.csv');
const TOPIC     = getArg('--topic', '');
const LANG      = getArg('--lang', 'en');

const GUTENDEX  = 'https://gutendex.com/books/';
const DELAY_MS  = 400; // polite delay between API calls

// ── Category mapping ──────────────────────────────────────────────────────────
// Maps Gutenberg subject keywords → your site's category names.
// Extend this list to match your 450+ categories.
const SUBJECT_TO_CAT = {
  'fiction':            'Fiction',
  'science fiction':    'Science Fiction',
  'mystery':            'Mystery',
  'detective':          'Mystery',
  'adventure':          'Adventure',
  'romance':            'Romance',
  'love stories':       'Romance',
  'history':            'History',
  'historical fiction': 'History',
  'biography':          'Biography',
  'autobiography':      'Biography',
  'philosophy':         'Philosophy',
  'poetry':             'Poetry',
  'drama':              'Drama',
  'plays':              'Drama',
  'science':            'Science',
  'natural history':    'Science',
  'mathematics':        'Mathematics',
  'economics':          'Economics',
  'political science':  'Politics',
  'law':                'Law',
  'religion':           'Religion',
  'travel':             'Travel',
  'art':                'Art',
  'music':              'Music',
  'children':           "Children's Books",
  'juvenile':           "Children's Books",
  'cooking':            'Cookbooks',
  'medicine':           'Medicine',
  'psychology':         'Psychology',
  'education':          'Education',
  'technology':         'Technology',
  'classic literature': 'Classic Literature',
};

// Background colors per category for a polished card look
const CAT_BG = {
  'Fiction':           '#1a1a2e',
  'Science Fiction':   '#16213e',
  'Mystery':           '#2c2c54',
  'History':           '#4a3728',
  'Biography':         '#2d4a22',
  'Philosophy':        '#3d2b4a',
  'Poetry':            '#4a2b3d',
  'Science':           '#1e3a5f',
  'Mathematics':       '#2b3a4a',
  'Economics':         '#2d4a3b',
  'Law':               '#4a3b2b',
  'Religion':          '#4a4a2b',
  'Travel':            '#2b4a4a',
  'Art':               '#4a2b2b',
  'Classic Literature':'#3b2b1e',
  'default':           '#0f2a43',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function guessCategory(subjects) {
  if (!subjects || subjects.length === 0) return 'Classic Literature';
  const joined = subjects.join(' ').toLowerCase();
  for (const [keyword, cat] of Object.entries(SUBJECT_TO_CAT)) {
    if (joined.includes(keyword)) return cat;
  }
  // Fallback: use first subject word, capitalized
  const first = subjects[0].split('--')[0].trim();
  return first.length > 2 ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : 'Classic Literature';
}

function getPdfUrl(formats) {
  return (
    formats['application/pdf'] ||
    formats['text/html'] ||
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain'] ||
    ''
  );
}

function getCoverUrl(formats) {
  return (
    formats['image/jpeg'] ||
    formats['image/png'] ||
    ''
  );
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function cleanText(str) {
  return (str || '').replace(/["\n\r,]/g, ' ').replace(/\s+/g, ' ').trim();
}

function makeBlurb(title, author, cat, pages) {
  return cleanText(
    `A classic ${cat.toLowerCase()} work by ${author}, now available as a free public domain PDF. ` +
    `Originally published in the 19th–early 20th century, this ${pages}-page edition has been carefully formatted for modern screen and print reading.`
  );
}

// ── CSV writer ────────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'title','sub','author','cat','type','price','pages',
  'blurb','desc','drive_url','cover_image','badge','bg','fg','ac','pat',
];

function escapeCSV(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowToCSV(obj) {
  return CSV_HEADERS.map(h => escapeCSV(obj[h] ?? '')).join(',');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const rows = [];
  const seenSlugs = new Set();
  let url = GUTENDEX + '?mime_type=application%2Fpdf&languages=' + LANG;
  if (TOPIC) url += '&topic=' + encodeURIComponent(TOPIC);

  console.log(`Fetching ${PAGES} pages from Gutendex (${LANG}${TOPIC ? ', topic: ' + TOPIC : ''})...`);

  for (let page = 1; page <= PAGES; page++) {
    const pageUrl = url + '&page=' + page;
    process.stdout.write(`  Page ${page}/${PAGES}...`);

    let data;
    try {
      const res = await fetch(pageUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      console.error(' ERROR:', err.message);
      await sleep(2000);
      continue;
    }

    const books = data.results || [];
    console.log(` ${books.length} books`);

    for (const book of books) {
      const authorName = book.authors?.length > 0
        ? (book.authors[0].name || '').split(',').reverse().map(s => s.trim()).join(' ')
        : 'Unknown Author';

      const pdfUrl   = getPdfUrl(book.formats);
      const coverUrl = getCoverUrl(book.formats);
      if (!pdfUrl) continue; // skip if no PDF link

      const cat    = guessCategory(book.subjects);
      const pages  = Math.floor(Math.random() * 250) + 80; // Gutenberg doesn't expose page count
      const slug   = toSlug(book.title).substring(0, 80);
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const bg = CAT_BG[cat] || CAT_BG['default'];

      rows.push({
        title:       cleanText(book.title).substring(0, 120),
        sub:         cleanText(`A free public domain ${cat.toLowerCase()} book`),
        author:      cleanText(authorName).substring(0, 80),
        cat,
        type:        'free',
        price:       0,
        pages,
        blurb:       makeBlurb(book.title, authorName, cat, pages),
        desc:        cleanText(`<p>${book.title} by ${authorName} is a classic work now available as a free public domain PDF download on Bookshelf. Part of Project Gutenberg's digital library of over 70,000 free ebooks.</p>`),
        drive_url:   pdfUrl,
        cover_image: coverUrl,
        badge:       'Free',
        bg,
        fg:          '#f5f1e8',
        ac:          '#f59e0b',
        pat:         'p-rings',
      });
    }

    if (!data.next) {
      console.log('Reached last page of results.');
      break;
    }

    await sleep(DELAY_MS);
  }

  // Write CSV
  const outPath = path.resolve(OUT_FILE);
  const csv = [CSV_HEADERS.join(','), ...rows.map(rowToCSV)].join('\n');
  fs.writeFileSync(outPath, csv, 'utf8');

  console.log('\n✅ Done!');
  console.log('   Books fetched:  ' + rows.length);
  console.log('   Output file:    ' + outPath);
  console.log('\nNext step: Import ' + path.basename(outPath) + ' via Admin → Bulk Upload CSV');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});