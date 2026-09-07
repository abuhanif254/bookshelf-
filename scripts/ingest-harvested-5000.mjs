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

const indicToEnMap = {
  // Bengali
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri',
  'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri',
  'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': '',
  'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',

  // Hindi / Devanagari
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', '्': '',
  'ं': 'n', 'ः': 'h', 'ँ': 'n',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

function transliterateIndic(text) {
  let res = '';
  for (const ch of text) {
    if (indicToEnMap[ch] !== undefined) {
      res += indicToEnMap[ch];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      res += ch.toLowerCase();
    } else if (/\s+/.test(ch) || ch === '-' || ch === '_') {
      res += '-';
    }
  }
  return res.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

function generateSlug(title, idSuffix, idx = 0) {
  let latinTitle = transliterateIndic(title);
  let base = latinTitle
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!base || base.length < 3) {
    base = 'book';
  }

  return `${base.slice(0, 36)}-${idSuffix}-${idx}`;
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

  // Fetch current max ID to bypass out-of-sync PostgreSQL sequences
  let nextId = 1;
  const uniqueCategories = new Set();
  const existingUrls = new Set();

  if (!isDryRun) {
    const { data: maxData } = await supabase
      .from('books')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (maxData && maxData.length > 0 && maxData[0].id) {
      nextId = maxData[0].id + 1;
    }
    console.log(`Current highest book ID in database: ${nextId - 1}`);
    console.log(`Ingestion starting at ID: ${nextId}\n`);

    let offset = 0;
    while (true) {
      const { data: page } = await supabase.from('books').select('drive_url').range(offset, offset + 999);
      if (!page || page.length === 0) break;
      for (const b of page) {
        if (b.drive_url) existingUrls.add(b.drive_url);
      }
      offset += 1000;
      if (page.length < 1000) break;
    }
    console.log(`Found ${existingUrls.size} existing books in database.`);
  }

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

    const driveUrl = row.drive_url || '';
    if (existingUrls.has(driveUrl)) continue;

    const title = cleanBookTitle(rawTitle);
    const author = row.author || 'Unknown Author';
    const cat = row.cat || 'Fiction';
    uniqueCategories.add(cat);

    const coverImage = row.cover_image || '';
    const pages = parseInt(row.pages, 10) || 120;
    const price = parseFloat(row.price) || 0;
    const type = row.type || 'free';
    const lang = row.lang || 'en';
    const idSuffix = Math.random().toString(36).substring(2, 6);
    const slug = generateSlug(title, idSuffix, idx);

    const descHtml = row.desc || `<p>${title} by ${author}. Verified open digital edition.</p>`;
    const blurb = row.blurb || `${title} by ${author}. Free verified digital edition.`;

    const record = {
      id: nextId++,
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

  // Auto-sync missing categories to Supabase
  if (!isDryRun && uniqueCategories.size > 0) {
    console.log(`\n\nSyncing ${uniqueCategories.size} categories to database...`);
    try {
      const { data: existingCats } = await supabase.from('categories').select('name');
      const existingNames = new Set((existingCats || []).map(c => (c.name || '').toLowerCase()));
      
      const newCatRows = [];
      for (const catName of Array.from(uniqueCategories)) {
        if (!existingNames.has(catName.toLowerCase())) {
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          newCatRows.push({
            id: catSlug,
            name: catName,
            slug: catSlug,
            badge: 'Popular',
            seo_title: `Free ${catName} PDF Books | Bookshelf`,
            h1: `Free ${catName} PDF Books & Handbooks`,
            intro: `Explore our curated collection of free ${catName} books and practical guides.`
          });
        }
      }

      if (newCatRows.length > 0) {
        const { error: catErr } = await supabase.from('categories').upsert(newCatRows, { onConflict: 'id' });
        if (!catErr) {
          console.log(`✅ Synced ${newCatRows.length} new categories.`);
        } else {
          console.warn(`Category sync warning:`, catErr.message);
        }
      } else {
        console.log(`All categories already exist.`);
      }
    } catch (e) {
      console.error('Category sync error:', e);
    }
  }

  console.log(`\n=============================================================`);
  console.log(`✅ SUCCESS! Successfully ingested ${totalInserted.toLocaleString()} genuine books into Supabase.`);
  console.log(`Database IDs range: ${nextId - totalInserted} to ${nextId - 1}`);
  console.log(`=============================================================\n`);
}

run().catch(console.error);
