import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ubiltcownzgrjvfavfkv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
