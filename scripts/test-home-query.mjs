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

async function test() {
  const { data } = await supabase.from('books').select('cat').limit(2000);
  const counts = {};
  for (const r of data || []) {
    counts[r.cat] = (counts[r.cat] || 0) + 1;
  }
  console.log('Top categories in your real books:');
  console.table(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10));
}

test();
