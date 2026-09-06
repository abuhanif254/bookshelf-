'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { cardHTML, cleanTitle } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { getBaseUrl } from '@/lib/url';

interface TopicClientProps {
  books: Product[];
  topicTitle: string;
}

type SortOption = 'downloads' | 'rating' | 'newest' | 'pages_desc' | 'pages_asc' | 'title';
type TypeFilter = 'all' | 'free' | 'paid' | 'affiliate';
type LengthFilter = 'all' | 'short' | 'standard' | 'long';
type ViewMode = 'grid' | 'list';

export default function TopicClient({ books, topicTitle }: TopicClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<SortOption>('downloads');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(24);
  const [copied, setCopied] = useState(false);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: books.length,
      free: books.filter(b => b.type === 'free').length,
      paid: books.filter(b => b.type === 'paid').length,
      affiliate: books.filter(b => b.type === 'affiliate').length,
    };
  }, [books]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchFilter, typeFilter, lengthFilter, sortBy]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    let list = books;

    // Search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.sub && b.sub.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter(b => b.type === typeFilter);
    }

    // Reading length filter
    if (lengthFilter === 'short') {
      list = list.filter(b => b.pages > 0 && b.pages < 100);
    } else if (lengthFilter === 'standard') {
      list = list.filter(b => b.pages >= 100 && b.pages <= 300);
    } else if (lengthFilter === 'long') {
      list = list.filter(b => b.pages > 300);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'downloads') {
        const dA = a.downloads || a.reviews * 12 || 0;
        const dB = b.downloads || b.reviews * 12 || 0;
        return dB - dA;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating || (b.reviews - a.reviews);
      }
      if (sortBy === 'newest') {
        return b.id - a.id;
      }
      if (sortBy === 'pages_desc') {
        return b.pages - a.pages;
      }
      if (sortBy === 'pages_asc') {
        return a.pages - b.pages;
      }
      if (sortBy === 'title') {
        return cleanTitle(a.title).localeCompare(cleanTitle(b.title));
      }
      return 0;
    });
  }, [books, searchFilter, typeFilter, lengthFilter, sortBy]);

  const visibleBooks = useMemo(() => {
    return filteredBooks.slice(0, visibleCount);
  }, [filteredBooks, visibleCount]);

  const hasActiveFilters = searchFilter.trim() !== '' || typeFilter !== 'all' || lengthFilter !== 'all';

  const resetAllFilters = () => {
    setSearchFilter('');
    setTypeFilter('all');
    setLengthFilter('all');
    setSortBy('downloads');
  };

  const handleShareTopic = async () => {
    const baseUrl = getBaseUrl();
    const url = typeof window !== 'undefined' ? window.location.href : baseUrl;
    const text = `Explore ${topicTitle} on Bookshelf: ${url}`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${topicTitle} — Bookshelf`,
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
        toast('Link Copied! 🔗', 'Topic link copied to clipboard');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      prompt('Copy topic link:', url);
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
      <div className="cat-hub-toolbar">
        {/* Row 1: Search, Sort, View Toggle, Share */}
        <div className="cat-toolbar-row1">
          <div className="cat-toolbar-search">
            <input
              type="text"
              placeholder={`Search ${books.length} titles in this topic…`}
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              aria-label="Filter titles"
            />
            {searchFilter && (
              <button
                type="button"
                className="cat-toolbar-clear"
                onClick={() => setSearchFilter('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="cat-toolbar-right">
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Sort:
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="cat-select"
                aria-label="Sort books by"
              >
                <option value="downloads">🔥 Most Downloaded</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="newest">🆕 Newest Arrivals</option>
                <option value="pages_desc">📄 Longest Read</option>
                <option value="pages_asc">⚡ Quickest Read</option>
                <option value="title">🔤 Title (A–Z)</option>
              </select>
            </label>

            <select
              value={lengthFilter}
              onChange={e => setLengthFilter(e.target.value as LengthFilter)}
              className="cat-select"
              aria-label="Filter by length"
            >
              <option value="all">📖 All Lengths</option>
              <option value="short">⚡ Quick Reads (&lt;100 pgs)</option>
              <option value="standard">📘 Standard (100–300 pgs)</option>
              <option value="long">📚 Deep Dives (300+ pgs)</option>
            </select>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`cat-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                type="button"
                className={`cat-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
              </button>
            </div>

            {/* Share Topic */}
            <button
              type="button"
              onClick={handleShareTopic}
              className="cat-dl-btn"
              style={{
                background: copied ? '#059669' : '#f1f5f9',
                color: copied ? '#ffffff' : 'var(--ink)',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                fontSize: 12.5,
              }}
            >
              <span>{copied ? '✓' : '📢'}</span>
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Format Pills */}
        <div className="cat-toolbar-row2">
          <div className="cat-pills-group">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Format:
            </span>
            <button
              type="button"
              className={`cat-pill-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All Books ({counts.all})
            </button>
            <button
              type="button"
              className={`cat-pill-btn ${typeFilter === 'free' ? 'active' : ''}`}
              onClick={() => setTypeFilter('free')}
            >
              ⚡ 100% Free PDFs ({counts.free})
            </button>
            {counts.paid > 0 && (
              <button
                type="button"
                className={`cat-pill-btn ${typeFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setTypeFilter('paid')}
              >
                Paid Handbooks ({counts.paid})
              </button>
            )}
            {counts.affiliate > 0 && (
              <button
                type="button"
                className={`cat-pill-btn ${typeFilter === 'affiliate' ? 'active' : ''}`}
                onClick={() => setTypeFilter('affiliate')}
              >
                Partner Picks ({counts.affiliate})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="cat-active-bar">
          <div className="cat-active-tags">
            <span style={{ fontWeight: 600 }}>Active Filters:</span>
            {searchFilter && (
              <span className="cat-active-tag">
                &ldquo;{searchFilter}&rdquo;
                <button type="button" onClick={() => setSearchFilter('')}>✕</button>
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="cat-active-tag">
                {typeFilter === 'free' ? 'Free PDFs' : typeFilter === 'paid' ? 'Paid Books' : 'Partners'}
                <button type="button" onClick={() => setTypeFilter('all')}>✕</button>
              </span>
            )}
            {lengthFilter !== 'all' && (
              <span className="cat-active-tag">
                {lengthFilter === 'short' ? 'Quick Reads (<100 pgs)' : lengthFilter === 'standard' ? 'Standard (100–300 pgs)' : 'Deep Dives (300+ pgs)'}
                <button type="button" onClick={() => setLengthFilter('all')}>✕</button>
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              style={{ color: 'var(--link)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, textDecoration: 'underline' }}
            >
              Clear all
            </button>
          </div>
          <div>
            Showing <b>{visibleBooks.length}</b> of <b>{filteredBooks.length}</b> titles
          </div>
        </div>
      )}

      {/* Results View */}
      {filteredBooks.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid" style={{ marginBottom: 36 }}>
              {visibleBooks.map(b => (
                <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
              ))}
            </div>
          ) : (
            <div className="cat-list-view">
              {visibleBooks.map(b => {
                const cleanT = cleanTitle(b.title);
                const cover = b.coverImage || b.coverUrl;
                const estReadTime = Math.max(1, Math.round((b.pages || 80) * 1.5));
                return (
                  <div key={b.id} className="cat-list-row">
                    <div className="cat-list-thumb">
                      {cover ? (
                        <img src={cover} alt={cleanT} loading="lazy" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      ) : (
                        <div className="cat-list-thumb-fallback" style={{ background: b.bg || '#0f2a43', color: b.fg || '#ffffff' }}>
                          {cleanT.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="cat-list-body">
                      <div className="cat-list-badges">
                        <span className="cat-badge-cat">{b.cat}</span>
                        {b.type === 'free' ? (
                          <span className="cat-badge-free">⚡ FREE PDF</span>
                        ) : (
                          <span className="cat-badge-paid">${Number(b.price).toFixed(2)}</span>
                        )}
                        {b.badge && <span className="cat-badge-feat">{b.badge}</span>}
                      </div>

                      <h3 className="cat-list-title">
                        <Link href={`/pdf/${b.slug}`}>{cleanT}</Link>
                      </h3>

                      {b.sub && <p className="cat-list-sub">{b.sub}</p>}

                      <div className="cat-list-meta">
                        <span className="cat-list-author">by <b>{b.author}</b></span>
                        <span className="cat-list-dot">·</span>
                        <span className="cat-list-rating">★ {Number(b.rating).toFixed(1)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({b.reviews})</span></span>
                        <span className="cat-list-dot">·</span>
                        <span className="cat-list-pages">{b.pages} pages (~{estReadTime} min read)</span>
                      </div>
                    </div>

                    <div className="cat-list-actions">
                      {b.type === 'free' ? (
                        <button type="button" className="cat-dl-btn" data-free={b.id}>
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Instant Download
                        </button>
                      ) : (
                        <button type="button" className="cat-dl-btn paid" data-add={b.id}>
                          Add to Cart · ${Number(b.price).toFixed(2)}
                        </button>
                      )}
                      <button type="button" className="cat-qv-btn" data-qv={b.id}>
                        Quick View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progressive Load More */}
          {filteredBooks.length > visibleCount && (
            <div className="cat-load-wrap">
              <button
                type="button"
                className="cat-load-btn"
                onClick={() => setVisibleCount(prev => prev + 24)}
              >
                Load More Books (+24)
              </button>
              <div className="cat-load-progress">
                Showing <b>{visibleBooks.length}</b> of <b>{filteredBooks.length}</b> titles
              </div>
              <div className="cat-progress-bar">
                <div
                  className="cat-progress-fill"
                  style={{ width: `${Math.min(100, (visibleBooks.length / filteredBooks.length) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredBooks.length)}
                style={{ fontSize: 12, color: 'var(--link)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Show all {filteredBooks.length} titles
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty" style={{ background: '#fff', borderRadius: 12, padding: '48px 24px', textAlign: 'center', marginBottom: 48, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>No titles matched your criteria</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 460, margin: '0 auto 18px' }}>
            We couldn&apos;t find any books in {topicTitle} matching your current filters.
          </p>
          <button
            type="button"
            className="cat-load-btn"
            onClick={resetAllFilters}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
