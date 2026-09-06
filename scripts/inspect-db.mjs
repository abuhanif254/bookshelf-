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
}

inspect();
