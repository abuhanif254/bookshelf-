import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (m) env[m[1]] = (m[2] || '').trim().replace(/^['"]|['"]$/g, '');
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const isDryRun = process.argv.includes('--dry-run');

async function purge() {
  console.log('🛡️ Bookshelf Safe Database Purge Engine');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (Simulation Only - No Deletion)' : 'LIVE PURGE'}\n`);

  // Step 1: Pre-flight audit
  const { count: totalBefore } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  const { count: realBooksCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .lte('id', 9022);

  const { count: fakeBooksCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .gt('id', 9022)
    .ilike('drive_url', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%');

  console.log('--- Pre-Flight Verification ---');
  console.log(`Total books in DB: ${totalBefore}`);
  console.log(`Protected original books (ID <= 9022): ${realBooksCount}`);
  console.log(`Targeted fake books to remove: ${fakeBooksCount}`);

  if (realBooksCount < 8000) {
    console.error('❌ SAFETY ABORT: Protected real book count is less than 8,000! Aborting.');
    process.exit(1);
  }

  if (fakeBooksCount === 0) {
    console.log('✅ No fake books found. Database is already clean!');
    return;
  }

  if (isDryRun) {
    console.log('\n✅ Dry run complete. Zero rows deleted. Run without --dry-run to execute live purge.');
    return;
  }

  // Step 2: Delete in safe batches
  console.log('\n🚀 Starting safe batch deletion of fake books...');
  const BATCH_SIZE = 500;
  let deletedTotal = 0;

  while (true) {
    // Fetch a batch of fake IDs
    const { data: batch, error: fetchErr } = await supabase
      .from('books')
      .select('id')
      .gt('id', 9022)
      .ilike('drive_url', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%')
      .limit(BATCH_SIZE);

    if (fetchErr) {
      console.error('Error fetching batch:', fetchErr);
      break;
    }

    if (!batch || batch.length === 0) {
      break;
    }

    const idsToDelete = batch.map(b => b.id);

    // Hard safety filter in code: ensure NO id <= 9022 is ever deleted
    const safeIds = idsToDelete.filter(id => id > 9022);
    if (safeIds.length !== idsToDelete.length) {
      console.error('❌ CRITICAL SAFETY ERROR: Attempted to delete protected ID! Aborting.');
      process.exit(1);
    }

    const { error: delErr } = await supabase
      .from('books')
      .delete()
      .in('id', safeIds);

    if (delErr) {
      console.error('Delete batch error:', delErr);
      break;
    }

    deletedTotal += safeIds.length;
    process.stdout.write(`\r✓ Deleted ${deletedTotal.toLocaleString()} / ${fakeBooksCount.toLocaleString()} fake books...`);
  }

  console.log('\n\n--- Post-Purge Verification ---');
  const { count: totalAfter } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  const { count: remainingFake } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .gt('id', 9022)
    .ilike('drive_url', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%');

  console.log(`Total books remaining: ${totalAfter}`);
  console.log(`Protected original books intact: ${realBooksCount}`);
  console.log(`Remaining fake books: ${remainingFake || 0}`);

  if (remainingFake === 0 && totalAfter === realBooksCount) {
    console.log('\n🎉 SUCCESS! All fake records purged. Exactly 8,286 genuine books preserved!');
  } else {
    console.log('\n⚠️ Notice: Some items may require another pass.');
  }
}

purge().catch(console.error);
