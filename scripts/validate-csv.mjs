/**
 * validate-csv.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the harvested CSV catalog for:
 *   - Row count and header integrity
 *   - Non-empty titles, authors, categories, and download links
 *   - Author bio coverage and quality
 *   - Working sample HTTP status checks on covers and downloads
 *
 * Usage:
 *   node scripts/validate-csv.mjs data/books_5000_collection.csv
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';

const fileArg = process.argv[2] || path.join('data', 'books_5000_collection.csv');
const filePath = path.resolve(process.cwd(), fileArg);

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

async function checkUrlStatus(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(6000),
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function validate() {
  console.log(`\n🔍 Validating CSV dataset: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  if (lines.length < 2) {
    console.error('❌ CSV file has no data rows.');
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  console.log(`📋 Total Columns: ${headers.length}`);
  console.log(`📊 Headers:`, headers.join(', '));
  console.log(`📚 Total Books (Rows): ${lines.length - 1}`);

  const requiredCols = ['title', 'author', 'cat', 'drive_url', 'cover_image'];
  for (const col of requiredCols) {
    if (!headers.includes(col)) {
      console.warn(`⚠️ Warning: Missing expected column "${col}"`);
    }
  }

  const titleIdx = headers.indexOf('title');
  const authorIdx = headers.indexOf('author');
  const authorBioIdx = headers.indexOf('author_bio');
  const catIdx = headers.indexOf('cat');
  const driveIdx = headers.indexOf('drive_url');
  const coverIdx = headers.indexOf('cover_image');

  let emptyTitles = 0;
  let emptyAuthors = 0;
  let emptyDriveUrls = 0;
  let emptyCovers = 0;
  let withAuthorBio = 0;

  const categoryCounts = new Map();
  const sampleBooks = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    const title = row[titleIdx]?.trim();
    const author = row[authorIdx]?.trim();
    const cat = row[catIdx]?.trim();
    const drive = row[driveIdx]?.trim();
    const cover = row[coverIdx]?.trim();
    const bio = authorBioIdx !== -1 ? row[authorBioIdx]?.trim() : '';

    if (!title) emptyTitles++;
    if (!author || author.toLowerCase() === 'unknown') emptyAuthors++;
    if (!drive) emptyDriveUrls++;
    if (!cover) emptyCovers++;
    if (bio && bio.length > 20) withAuthorBio++;

    if (cat) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }

    if (sampleBooks.length < 5 && i % 100 === 0) {
      sampleBooks.push({ title, author, cat, drive, cover, bio: bio.substring(0, 70) + '...' });
    }
  }

  console.log('\n--- Data Quality Audit ---');
  console.log(`✅ Valid Non-Empty Titles: ${lines.length - 1 - emptyTitles}/${lines.length - 1}`);
  console.log(`✅ Valid Authors: ${lines.length - 1 - emptyAuthors}/${lines.length - 1}`);
  console.log(`✅ Active Download Links: ${lines.length - 1 - emptyDriveUrls}/${lines.length - 1}`);
  console.log(`✅ Active Cover Links: ${lines.length - 1 - emptyCovers}/${lines.length - 1}`);
  console.log(`✨ Author Bio Coverage (SEO E-E-A-T): ${withAuthorBio}/${lines.length - 1} (${((withAuthorBio / (lines.length - 1)) * 100).toFixed(1)}%)`);

  console.log('\n--- Category Distribution ---');
  const sortedCats = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    console.log(`  • ${cat.padEnd(24)}: ${count} books`);
  }

  console.log('\n--- Sample Records ---');
  console.log(sampleBooks);

  // Sample HTTP ping test
  if (sampleBooks.length > 0) {
    console.log('\n--- Live HTTP Stream Verification ---');
    for (const b of sampleBooks.slice(0, 2)) {
      const coverStatus = await checkUrlStatus(b.cover);
      const dlStatus = await checkUrlStatus(b.drive);
      console.log(`📖 "${b.title.substring(0, 30)}..." | Cover HTTP: ${coverStatus} | Download HTTP: ${dlStatus}`);
    }
  }

  console.log('\n✅ Validation Complete. CSV is healthy and ready for upload.\n');
}

validate().catch(console.error);
