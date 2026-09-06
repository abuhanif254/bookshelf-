-- ==============================================================================
-- Supabase Schema & Indexing Script for 300,000+ Multilingual Books
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Add 'lang' column to books table (supports ISO 639 codes: 'bn', 'en', 'hi', 'ur', 'es', 'zh')
ALTER TABLE books ADD COLUMN IF NOT EXISTS lang VARCHAR(10) DEFAULT 'en';

-- 2. Populate default language for existing records
UPDATE books SET lang = 'en' WHERE lang IS NULL;

-- 3. High-Performance B-Tree Indexes for 300,000+ Scale
-- Unique slug index for instant book detail page lookups (O(1) search)
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);

-- Language filtering index (e.g., /books/bangla, /books/hindi)
CREATE INDEX IF NOT EXISTS idx_books_lang ON books(lang);

-- Category & Language composite index for category silo filtering
CREATE INDEX IF NOT EXISTS idx_books_cat ON books(cat);
CREATE INDEX IF NOT EXISTS idx_books_cat_lang ON books(cat, lang);

-- Author lookup index for author hubs
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Fast download sorting index for popular/best-seller rankings
CREATE INDEX IF NOT EXISTS idx_books_downloads ON books(downloads DESC);

-- Keyset pagination index for fast chunked sitemaps (avoids table scans)
CREATE INDEX IF NOT EXISTS idx_books_id_asc ON books(id ASC);

-- Verify row counts and language breakdown
SELECT lang, COUNT(*) as book_count FROM books GROUP BY lang ORDER BY book_count DESC;
