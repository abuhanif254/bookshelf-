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

async function inspect() {
  const { data: topId, error: err1 } = await supabase
    .from('books')
    .select('id, slug, title')
    .order('id', { ascending: false })
    .limit(5);

  console.log('Top 5 books by ID:', topId);

  const { count, error: err2 } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true });

  console.log('Total books in DB:', count);

  // Test inserting 1 row with explicit high ID or without ID
  const maxId = topId && topId[0] ? topId[0].id : 0;
  console.log('Max existing ID:', maxId);

  const { count: catCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  console.log('Total categories in DB:', catCount);

  const { count: bnCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('lang', 'bn');
  console.log('Total Bangla (bn) books in DB:', bnCount);

  const { count: hiCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('lang', 'hi');
  console.log('Total Hindi (hi) books in DB:', hiCount);

  const { count: enCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('lang', 'en');
  console.log('Total English (en) books in DB:', enCount);

  const { count: commonsFilePathCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .ilike('drive_url', '%commons.wikimedia.org/wiki/Special:FilePath%');
  console.log('Books with commons Special:FilePath in drive_url:', commonsFilePathCount);

  const { count: commonsCoverCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .ilike('cover_image', '%commons.wikimedia.org/wiki/Special:FilePath%');
  console.log('Books with commons Special:FilePath in cover_image:', commonsCoverCount);
}

inspect();
