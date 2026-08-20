import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data: maxData } = await supabase.from('books').select('id').order('id', { ascending: false }).limit(1);
  const nextId = (maxData?.[0]?.id || 0) + 1;

  const { data, error } = await supabase.from('books').insert({
    id: nextId,
    slug: 'test-book-' + Date.now(),
    title: 'Test Book',
    author: 'Test Author',
    cat: 'Productivity'
  }).select().single();
  
  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert success! ID:', data.id);
  }
}

testInsert();
