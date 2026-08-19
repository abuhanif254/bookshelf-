const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ubiltcownzgrjvfavfkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking Supabase tables...');
  const res1 = await supabase.from('books').select('id, title').limit(5);
  console.log('Books table query:', res1.error ? res1.error.message : res1.data);
}

check();
