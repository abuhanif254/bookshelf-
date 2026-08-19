const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ubiltcownzgrjvfavfkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('books').select('*').limit(1);
  if (error) {
    console.log('Query result error (expected if table not created yet):', error.message, error.code);
  } else {
    console.log('Query successful, found rows:', data.length);
  }
}

test();
