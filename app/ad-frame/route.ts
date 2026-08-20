import { NextResponse } from 'next/server';
import { getAdSettings } from '@/lib/db';
import { getSupabaseSettings } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  let settings = getAdSettings();
  const supaSettings = await getSupabaseSettings();
  if (supaSettings) {
    settings = { ...settings, ...supaSettings };
  }
  
  let adCode = settings.adCode || '';
  // Fix protocol-relative URLs
  adCode = adCode.replace(/(src|href)=['"]\/\//g, '$1="https://');

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ad Frame</title>
    <base target="_blank">
    <style>
      body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; background: transparent; }
    </style>
  </head>
  <body>
    ${adCode}
  </body>
</html>`;

  return new NextResponse(html.trim(), {
    headers: {
      'Content-Type': 'text/html',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    },
  });
}
