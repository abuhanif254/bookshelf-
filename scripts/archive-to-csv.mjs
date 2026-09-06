import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
function getArg(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const START_PAGE = parseInt(getArg('--start', '1'), 10);
const PAGES      = parseInt(getArg('--pages', '10'), 10);
const OUT_FILE   = getArg('--out', 'archive-books.csv');
const LANG       = getArg('--lang', 'ben');
const CAT        = getArg('--cat', 'Bengali Literature');
const STATE_FILE = OUT_FILE + '.state';

const ROWS_PER_PAGE = 50; 
const DELAY_MS      = 100;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalizeLang(lang) {
  if (!lang) return 'en';
  const l = lang.toLowerCase().trim();
  if (l === 'ben' || l === 'bangla' || l === 'bn') return 'bn';
  if (l === 'hin' || l === 'hindi' || l === 'hi') return 'hi';
  if (l === 'urd' || l === 'urdu' || l === 'ur') return 'ur';
  if (l === 'spa' || l === 'spanish' || l === 'es') return 'es';
  if (l === 'chi' || l === 'zho' || l === 'chinese' || l === 'zh') return 'zh';
  if (l === 'eng' || l === 'english' || l === 'en') return 'en';
  return l;
}

function toSlug(str, identifier = '') {
  let s = str.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  const idHash = identifier ? identifier.slice(-6).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  if (!s) {
    s = `book-${idHash || Math.random().toString(36).slice(2, 8)}`;
  } else if (idHash) {
    s = `${s.substring(0, 60)}-${idHash}`;
  }
  return s;
}

function cleanText(str) {
  if (!str) return '';
  let s = Array.isArray(str) ? str.join(' ') : str;
  return s.replace(/<[^>]+>/g, '').replace(/["\n\r,]/g, ' ').replace(/\s+/g, ' ').trim();
}

const CSV_HEADERS = [
  'title','sub','author','cat','type','price','pages',
  'blurb','desc','drive_url','cover_image','badge','bg','fg','ac','pat','lang',
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

async function robustFetch(url) {
  for (let retries = 1; retries <= 4; retries++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      await sleep(2000 * retries);
    }
  }
  return null;
}

async function main() {
  let currentPage = START_PAGE;
  const seenSlugs = new Set();

  if (fs.existsSync(STATE_FILE)) {
    const savedPage = parseInt(fs.readFileSync(STATE_FILE, 'utf8').trim(), 10);
    if (!isNaN(savedPage) && savedPage >= START_PAGE) {
      currentPage = savedPage + 1;
      console.log(`\n🤖 [Bot Intelligence] Found previous session. Resuming automatically from page ${currentPage}...`);
    }
  }

  let targetEndPage = currentPage + PAGES;

  if (!fs.existsSync(OUT_FILE) || currentPage === 1) {
    fs.writeFileSync(OUT_FILE, CSV_HEADERS.join(',') + '\n', 'utf8');
  }

  console.log(`Fetching ${PAGES} pages (from page ${currentPage} up to ${targetEndPage - 1}) of ${LANG} books...`);

  for (let page = currentPage; page < targetEndPage; page++) {
    const query = encodeURIComponent(`mediatype:texts AND language:${LANG}`);
    const fields = encodeURIComponent('identifier,title,creator,description');
    const pageUrl = `https://archive.org/advancedsearch.php?q=${query}&fl[]=${fields}&output=json&rows=${ROWS_PER_PAGE}&page=${page}`;

    process.stdout.write(`  Page ${page}/${targetEndPage - 1}... Scanning IA database...\n`);

    const data = await robustFetch(pageUrl);
    if (!data) {
      process.stdout.write(`\n  ⚠️ Internet lost. Bot is pausing for 10 seconds...\n`);
      await sleep(10000);
      page--; 
      continue;
    }

    const books = data.response?.docs || [];
    if (books.length === 0) {
      console.log('Reached last page of Internet Archive results.');
      break;
    }

    const rows = [];
    
    // Process concurrently but in small chunks to avoid timeout
    const chunkSize = 10;
    for (let i = 0; i < books.length; i += chunkSize) {
      const chunk = books.slice(i, i + chunkSize);
      
      const chunkResults = await Promise.all(chunk.map(async (book) => {
         if (!book.title || !book.identifier) return null;
         
         const authorName = cleanText(book.creator) || 'Unknown Author';
         const titleClean = cleanText(book.title).substring(0, 120);
         const slug = toSlug(titleClean, book.identifier).substring(0, 80);
         
         if (seenSlugs.has(slug)) return null;
         seenSlugs.add(slug);

         const meta = await robustFetch(`https://archive.org/metadata/${book.identifier}`);
         
         let bestFile = null;
         let pages = Math.floor(Math.random() * 250) + 80;

         if (meta && meta.files) {
           bestFile = meta.files.find(f => f.format.includes('PDF'));
           if (!bestFile) bestFile = meta.files.find(f => f.format.includes('EPUB'));
           if (!bestFile) bestFile = meta.files.find(f => f.format.includes('Text'));
           
           if (meta.metadata && meta.metadata.imagecount) {
             pages = parseInt(meta.metadata.imagecount[0], 10);
           }
         }

         let driveUrl = '';
         if (bestFile) {
           driveUrl = `https://archive.org/download/${book.identifier}/${bestFile.name}`;
         } else {
           // Safely fallback to details page if no direct download is available
           driveUrl = `https://archive.org/details/${book.identifier}`;
         }

         const descText = cleanText(book.description) || `A classic ${LANG} work by ${authorName}. Available for free download from the Internet Archive.`;
         
         process.stdout.write(`.`); // Visual progress pip

         return {
           title:       titleClean,
           sub:         `A free public domain ${CAT} book`,
           author:      authorName.substring(0, 80),
           cat:         CAT,
           type:        'free',
           price:       0,
           pages,
           blurb:       descText.substring(0, 160) + (descText.length > 160 ? '...' : ''),
           desc:        `<p>${descText}</p>`,
           drive_url:   driveUrl,
           cover_image: '', 
           badge:       'Free',
           bg:          '#1e3a5f',
           fg:          '#f5f1e8',
           ac:          '#f59e0b',
           pat:         'p-waves',
           lang:        normalizeLang(LANG),
         };
      }));

      for (const res of chunkResults) {
        if (res) rows.push(res);
      }
      await sleep(100);
    }

    console.log(` ✅ ${rows.length} books extracted!`);

    if (rows.length > 0) {
      const csvChunk = rows.map(rowToCSV).join('\n') + '\n';
      fs.appendFileSync(OUT_FILE, csvChunk, 'utf8');
    }
    fs.writeFileSync(STATE_FILE, page.toString(), 'utf8');
  }

  console.log('\n✅ Done with this batch!');
  console.log('   File ready for upload:  ' + path.resolve(OUT_FILE));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});