'use client';

import { useState, useEffect, useMemo } from 'react';
import { getClientBooks } from '@/lib/customBooks';
import { coverHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LibraryItem } from '@/lib/store';
import { Product } from '@/lib/products';
import { usePdfReader } from '@/components/PdfReaderWrapper';
import Link from 'next/link';

export default function MyLibraryPage() {
  const { state, downloadFree } = useStore();
  const { openReader } = usePdfReader();
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'paid' | 'free'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchedBooks, setFetchedBooks] = useState<Record<number, Product>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  // Filter items by active tab
  const list: LibraryItem[] = useMemo(() => {
    return state.library.filter(l => tab === 'all' || l.kind === tab);
  }, [state.library, tab]);

  // Identify any library books that aren't in local client storage and fetch from server
  useEffect(() => {
    const localBooks = getClientBooks();
    const missingIds = state.library
      .map(l => l.id)
      .filter(id => !localBooks.some(b => b.id === id) && !fetchedBooks[id] && !loadingIds.has(id));

    if (missingIds.length === 0) return;

    setLoadingIds(prev => new Set([...prev, ...missingIds]));

    missingIds.forEach(id => {
      fetch(`/api/books/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.book) {
            setFetchedBooks(prev => ({ ...prev, [id]: data.book }));
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoadingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
    });
  }, [state.library, fetchedBooks, loadingIds]);

  // Helper to find resolved book
  const getBook = (id: number): Product | undefined => {
    return fetchedBooks[id] || getClientBooks().find(b => b.id === id);
  };

  // Filter list by user search term
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(l => {
      const book = getBook(l.id);
      if (!book) return false;
      return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
    });
  }, [list, searchQuery, fetchedBooks]);

  // Calculate shelf telemetry
  const totalPagesSaved = list.reduce((sum, l) => {
    const b = getBook(l.id);
    return sum + (b?.pages || 80);
  }, 0);

  return (
    <>
      <div className="libhead">
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h1>My Library</h1>
              <p>Every PDF you&apos;ve unlocked, downloaded, or purchased — read or re-download anytime, forever.</p>
            </div>
            {list.length > 0 && (
              <div style={{ display: 'flex', gap: 14, background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>{list.length}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Books Saved</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--amber)' }}>{totalPagesSaved.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Total Pages</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
            <div className="libtabs">
              {(['all', 'paid', 'free'] as const).map(t => (
                <button
                  key={t}
                  className={tab === t ? 'on' : ''}
                  onClick={() => setTab(t)}
                >
                  {t === 'all' ? 'All items' : t === 'paid' ? 'Purchased' : 'Free downloads'}
                </button>
              ))}
            </div>

            {list.length > 0 && (
              <div style={{ minWidth: 260 }}>
                <input
                  type="text"
                  placeholder="Filter saved books..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 60 }}>
        {filteredList.length ? (
          filteredList.map(l => {
            const p = getBook(l.id);

            // If still fetching book metadata from API
            if (!p) {
              return (
                <div key={l.id} className="librow" style={{ opacity: 0.7 }}>
                  <div style={{ width: 55, height: 80, background: '#e2e8f0', borderRadius: 4 }} />
                  <div>
                    <h3 style={{ color: '#64748b' }}>Loading book #{l.id}…</h3>
                    <div className="m">Added {l.date}</div>
                  </div>
                  <span className={`kind ${l.kind}`}>
                    {l.kind === 'free' ? 'FREE DOWNLOAD' : 'PURCHASED'}
                  </span>
                  <button className="dl-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    ⏳ Loading…
                  </button>
                </div>
              );
            }

            return (
              <div key={l.id} className="librow">
                <div
                  dangerouslySetInnerHTML={{ __html: coverHTML(p, 'sm') }}
                  onClick={() => openReader(p)}
                  style={{ cursor: 'pointer' }}
                  title="Click to read in browser"
                />
                <div>
                  <h3>
                    <a
                      style={{ color: '#0f1111', cursor: 'pointer' }}
                      onClick={() => router.push(`/pdf/${p.slug}`)}
                    >
                      {p.title}
                    </a>
                  </h3>
                  <div className="m">
                    {p.author} · {p.pages} pages · {(p.pages * 0.09).toFixed(1)} MB · Added {l.date}
                  </div>
                </div>

                <span className={`kind ${l.kind}`}>
                  {l.kind === 'free' ? 'FREE DOWNLOAD' : 'PURCHASED'}
                </span>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => openReader(p)}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Open In-Browser PDF Reader"
                  >
                    <span>📖</span> Read Online
                  </button>
                  <button className="dl-btn" onClick={() => downloadFree(p.id)}>
                    ⤓ Download PDF
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty" style={{ background: '#fff', borderRadius: 10, padding: '50px 20px', textAlign: 'center', border: '1px solid #e2e8f0', margin: '20px 0' }}>
            <span style={{ fontSize: 42, display: 'block', marginBottom: 12 }}>📚</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
              {searchQuery ? 'No matching books found' : 'Your personal shelf is empty'}
            </h3>
            <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '8px auto 20px', fontSize: 14 }}>
              {searchQuery
                ? `No books matching "${searchQuery}". Clear your search or browse our catalog.`
                : 'Download or unlock any free PDF across 300,000+ titles and it will remain in your personal reading shelf forever.'}
            </p>
            <Link
              href="/library?preset=free"
              style={{
                display: 'inline-block',
                background: 'var(--amber)',
                color: '#0f172a',
                padding: '12px 24px',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Browse 300,000+ Free PDF Books →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
