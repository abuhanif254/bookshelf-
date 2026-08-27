export function getBaseUrl() {
  // 1. User-defined primary URL (e.g. custom domain added later)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 2. Production Vercel URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 3. Current Live Domain
  return 'https://www.pdf-bookshelf.com';
}
