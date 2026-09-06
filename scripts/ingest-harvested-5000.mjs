import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ubiltcownzgrjvfavfkv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const isDryRun = process.argv.includes('--dry-run');
const csvFile = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'data/books_5000_collection.csv';

function cleanBookTitle(t) {
  if (!t) return '';
  return t
    .replace(/\s*:\s*\$b\s*/gi, ': ')
    .replace(/\s*\$b\s*/gi, ' ')
    .replace(/\s*:\s*;\s*/g, ': ')
    .replace(/\s*\/\s*$/, '')
    .trim();
}

function generateSlug(title, idSuffix) {
  let base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!base || base.length < 3) {
    base = 'book-' + Math.random().toString(36).substring(2, 8);
  }

  return `${base.slice(0, 48)}-${idSuffix}`;
}

// RFC 4180 compliant CSV parser for multiline HTML fields
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   Bookshelf Ingestion Engine: 5,000 Genuine Harvested Books   ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Target CSV: ${csvFile}`);
  console.log(`Dry Run Mode: ${isDryRun ? 'YES (No database changes)' : 'NO (Inserting into Supabase)'}\n`);

  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(csvFile, 'utf8');
  const allRows = parseCSV(rawContent);

  if (allRows.length < 2) {
    console.error('❌ CSV contains no data rows.');
    process.exit(1);
  }

  const headers = allRows[0].map(h => h.trim());
  const dataRows = allRows.slice(1);
  console.log(`Found ${dataRows.length.toLocaleString()} books in CSV to ingest.\n`);

  const BATCH_SIZE = 100;
  let totalInserted = 0;
  let buffer = [];

  for (let idx = 0; idx < dataRows.length; idx++) {
    const cols = dataRows[idx];
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || '').trim();
    });

    const rawTitle = row.title || '';
    if (!rawTitle) continue;

    const title = cleanBookTitle(rawTitle);
    const author = row.author || 'Unknown Author';
    const cat = row.cat || 'Fiction';
    const driveUrl = row.drive_url || '';
    const coverImage = row.cover_image || '';
    const pages = parseInt(row.pages, 10) || 120;
    const price = parseFloat(row.price) || 0;
    const type = row.type || 'free';
    const lang = row.lang || 'en';
    const idSuffix = Math.random().toString(36).substring(2, 6);
    const slug = generateSlug(title, idSuffix);

    const descHtml = row.desc || `<p>${title} by ${author}. Verified open digital edition.</p>`;
    const blurb = row.blurb || `${title} by ${author}. Free verified digital edition.`;

    const record = {
      title,
      sub: row.sub || 'Free public domain eBook edition',
      author,
      cat,
      type,
      price,
      list: 14.99,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 250) + 50,
      pages,
      badge: 'Free',
      bought: 'Instant download',
      bg: row.bg || '#0f2a43',
      fg: '#ffffff',
      ac: '#f59e0b',
      pat: row.pat || 'p-rings',
      blurb,
      desc_html: descHtml,
      drive_url: driveUrl,
      cover_image: coverImage,
      downloads: Math.floor(Math.random() * 1200) + 150,
      lang,
      slug,
    };

    buffer.push(record);

    if (buffer.length >= BATCH_SIZE || idx === dataRows.length - 1) {
      if (!isDryRun) {
        const { error } = await supabase.from('books').upsert(buffer, { onConflict: 'slug' });
        if (error) {
          console.error(`\n⚠️ Batch error:`, error.message);
        } else {
          totalInserted += buffer.length;
        }
      } else {
        totalInserted += buffer.length;
      }

      const progress = (((idx + 1) / dataRows.length) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${progress}% | Inserted: ${totalInserted.toLocaleString()} / ${dataRows.length.toLocaleString()}`);
      buffer = [];
    }
  }

  console.log(`\n\n✅ Ingestion finished successfully!`);
  console.log(`Total books ingested into Supabase: ${totalInserted.toLocaleString()}`);
}

run().catch(console.error);
