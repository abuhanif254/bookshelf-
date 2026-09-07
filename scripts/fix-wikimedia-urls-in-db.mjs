import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Repairing Local Wikisource URLs in Supabase Database        ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let updatedCount = 0;
  let offset = 0;
  const PAGE_SIZE = 500;

  while (true) {
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .or('drive_url.ilike.%commons.wikimedia.org/wiki/Special:FilePath%,cover_image.ilike.%commons.wikimedia.org/wiki/Special:FilePath%')
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('Fetch error:', error.message);
      break;
    }

    if (!books || books.length === 0) break;

    const updates = [];

    for (const b of books) {
      const isBengali = b.lang === 'bn' || /[\u0980-\u09FF]/.test(b.title || '') || /[\u0980-\u09FF]/.test(b.drive_url || '');
      const isHindi = b.lang === 'hi' || /[\u0900-\u097F]/.test(b.title || '') || /[\u0900-\u097F]/.test(b.drive_url || '');

      let newDrive = b.drive_url;
      let newCover = b.cover_image;
      let newDesc = b.desc_html;
      let changed = false;

      if (isBengali) {
        if (newDrive && newDrive.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newDrive = newDrive.replace('commons.wikimedia.org/wiki/Special:FilePath/', 'bn.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
        if (newCover && newCover.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newCover = newCover.replace('commons.wikimedia.org/wiki/Special:FilePath/', 'bn.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
        if (newDesc && newDesc.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newDesc = newDesc.replace(/commons\.wikimedia\.org\/wiki\/Special:FilePath\//g, 'bn.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
      } else if (isHindi) {
        if (newDrive && newDrive.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newDrive = newDrive.replace('commons.wikimedia.org/wiki/Special:FilePath/', 'hi.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
        if (newCover && newCover.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newCover = newCover.replace('commons.wikimedia.org/wiki/Special:FilePath/', 'hi.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
        if (newDesc && newDesc.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
          newDesc = newDesc.replace(/commons\.wikimedia\.org\/wiki\/Special:FilePath\//g, 'hi.wikisource.org/wiki/Special:FilePath/');
          changed = true;
        }
      }

      if (changed) {
        b.drive_url = newDrive;
        b.cover_image = newCover;
        b.desc_html = newDesc;
        updates.push(b);
      }
    }

    if (updates.length > 0) {
      // Upsert batch
      const { error: upErr } = await supabase.from('books').upsert(updates, { onConflict: 'id' });
      if (upErr) {
        console.error('Update batch error:', upErr.message);
      } else {
        updatedCount += updates.length;
        console.log(`Updated ${updatedCount} books so far...`);
      }
    }

    if (books.length < PAGE_SIZE) break;
    // Don't advance offset if rows no longer match the .or filter!
    // Since updated rows no longer match 'commons.wikimedia.org/wiki/Special:FilePath',
    // offset 0 will fetch the next remaining un-updated rows!
    if (updates.length === 0) {
      offset += PAGE_SIZE;
    }
  }

  console.log(`\n✅ Finished! Successfully repaired ${updatedCount} book URLs in Supabase.`);
}

main().catch(console.error);
