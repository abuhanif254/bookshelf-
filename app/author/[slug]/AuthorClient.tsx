'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { getBaseUrl } from '@/lib/url';

interface AuthorClientProps {
  books: Product[];
  authorName: string;
}

export default function AuthorClient({ books, authorName }: AuthorClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'title' | 'pages'>('downloads');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Extract distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(b => {
      if (b.cat) cats.add(b.cat);
    });
    return Array.from(cats);
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let list = selectedCat === 'all' ? books : books.filter(b => b.cat === selectedCat);
    return [...list].sort((a, b) => {
      if (sortBy === 'downloads') {
        const dA = a.downloads || a.reviews * 12 || 0;
        const dB = b.downloads || b.reviews * 12 || 0;
        return dB - dA;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'pages') {
        return b.pages - a.pages;
      }
      return 0;
    });
  }, [books, selectedCat, sortBy]);

  const handleShareAuthor = async () => {
    const baseUrl = getBaseUrl();
    const url = typeof window !== 'undefined' ? window.location.href : `${baseUrl}/author/${books[0]?.author ? books[0].author.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}`;
    const text = `Explore all free PDF books by ${authorName} on Bookshelf: ${url}`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `Free PDF Books by ${authorName}`,
          text,
          url,
        });
        return;
      } catch {}
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast('Link Copied! 🔗', 'Author profile URL copied to clipboard');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      prompt('Copy author profile link:', url);
    }
  };

  const handleAction = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-wish]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.qv) dispatch({ type: 'SET_QUICK_VIEW', id: +btn.dataset.qv });
    if (btn.dataset.open) router.push(`/pdf/${btn.dataset.open}`);
    if (btn.dataset.wish) {
      const id = +btn.dataset.wish;
      dispatch({ type: 'TOGGLE_WISHLIST', id });
      toast(state.wishlist.has(id) ? 'Removed from Wishlist' : 'Added to Wishlist ♡');
    }
  };

  return (
    <div onClick={handleAction}>
      {/* Interactive Controls Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 10,
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
            Filter Collection:
          </span>
          <button
            onClick={() => setSelectedCat('all')}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: selectedCat === 'all' ? 'var(--ink)' : '#f1f5f9',
              color: selectedCat === 'all' ? '#ffffff' : '#334155',
            }}
          >
            All ({books.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedCat === cat ? 'var(--ink)' : '#f1f5f9',
                color: selectedCat === cat ? '#ffffff' : '#334155',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              background: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <option value="downloads">🔥 Most Downloaded</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="title">🔤 Title (A–Z)</option>
            <option value="pages">📄 Page Count</option>
          </select>

          <button
            onClick={handleShareAuthor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: copied ? '#059669' : '#f1f5f9',
              color: copied ? '#ffffff' : 'var(--ink)',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{copied ? '✓' : '📢'}</span>
            <span>{copied ? 'Copied' : 'Share Author'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Books */}
      {filteredBooks.length > 0 ? (
        <div className="grid">
          {filteredBooks.map(b => (
            <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
          ))}
        </div>
      ) : (
        <div className="empty" style={{ background: '#fff', borderRadius: 8, padding: 40, textAlign: 'center' }}>
          <h3>No books found for this filter</h3>
          <p>Try switching to &ldquo;All&rdquo; to view the complete catalog by {authorName}.</p>
        </div>
      )}
    </div>
  );
}
