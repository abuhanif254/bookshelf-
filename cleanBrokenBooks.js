const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://ubiltcownzgrjvfavfkv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y');

async function clean() {
  console.log('Fetching broken books...');
  // We can delete in batches if needed, or all at once if the API allows it. 
  // Supabase delete() without eq() will delete all if we aren't careful.
  // Using .eq('drive_url', '') will delete all books with empty drive URLs.
  
  const { data, error } = await sb
    .from('books')
    .delete()
    .eq('drive_url', '')
    .select('id');
    
  if (error) {
    console.error('Failed to delete:', error);
  } else {
    console.log(`Successfully deleted ${data.length} broken books.`);
  }
}

clean();
