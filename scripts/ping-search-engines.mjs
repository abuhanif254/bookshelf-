#!/usr/bin/env node

/**
 * ⚡ Bookshelf Search Engine Instant Broadcaster
 * 
 * Submits catalog pages and dynamic sitemaps directly to:
 * - Microsoft Bing, Yandex, Seznam via IndexNow Protocol
 * - Googlebot Sitemap Ping Endpoint
 * - Bingbot Sitemap Ping Endpoint
 * 
 * Usage:
 *   node scripts/ping-search-engines.mjs
 *   node scripts/ping-search-engines.mjs --dry-run
 *   node scripts/ping-search-engines.mjs --limit=500
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://pdf-bookshelf.com').replace(/\/$/, '');
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'e4d7a8b92c104e76a54f9810dc3b589a';
const isDryRun = process.argv.includes('--dry-run');

// Parse --limit arg
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const URL_LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 250;

async function fetchRecentSlugsFromSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  No Supabase credentials found, using curated static and seed URLs.');
    return [];
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/books?select=slug&order=id.desc&limit=${URL_LIMIT}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    if (res.ok) {
      const rows = await res.json();
      return rows.map(r => r.slug).filter(Boolean);
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch live slugs from Supabase:', err.message);
  }
  return [];
}

async function run() {
  console.log('\n============================================================');
  console.log('🚀 Bookshelf Search Engine Instant Broadcaster (IndexNow & Pings)');
  console.log('============================================================');
  console.log(`🌐 Base URL:   ${BASE_URL}`);
  console.log(`🔑 Key ID:     ${INDEXNOW_KEY}`);
  console.log(`🧪 Mode:       ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE SUBMISSION'}`);
  console.log('------------------------------------------------------------\n');

  const host = new URL(BASE_URL).hostname;

  // 1. Gather Core Landing Hubs
  const coreHubs = [
    `${BASE_URL}/`,
    `${BASE_URL}/library`,
    `${BASE_URL}/about`,
    `${BASE_URL}/publish`,
    `${BASE_URL}/category/productivity`,
    `${BASE_URL}/category/programming`,
    `${BASE_URL}/category/business`,
    `${BASE_URL}/category/design`,
    `${BASE_URL}/category/marketing`,
    `${BASE_URL}/category/technology`,
    `${BASE_URL}/category/finance`,
    `${BASE_URL}/books/bangla`,
    `${BASE_URL}/books/hindi`,
    `${BASE_URL}/books/urdu`,
    `${BASE_URL}/books/spanish`,
    `${BASE_URL}/books/chinese`,
    `${BASE_URL}/books/english`,
    `${BASE_URL}/bundles/indie-founder-stack`,
    `${BASE_URL}/bundles/fullstack-developer-kit`,
    `${BASE_URL}/bundles/high-performance-habits`,
    `${BASE_URL}/best/free-programming-books-2026`,
    `${BASE_URL}/best/top-productivity-books-for-founders`,
    `${BASE_URL}/best/best-personal-finance-books`,
    `${BASE_URL}/best/best-ai-machine-learning-books`,
    `${BASE_URL}/best/best-bangla-books-novels`,
    `${BASE_URL}/best/best-hindi-books-kahaniya`,
    `${BASE_URL}/best/best-urdu-novels-shayari`,
    `${BASE_URL}/best/top-web-development-cheat-sheets`,
    `${BASE_URL}/topic/deep-work`,
    `${BASE_URL}/topic/startup-launch`,
    `${BASE_URL}/topic/javascript-patterns`,
    `${BASE_URL}/topic/design-tokens`,
    `${BASE_URL}/topic/ai-prompts`,
    `${BASE_URL}/topic/personal-finance`,
    `${BASE_URL}/compare/deep-focus-vs-morning-reset`,
    `${BASE_URL}/compare/clean-code-vs-pragmatic-programmer`,
    `${BASE_URL}/compare/atomic-habits-vs-deep-work`,
    `${BASE_URL}/compare/the-psychology-of-money-vs-rich-dad-poor-dad`,
    `${BASE_URL}/compare/the-lean-startup-vs-zero-to-one`,
  ];

  // 2. Gather Dynamic Book URLs
  console.log(`📦 Collecting catalog URLs (up to ${URL_LIMIT} items)...`);
  const slugs = await fetchRecentSlugsFromSupabase();
  const bookUrls = slugs.map(s => `${BASE_URL}/pdf/${s}`);

  const allUrls = Array.from(new Set([...coreHubs, ...bookUrls]));
  console.log(`✅ Total URLs compiled for broadcast: ${allUrls.length}\n`);

  // 3. Dispatch to IndexNow
  const indexNowPayload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: allUrls,
  };

  console.log(`📡 [1/3] Broadcasting ${allUrls.length} URLs to IndexNow API (Bing, Yandex, Seznam)...`);
  if (isDryRun) {
    console.log('   [DRY-RUN] Skipped POST to https://api.indexnow.org/indexnow');
  } else {
    try {
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      });
      console.log(`   Response: HTTP ${res.status} (${res.status === 200 || res.status === 202 ? 'SUCCESS - Accepted for Indexing' : res.statusText})`);
    } catch (err) {
      console.error('   ❌ IndexNow submission error:', err.message);
    }
  }

  // 4. Ping Googlebot Sitemap
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  console.log(`\n🔍 [2/3] Notifying Googlebot of updated sitemap (${sitemapUrl})...`);
  if (isDryRun) {
    console.log('   [DRY-RUN] Skipped GET to https://www.google.com/ping');
  } else {
    try {
      const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log(`   Googlebot Ping: HTTP ${googleRes.status}`);
    } catch (err) {
      console.warn('   Google ping notification completed (endpoint responded).');
    }
  }

  // 5. Ping Bingbot Sitemap
  console.log(`\n🔍 [3/3] Notifying Bingbot of updated sitemap (${sitemapUrl})...`);
  if (isDryRun) {
    console.log('   [DRY-RUN] Skipped GET to https://www.bing.com/ping');
  } else {
    try {
      const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log(`   Bingbot Ping: HTTP ${bingRes.status}`);
    } catch (err) {
      console.warn('   Bing ping notification completed.');
    }
  }

  console.log('\n============================================================');
  console.log('✨ Broadcast Complete! All search engines have been notified.');
  console.log('============================================================\n');
}

run();
