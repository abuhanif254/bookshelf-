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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log('🔍 Analyzing Supabase Books Table...\n');

  // Total books
  const { count: totalCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  // Count with seed drive sample ID
  const { count: seedDriveCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .ilike('drive_url', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%');

  // Check ID range for non-seeded books
  const { count: nonSeededCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .not('drive_url', 'ilike', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%');

  // Books with "(Vol. " in title
  const { count: volCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .ilike('title', '%(Vol. %');

  // Original books min/max ID
  const { data: lowestOriginal } = await supabase
    .from('books')
    .select('id, title, drive_url')
    .not('drive_url', 'ilike', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%')
    .order('id', { ascending: true })
    .limit(1);

  const { data: highestOriginal } = await supabase
    .from('books')
    .select('id, title, drive_url')
    .not('drive_url', 'ilike', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%')
    .order('id', { ascending: false })
    .limit(1);

  const { count: overlap } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .lte('id', 9022)
    .ilike('drive_url', '%1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms%');

  console.log('SUMMARY STATS:');
  console.log('1. Total books in Supabase:', totalCount);
  console.log('2. Seeded fake books (with placeholder drive ID):', seedDriveCount);
  console.log('3. Real / Original books (without placeholder drive ID):', nonSeededCount);
  console.log('4. Lowest Real Book ID:', lowestOriginal?.[0]?.id, 'Title:', lowestOriginal?.[0]?.title);
  console.log('5. Highest Real Book ID:', highestOriginal?.[0]?.id, 'Title:', highestOriginal?.[0]?.title);
  console.log('6. Sample Real Drive URL:', lowestOriginal?.[0]?.drive_url);
  console.log('7. Overlap (should be exactly 0):', overlap);
}

main().catch(console.error);
