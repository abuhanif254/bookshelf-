'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { P, Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

const PAGE_SIZE = 12;

const DEFAULT_CATEGORIES = [
  'All',
  'Productivity',
  'Programming',
  'Design',
  'Business',
  'Finance',
  'Self-Help',
  'Marketing',
  'Psychology',
  'Writing',
  'Data Science',
  'Technology',
  'AI & Machine Learning',
];

export default function LibraryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state: storeState, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();

  // URL search params state initialization
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('cat') || 'All';
  const initialLang = searchParams.get('lang') || 'all';
  const initialType = searchParams.get('preset') === 'free' ? 'free' : (searchParams.get('type') || 'all');
  const initialSort = searchParams.get('preset') === 'best' ? 'downloads' : (searchParams.get('sort') || 'downloads');
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [books, setBooks] = useState<Product[]>(P.slice(0, PAGE_SIZE));
  const [totalCount, setTotalCount] = useState<number>(P.length);
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(P.length / PAGE_SIZE));
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state when URL params change externally
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('cat') || 'All';
    const lang = searchParams.get('lang') || 'all';
    const preset = searchParams.get('preset');
    const type = preset === 'free' ? 'free' : (searchParams.get('type') || 'all');
    const sort = preset === 'best' ? 'downloads' : (searchParams.get('sort') || 'downloads');
    const page = parseInt(searchParams.get('page') || '1', 10);

    setSearchQuery(q);
    setDebouncedQ(q);
    setSelectedCat(cat);
    setSelectedLang(lang);
    setSelectedType(type);
    setSelectedSort(sort);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch paginated books from server API
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const queryParams = new URLSearchParams();
    queryParams.set('page', String(currentPage));
    queryParams.set('limit', String(PAGE_SIZE));
    if (debouncedQ.trim()) queryParams.set('search', debouncedQ.trim());
    if (selectedCat && selectedCat !== 'All') queryParams.set('cat', selectedCat);
    if (selectedLang && selectedLang !== 'all') queryParams.set('lang', selectedLang);
    if (selectedType && selectedType !== 'all') queryParams.set('type', selectedType);
    if (selectedSort) queryParams.set('sort', selectedSort);

    // Update browser URL without full refresh
    const nextUrl = `/library?${queryParams.toString()}`;
    startTransition(() => {
      window.history.replaceState(null, '', nextUrl);
    });

    fetch(`/api/books/paginated?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return;
        if (data.success && Array.isArray(data.books)) {
          setBooks(data.books);
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || Math.ceil((data.total || 0) / PAGE_SIZE) || 1);
        } else {
          // Fallback to local filter if API fails
          let fallback = P;
          if (selectedCat !== 'All') fallback = fallback.filter(b => b.cat === selectedCat);
          if (selectedType !== 'all') fallback = fallback.filter(b => b.type === selectedType);
          if (debouncedQ.trim()) {
            const low = debouncedQ.toLowerCase();
            fallback = fallback.filter(b => b.title.toLowerCase().includes(low) || b.author.toLowerCase().includes(low));
          }
          setBooks(fallback.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
          setTotalCount(fallback.length);
          setTotalPages(Math.ceil(fallback.length / PAGE_SIZE) || 1);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setBooks(P.slice(0, PAGE_SIZE));
          setTotalCount(P.length);
          setTotalPages(Math.ceil(P.length / PAGE_SIZE));
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQ, selectedCat, selectedLang, selectedType, selectedSort, currentPage]);

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
      toast(storeState.wishlist.has(id) ? 'Removed from Wishlist' : 'Added to Wishlist ♡');
    }
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div className="crumb">
        <Link href="/">Home</Link> &rsaquo; <span>Full PDF Library Catalog</span>
        {selectedCat !== 'All' && <span> &rsaquo; {selectedCat}</span>}
        {debouncedQ && <span> &rsaquo; &ldquo;{debouncedQ}&rdquo;</span>}
      </div>

      {/* Multilingual Language Switcher Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '12px 18px',
          border: '1px solid #e2e8f0',
          margin: '14px 0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
          🌐 Language:
        </span>
        <button
          onClick={() => { setSelectedLang('all'); setCurrentPage(1); }}
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 20,
            background: selectedLang === 'all' ? 'var(--ink)' : '#f1f5f9',
            color: selectedLang === 'all' ? '#ffffff' : '#334155',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          All Languages (300k+)
        </button>
        {SUPPORTED_LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => { setSelectedLang(l.code); setCurrentPage(1); }}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 20,
              background: selectedLang === l.code ? 'var(--ink)' : '#f1f5f9',
              color: selectedLang === l.code ? '#ffffff' : '#334155',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{l.nativeName}</span>
            <span style={{ fontSize: 11, opacity: 0.75 }}>({l.name})</span>
          </button>
        ))}
      </div>

      <div className="browse">
        {/* Sidebar Filters */}
        <aside className="side">
          <h4>Category / Department</h4>
          <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: 20, paddingRight: 8 }} className="cat-scroll">
            {DEFAULT_CATEGORIES.map(c => (
              <label
                key={c}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  padding: '4px 0',
                  cursor: 'pointer',
                  fontWeight: selectedCat === c ? 700 : 400,
                  color: selectedCat === c ? 'var(--link)' : 'inherit',
                }}
              >
                <input
                  type="radio"
                  name="cat"
                  checked={selectedCat === c}
                  onChange={() => { setSelectedCat(c); setCurrentPage(1); }}
                />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>
              </label>
            ))}
          </div>

          <h4>Access &amp; Pricing</h4>
          {[
            ['all', 'All PDF Titles'],
            ['free', '⚡ 100% Free Downloads'],
            ['paid', 'Paid eBooks'],
            ['affiliate', 'Partner Stores'],
          ].map(([val, lbl]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, padding: '4px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="type"
                checked={selectedType === val}
                onChange={() => { setSelectedType(val); setCurrentPage(1); }}
              />
              {lbl}
            </label>
          ))}

          <div style={{ marginTop: 24, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 4 }}>
              ⚡ High-Speed Pipeline
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Server-indexed queries across 300,000+ titles. Direct Google Drive delivery.
            </div>
          </div>
        </aside>

        {/* Results Stream */}
        <div>
          {/* Toolbar */}
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or keyword…"
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  minWidth: 240,
                  maxWidth: 400,
                  width: '100%',
                }}
              />
              <span className="res" id="resultCount" style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                <b>{totalCount.toLocaleString()}</b> title{totalCount !== 1 ? 's' : ''}
                {debouncedQ && <> matching <b>&ldquo;{debouncedQ}&rdquo;</b></>}
              </span>
            </div>

            <select
              value={selectedSort}
              onChange={e => { setSelectedSort(e.target.value); setCurrentPage(1); }}
              aria-label="Sort library catalog"
              style={{
                padding: '7px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 13.5,
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="downloads">Sort by: Most Downloaded</option>
              <option value="rating">Sort by: Highest Rated</option>
              <option value="title">Sort by: Title (A-Z)</option>
              <option value="pages">Sort by: Page Count</option>
              <option value="newest">Sort by: Newest Releases</option>
            </select>
          </div>

          {/* Book Cards Grid */}
          <div
            className="grid"
            onClick={handleAction}
            style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}
            dangerouslySetInnerHTML={{
              __html: books.length > 0
                ? books.map(p => cardHTML(p, null, false, storeState.wishlist)).join('')
                : `<div class="empty" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
                    <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">No books found matching your criteria</h3>
                    <p style="font-size: 14px; color: #64748b;">Try adjusting your keywords, language selector, or category filters.</p>
                  </div>`,
            }}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pager" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32 }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
              >
                &larr; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && p - arr[i - 1] > 1 && (
                      <span style={{ padding: '8px 4px', color: '#94a3b8' }}>…</span>
                    )}
                    <button
                      className={p === currentPage ? 'on' : ''}
                      onClick={() => handlePageChange(p)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: p === currentPage ? 'var(--ink)' : '#ffffff',
                        color: p === currentPage ? '#ffffff' : 'inherit',
                        fontWeight: p === currentPage ? 800 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
