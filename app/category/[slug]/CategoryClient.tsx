'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { FAQItem } from '@/components/JsonLd';
import { getBaseUrl } from '@/lib/url';

interface CategoryClientProps {
  books: Product[];
  categoryName: string;
  faqs: FAQItem[];
}

export default function CategoryClient({ books, categoryName, faqs }: CategoryClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'title' | 'pages'>('downloads');
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredBooks = useMemo(() => {
    let list = books;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
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
  }, [books, searchFilter, sortBy]);

  const handleShareCategory = async () => {
    const baseUrl = getBaseUrl();
    const url = typeof window !== 'undefined' ? window.location.href : baseUrl;
    const text = `Explore free PDF books in ${categoryName} on Bookshelf: ${url}`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${categoryName} — Free PDF Books`,
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
        toast('Link Copied! 🔗', 'Category collection link copied to clipboard');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      prompt('Copy category link:', url);
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
          padding: '14px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 280px' }}>
          <input
            type="text"
            placeholder={`Filter ${books.length} titles in this category...`}
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 340,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              background: '#f8fafc',
            }}
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
            >
              Clear
            </button>
          )}
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
            onClick={handleShareCategory}
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
            <span>{copied ? 'Copied' : 'Share Category'}</span>
          </button>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid" style={{ marginBottom: 48 }}>
          {filteredBooks.map(b => (
            <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
          ))}
        </div>
      ) : (
        <div className="empty" style={{ background: '#fff', borderRadius: 8, padding: 40, textAlign: 'center', marginBottom: 48 }}>
          <h3>No books matched your filter</h3>
          <p>Try clearing your filter or browsing our full free library catalog.</p>
        </div>
      )}

      {/* SEO FAQ Section */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '30px', border: '1px solid #e2e8f0', marginTop: 30 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
          Frequently Asked Questions About {categoryName}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
          Everything you need to know about downloading and reading free PDFs on Bookshelf.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: isOpen ? '#f8fafc' : '#fff',
                  transition: 'background 0.2s',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    textAlign: 'left',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f172a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: 'none',
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ fontSize: 18, color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
