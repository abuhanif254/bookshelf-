import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanAll() {
  console.log('?? Starting UTM cleanup on Supabase books...');
  let totalCleaned = 0;

  while (true) {
    const { data: books, error } = await supabase
      .from('books')
      .select('id, drive_url, cover_image')
      .like('drive_url', '%utm_source%')
      .limit(300);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }

    if (!books || books.length === 0) {
      console.log('? No more books with utm_source found!');
      break;
    }

    const CONCURRENCY = 20;
    for (let i = 0; i < books.length; i += CONCURRENCY) {
      const slice = books.slice(i, i + CONCURRENCY);
      await Promise.all(slice.map(async (b) => {
        const cleanDrive = b.drive_url ? b.drive_url.split('?')[0] : b.drive_url;
        const cleanCover = b.cover_image
          ? b.cover_image.replace(/\?utm_source=[^&]+(&utm_campaign=[^&]+)?(&utm_content=[^&]+)?/, '')
          : b.cover_image;

        await supabase.from('books').update({
          drive_url: cleanDrive,
          cover_image: cleanCover
        }).eq('id', b.id);
      }));
    }

    totalCleaned += books.length;
    console.log(`Cleaned ${totalCleaned} books...`);
  }

  console.log(`?? Cleanup finished! Total books cleaned: ${totalCleaned}`);
}

cleanAll();
