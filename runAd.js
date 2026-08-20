const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://ubiltcownzgrjvfavfkv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaWx0Y293bnpncmp2ZmF2Zmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDI4ODMsImV4cCI6MjEwMjcxODg4M30.Ksl2XIzpCDpIxMDysQLaapNw3oWwncoz9EWx6Iyy02Y');
const adCode = '<script async="async" data-cfasync="false" src="https://pl30933342.effectivecpmnetwork.com/e0d4316b2ca77b0196a17bef73465abb/invoke.js"></script>\n<div id="container-e0d4316b2ca77b0196a17bef73465abb"></div>';
sb.from('settings').upsert({ id: 'global', banner_ad_code: adCode }).then(console.log).catch(console.error);
