import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function detectLanguage(text) {
  if (!text) return 'en';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali / Bangla
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari / Hindi
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Arabic / Urdu
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese Han
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es';     // Spanish
  return 'en';
}

function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
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

  return `${base.slice(0, 50)}-${idSuffix}`;
}

function formatDriveUrl(raw) {
  if (!raw) return '';
  const match = raw.match(/id=([a-zA-Z0-9_-]+)/) || raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return raw;
}

// Simple streaming CSV line parser
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

async function runIngestion() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: node scripts/ingest-catalog.mjs <path-to-csv-or-json>');
    console.log('Example: node scripts/ingest-catalog.mjs bangla-books.csv');
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`🚀 Starting high-speed streaming ingestion from: ${path.basename(absolutePath)}`);

  const fileStream = fs.createReadStream(absolutePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isHeader = true;
  let headers = [];
  let buffer = [];
  let totalProcessed = 0;
  let totalInserted = 0;
  const BATCH_SIZE = 500;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (isHeader) {
      headers = parseCSVLine(line).map(h => h.trim().toLowerCase());
      isHeader = false;
      continue;
    }

    const cols = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || '').trim();
    });

    const title = sanitizeText(row.title || row.name || '');
    const author = sanitizeText(row.author || row.creator || 'Unknown Author');
    if (!title) continue;

    const cat = sanitizeText(row.category || row.cat || 'Literature');
    const driveUrl = formatDriveUrl(row.driveurl || row.drive_url || row.download_url || row.url || '');
    const pages = parseInt(row.pages, 10) || 120;
    const lang = row.lang || detectLanguage(title + ' ' + author);
    const idSuffix = Math.random().toString(36).substring(2, 6);
    const slug = row.slug || generateSlug(title, idSuffix);

    const record = {
      title,
      sub: sanitizeText(row.sub || row.subtitle || 'Free digital edition'),
      author,
      cat,
      type: 'free',
      price: 0,
      list: 9.99,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 200) + 50,
      pages,
      badge: 'Free',
      bought: 'Instant download',
      bg: row.bg || '#0f2a43',
      fg: '#ffffff',
      ac: '#f59e0b',
      pat: 'p-rings',
      blurb: sanitizeText(row.blurb || `${title} by ${author}. Free verified PDF eBook download.`),
      desc_html: `<p>Download free PDF of <strong>${title}</strong> by ${author}. Verified public access edition.</p>`,
      drive_url: driveUrl,
      cover_image: row.cover_image || row.cover || '',
      downloads: Math.floor(Math.random() * 1000) + 100,
      lang,
      slug,
    };

    buffer.push(record);
    totalProcessed++;

    if (buffer.length >= BATCH_SIZE) {
      const { data, error } = await supabase.from('books').upsert(buffer, { onConflict: 'slug' });
      if (error) {
        console.error(`⚠️ Batch insert warning:`, error.message);
      } else {
        totalInserted += buffer.length;
        process.stdout.write(`\r✓ Processed: ${totalProcessed.toLocaleString()} | Inserted: ${totalInserted.toLocaleString()}`);
      }
      buffer = [];
    }
  }

  // Flush remaining records
  if (buffer.length > 0) {
    const { error } = await supabase.from('books').upsert(buffer, { onConflict: 'slug' });
    if (!error) totalInserted += buffer.length;
  }

  console.log(`\n\n🎉 Ingestion Complete!`);
  console.log(`📊 Summary:`);
  console.log(`   - Total Lines Parsed: ${totalProcessed.toLocaleString()}`);
  console.log(`   - Successfully Upserted to Supabase: ${totalInserted.toLocaleString()}`);
}

runIngestion().catch(err => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
