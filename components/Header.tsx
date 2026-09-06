'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/products';
import { cleanTitle } from '@/lib/helpers';

// Highlight matched characters in search suggestions
function highlightMatch(text: string, q: string) {
  if (!q || !text) return text;
  const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!safeQ) return text;
  const parts = text.split(new RegExp(`(${safeQ})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.trim().toLowerCase() ? (
          <mark key={i} className="sug-match">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Cover thumbnail with fallback
function SugCover({ book }: { book: Product }) {
  const [imgError, setImgError] = useState(false);
  const src = book.coverImage || book.coverUrl;

  if (src && !imgError) {
    return (
      <div className="sug-thumb">
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="sug-thumb" style={{ background: book.bg || '#0f2a43' }}>
      <div className="sug-thumb-fallback" style={{ color: book.fg || '#ffffff' }}>
        {book.title ? book.title.slice(0, 2).toUpperCase() : 'PDF'}
      </div>
    </div>
  );
}

const scopeOptions = [
  { label: 'All PDFs', value: 'All' },
  { label: '⚡ Free', value: 'free' },
  { label: 'Paid Books', value: 'paid' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Productivity', value: 'Productivity' },
  { label: 'Programming', value: 'Programming' },
  { label: 'Business', value: 'Business' },
  { label: 'Science', value: 'Science' },
  { label: 'Philosophy', value: 'Philosophy' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Design', value: 'Design' },
];

export default function Header() {
  const { state, cartQty } = useStore();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('All');
  const [sugOpen, setSugOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const sugRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevQty = useRef(0);

  const qty = cartQty();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bookshelf_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches(prev => {
      const updated = [clean, ...prev.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem('bookshelf_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== term);
      try {
        localStorage.setItem('bookshelf_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('bookshelf_recent_searches');
    } catch {}
  };

  // Debounced server search for autocomplete dropdown
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions(null);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', trimmed);
      if (scope !== 'All') {
        if (scope === 'free' || scope === 'paid') {
          params.set('type', scope);
        } else {
          params.set('cat', scope);
        }
      }
      params.set('limit', '7');

      fetch(`/api/books/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.books)) {
            setSuggestions(data.books);
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => {
          setIsSearching(false);
          setSelectedIndex(-1);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [query, scope]);

  // Cart bump animation
  useEffect(() => {
    if (qty !== prevQty.current) {
      setBump(true);
      prevQty.current = qty;
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
  }, [qty]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) {
        setSugOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Keyboard navigation
  const runSearch = (q: string, targetScope: string = scope) => {
    setSugOpen(false);
    const clean = q.trim();
    if (!clean) return;
    saveRecentSearch(clean);

    const params = new URLSearchParams();
    params.set('q', clean);
    if (targetScope && targetScope !== 'All') {
      if (targetScope === 'free') {
        params.set('preset', 'free');
      } else if (targetScope === 'paid') {
        params.set('type', 'paid');
      } else {
        params.set('cat', targetScope);
      }
    }
    router.push(`/library?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!sugOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setSugOpen(true);
        e.preventDefault();
      }
      if (e.key === 'Enter') {
        runSearch(query.trim(), scope);
      }
      return;
    }

    const hasSuggestions = suggestions && suggestions.length > 0;
    const totalItems = hasSuggestions ? suggestions.length + 1 : 0; // +1 for "View all results" footer

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalItems > 0) {
        setSelectedIndex(prev => (prev + 1) % totalItems);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalItems > 0) {
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const item = suggestions[selectedIndex];
        saveRecentSearch(item.title);
        setSugOpen(false);
        router.push(`/pdf/${item.slug}`);
      } else {
        runSearch(query.trim(), scope);
      }
    } else if (e.key === 'Escape') {
      setSugOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Auto scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.getElementById(`sug-opt-${selectedIndex}`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const trending = ['sherlock holmes', 'pride and prejudice', 'python', 'rich dad', 'deep focus'];
  const popularCategories = ['Fiction', 'Productivity', 'Programming', 'Business', 'Philosophy', 'Science'];

  return (
    <header className="hd">
      <div className="hd-top">
        <Link href="/" className="cell logo" aria-label="Bookshelf home">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--smile)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
              <path d="M6 14h6"/>
            </svg>
            <b>book<i>shelf</i></b>
          </div>
        </Link>

        <button className="cell deliver" type="button" aria-label="Instant Digital PDF Delivery">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Instant Access<br/><b>Digital PDF Downloads ⚡</b></span>
        </button>

        <div className="sugwrap" ref={sugRef}>
          <div className="search" role="search">
            <select
              id="searchScope"
              aria-label="Search scope"
              value={scope}
              onChange={e => setScope(e.target.value)}
            >
              {scopeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              ref={inputRef}
              id="searchInput"
              type="text"
              placeholder='Search 8,000+ free PDFs, authors, topics… (⌘K)'
              autoComplete="off"
              aria-label="Search PDFs"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSugOpen(true);
              }}
              onFocus={() => setSugOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {isSearching && (
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: '10px' }}>
                <span className="sug-spinner" title="Searching..." />
              </div>
            )}
            <button
              id="searchBtn"
              aria-label="Search"
              type="button"
              onClick={() => runSearch(query.trim(), scope)}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5"/>
                <path d="M15.5 15.5 21 21"/>
              </svg>
            </button>
          </div>

          <div
            className={`sug${sugOpen ? ' open' : ''}`}
            id="sugBox"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions ? (
              suggestions.length > 0 ? (
                <>
                  <div className="sug-header">
                    <span className="sug-lbl">Top Matches</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                      Navigate with ↑ ↓ · ↵ to open
                    </span>
                  </div>
                  <div className="sug-list">
                    {suggestions.map((p, idx) => {
                      const isActive = selectedIndex === idx;
                      const cleanT = cleanTitle(p.title);
                      return (
                        <button
                          key={p.id}
                          id={`sug-opt-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          className={`sug-item${isActive ? ' active' : ''}`}
                          onClick={() => {
                            saveRecentSearch(p.title);
                            setSugOpen(false);
                            router.push(`/pdf/${p.slug}`);
                          }}
                        >
                          <SugCover book={p} />
                          <div className="sug-info">
                            <span className="sug-title">
                              {highlightMatch(cleanT, query)}
                            </span>
                            <span className="sug-author">
                              by {p.author}
                            </span>
                          </div>
                          <div className="sug-meta">
                            <span className="sug-pill cat">{p.cat}</span>
                            {p.type === 'free' ? (
                              <span className="sug-pill free">⚡ FREE</span>
                            ) : (
                              <span className="sug-pill paid">${Number(p.price).toFixed(2)}</span>
                            )}
                            {p.rating > 0 && (
                              <span className="sug-pill rating">★ {Number(p.rating).toFixed(1)}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    id={`sug-opt-${suggestions.length}`}
                    role="option"
                    aria-selected={selectedIndex === suggestions.length}
                    className={`sug-footer-btn${selectedIndex === suggestions.length ? ' active' : ''}`}
                    onClick={() => runSearch(query.trim(), scope)}
                  >
                    <span>Press ↵ to view all matching results for &ldquo;{query}&rdquo;</span>
                    <span>→</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    No exact title or author matches for &ldquo;{query}&rdquo;
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '14px' }}>
                    Try broader search terms or browse our full library catalog.
                  </p>
                  <button
                    className="sug-footer-btn"
                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    onClick={() => runSearch(query.trim(), scope)}
                  >
                    Search entire library for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              )
            ) : (
              <div>
                {recentSearches.length > 0 && (
                  <>
                    <div className="sug-header">
                      <span className="sug-lbl">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        className="sug-clear"
                        onClick={clearRecentSearches}
                      >
                        Clear All
                      </button>
                    </div>
                    <div>
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          className="sug-recent-item"
                          onClick={() => {
                            setQuery(term);
                            runSearch(term);
                          }}
                        >
                          <div className="sug-recent-main">
                            <span className="sug-recent-icon">🕒</span>
                            <span style={{ fontWeight: 500 }}>{term}</span>
                          </div>
                          <button
                            type="button"
                            className="sug-recent-del"
                            title="Remove from history"
                            onClick={(e) => removeRecentSearch(term, e)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="sug-header">
                  <span className="sug-lbl">🔥 Trending Searches</span>
                </div>
                <div className="sug-chips">
                  {trending.map(t => (
                    <button
                      key={t}
                      type="button"
                      className="sug-chip"
                      onClick={() => {
                        setQuery(t);
                        runSearch(t);
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                        <polyline points="17 6 23 6 23 12"/>
                      </svg>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="sug-header">
                  <span className="sug-lbl">📚 Popular Categories</span>
                </div>
                <div className="sug-chips">
                  {popularCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className="sug-chip"
                      onClick={() => {
                        setSugOpen(false);
                        router.push(`/category/${cat.toLowerCase()}`);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="cell acct" type="button"><span>My Orders</span><b>&amp; Downloads</b></button>
        <Link href="/cart" className="cell cartbtn" aria-label="Cart">
          <svg viewBox="0 0 24 24">
            <circle cx="9.5" cy="20" r="1.6"/>
            <circle cx="18" cy="20" r="1.6"/>
            <path d="M2.5 3.5h2.6l2.5 11.5h10.6l2.3-8H6.2"/>
          </svg>
          <span className={`n${bump ? ' bump' : ''}`} id="cartCount">{qty}</span>
          <span className="lbl">Cart</span>
        </Link>
      </div>

      <nav className="hd-sub">
        <div className="wrap">
          <Link href="/library" className="cell all">☰ All</Link>
          <Link href="/library?preset=deals" className="cell">Today&apos;s Deals</Link>
          <Link href="/library?preset=free" className="cell">Free PDFs</Link>
          <Link href="/library?preset=best" className="cell">Best Sellers</Link>
          <Link href="/library?preset=new" className="cell">New Releases</Link>
          <Link href="/account/library" className="cell">My Library</Link>
        </div>
      </nav>
    </header>
  );
}
