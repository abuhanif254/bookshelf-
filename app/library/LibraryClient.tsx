'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { P, Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { getClientBooks, saveClientBooks } from '@/lib/customBooks';

const PAGE_SIZE = 9;

interface FilterState {
  q: string;
  cats: Set<string>;
  types: Set<string>;
  pages: Set<string>;
  price: string;
  rate: number;
  sort: string;
  page: number;
  preset: string | null;
}

function getInitialState(searchParams: URLSearchParams): FilterState {
  const preset = searchParams.get('preset');
  const cat = searchParams.get('cat');
  const q = searchParams.get('q') || '';
  const state: FilterState = {
    q,
    cats: cat ? new Set([cat]) : new Set(),
    types: new Set(),
    pages: new Set(),
    price: 'any',
    rate: 0,
    sort: 'featured',
    page: 1,
    preset: preset,
  };
  if (preset === 'free') state.types.add('free');
  if (preset === 'partner') state.types.add('affiliate');
  if (preset === 'best') state.sort = 'reviews';
  return state;
}

export default function LibraryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state: storeState, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const [filter, setFilter] = useState<FilterState>(() => getInitialState(searchParams));
  const [allBooks, setAllBooks] = useState<Product[]>(P);

  useEffect(() => {
    const local = getClientBooks();
    if (local && local.length > 0) setAllBooks(local);

    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.books) && data.books.length > 0) {
          setAllBooks(data.books);
          saveClientBooks(data.books);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFilter(getInitialState(searchParams));
  }, [searchParams]);

  const filtered = useCallback(() => {
    const list = allBooks.filter(p => {
      if (filter.q && !(p.title + ' ' + p.author + ' ' + p.cat + ' ' + p.sub).toLowerCase().includes(filter.q.toLowerCase())) return false;
      if (filter.cats.size && !filter.cats.has(p.cat)) return false;
      if (filter.types.size && !filter.types.has(p.type)) return false;
      if (filter.pages.size) {
        const b = p.pages < 100 ? 's' : p.pages <= 250 ? 'm' : 'l';
        if (!filter.pages.has(b)) return false;
      }
      if (filter.price === 'free' && p.type !== 'free') return false;
      if (filter.price === 'u10' && !(p.type !== 'free' && p.price < 10)) return false;
      if (filter.price === '10-20' && !(p.price >= 10 && p.price <= 20)) return false;
      if (filter.price === '20p' && !(p.price > 20)) return false;
      if (filter.rate && p.rating < filter.rate) return false;
      if (filter.preset === 'deals' && !(p.list && p.price > 0)) return false;
      return true;
    });
    const sortFns: Record<string, (a: typeof P[0], b: typeof P[0]) => number> = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'rating': (a, b) => b.rating - a.rating,
      'reviews': (a, b) => b.reviews - a.reviews,
      'pages': (a, b) => b.pages - a.pages,
      'featured': (a, b) => b.reviews - a.reviews,
    };
    return [...list].sort(sortFns[filter.sort] || sortFns.featured);
  }, [filter]);

  const allFiltered = filtered();
  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  const currentPage = Math.min(filter.page, totalPages);
  const slice = allFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const cats = [...new Set(allBooks.map(p => p.cat))];

  const label = filter.preset === 'deals' ? "Today's Deals"
    : filter.preset === 'free' ? 'Free PDFs'
    : filter.preset === 'partner' ? 'Partner Store'
    : filter.preset === 'best' ? 'Best Sellers'
    : filter.preset === 'new' ? 'New Releases'
    : 'PDF Library';

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

  const updateFilter = (update: Partial<FilterState>) => setFilter(prev => ({ ...prev, ...update, page: 1 }));

  const toggleSet = (set: Set<string>, val: string, checked: boolean): Set<string> => {
    const next = new Set(set);
    if (checked) {
      next.add(val);
    } else {
      next.delete(val);
    }
    return next;
  };

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Home</Link> › <span>{label}{filter.q ? ` › "${filter.q}"` : ''}</span>
      </div>
      <div className="browse">
        {/* Sidebar */}
        <aside className="side">
          <h4>Department</h4>
          <div style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: 20, paddingRight: 8 }} className="cat-scroll">
            {cats.map(c => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={filter.cats.has(c)}
                  onChange={e => updateFilter({ cats: toggleSet(filter.cats, c, e.target.checked) })}
                />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={c}>{c}</span>
                <span className="cnt">{allBooks.filter(p => p.cat === c).length}</span>
              </label>
            ))}
          </div>

          <h4>Price</h4>
          {[['any', 'Any price'], ['free', 'Free'], ['u10', 'Under $10'], ['10-20', '$10 to $20'], ['20p', '$20 & above']].map(([v, l]) => (
            <label key={v}>
              <input type="radio" name="fprice" value={v} checked={filter.price === v} onChange={() => updateFilter({ price: v })} />
              {l}
            </label>
          ))}

          <h4>Type</h4>
          {[['free', 'Free PDFs'], ['paid', 'Paid PDFs'], ['affiliate', 'Partner products']].map(([v, l]) => (
            <label key={v}>
              <input type="checkbox" checked={filter.types.has(v)} onChange={e => updateFilter({ types: toggleSet(filter.types, v, e.target.checked) })} />
              {l}
            </label>
          ))}

          <h4>Customer Review</h4>
          <label><input type="radio" name="frate" value="0" checked={filter.rate === 0} onChange={() => updateFilter({ rate: 0 })} /> Any rating</label>
          <label>
            <input type="radio" name="frate" value="4.5" checked={filter.rate === 4.5} onChange={() => updateFilter({ rate: 4.5 })} />
            <span className="str"><span className="stars" style={{ '--s': '14px' } as React.CSSProperties}>★★★★★<i style={{ width: '90%' }}>★★★★★</i></span> 4.5 &amp; up</span>
          </label>
          <label>
            <input type="radio" name="frate" value="4" checked={filter.rate === 4} onChange={() => updateFilter({ rate: 4 })} />
            <span className="str"><span className="stars" style={{ '--s': '14px' } as React.CSSProperties}>★★★★★<i style={{ width: '80%' }}>★★★★★</i></span> 4.0 &amp; up</span>
          </label>

          <h4>Page Count</h4>
          {[['s', 'Under 100 pages'], ['m', '100 – 250 pages'], ['l', '250+ pages']].map(([v, l]) => (
            <label key={v}>
              <input type="checkbox" checked={filter.pages.has(v)} onChange={e => updateFilter({ pages: toggleSet(filter.pages, v, e.target.checked) })} />
              {l}
            </label>
          ))}
        </aside>

        {/* Results */}
        <div>
          <div className="toolbar">
            <span className="res" id="resultCount">
              <b>{allFiltered.length}</b> result{allFiltered.length !== 1 ? 's' : ''} in <b>{label}</b>
              {filter.q && <> for <b>&ldquo;{filter.q}&rdquo;</b></>}
            </span>
            <select
              value={filter.sort}
              onChange={e => updateFilter({ sort: e.target.value })}
              aria-label="Sort results"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
              <option value="reviews">Most Reviews</option>
              <option value="pages">Longest first</option>
            </select>
          </div>

          <div
            className="grid"
            onClick={handleAction}
            dangerouslySetInnerHTML={{
              __html: slice.length
                ? slice.map(p => cardHTML(p, null, false, storeState.wishlist)).join('')
                : `<div class="empty"><h3>No PDFs match those filters</h3><p>Try clearing a filter or two — or browse the free shelf.</p></div>`
            }}
          />

          {totalPages > 1 && (
            <div className="pager">
              <button disabled={currentPage === 1} onClick={() => { setFilter(prev => ({ ...prev, page: Math.max(1, prev.page - 1) })); window.scrollTo({ top: 200, behavior: 'smooth' }); }} style={{ padding: '0 12px' }}>Prev</button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, i, arr) => (
                  <span key={p} style={{ display: 'contents' }}>
                    {i > 0 && p - arr[i - 1] > 1 && <span style={{ padding: '8px', color: '#94a3b8' }}>...</span>}
                    <button
                      className={p === currentPage ? 'on' : ''}
                      onClick={() => { setFilter(prev => ({ ...prev, page: p })); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
                    >
                      {p}
                    </button>
                  </span>
                ))}
                
              <button disabled={currentPage === totalPages} onClick={() => { setFilter(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) })); window.scrollTo({ top: 200, behavior: 'smooth' }); }} style={{ padding: '0 12px' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
