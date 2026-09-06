'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { FAQItem } from '@/components/JsonLd';
import { LanguageConfig } from '@/lib/languages';

interface LanguageClientProps {
  initialBooks: Product[];
  totalCount: number;
  allCategories?: string[];
  language: LanguageConfig;
  faqs: FAQItem[];
}

export default function LanguageClient({
  initialBooks,
  totalCount,
  allCategories = [],
  language,
  faqs,
}: LanguageClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'newest'>('downloads');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Extract unique categories available in this language collection
  const categories = useMemo(() => {
    const cats = new Set<string>(allCategories.filter(Boolean));
    initialBooks.forEach(b => {
      if (b.cat) cats.add(b.cat);
    });
    return ['All', ...Array.from(cats)];
  }, [initialBooks, allCategories]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let list = [...initialBooks];

    if (selectedCat !== 'All') {
      list = list.filter(b => b.cat === selectedCat);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.cat?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      return 0;
    });

    return list;
  }, [initialBooks, selectedCat, search, sortBy]);

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
    <div onClick={handleAction} dir={language.isRtl ? 'rtl' : 'ltr'}>
      {/* Search and Filter Controls */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <input
            type="text"
            placeholder={`Search ${language.name} titles, authors, genres...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 14,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: language.isRtl ? 'auto' : 10,
                left: language.isRtl ? 10 : 'auto',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            <option value="downloads">Most Popular ⬇</option>
            <option value="rating">Top Rated ★</option>
            <option value="newest">Newest Titles</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, marginBottom: 20 }}>
          {categories.map(cat => {
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  background: isSelected ? '#0f172a' : '#fff',
                  color: isSelected ? '#fff' : '#334155',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Showing Count */}
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span>
          Showing <b>{filteredBooks.length}</b> {totalCount > initialBooks.length ? `of ${totalCount.toLocaleString()}` : ''} {language.name} PDF books
        </span>
        {totalCount > initialBooks.length && (
          <Link
            href={`/library?q=${encodeURIComponent(language.name)}`}
            style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--link)', textDecoration: 'none' }}
          >
            Search all {totalCount.toLocaleString()} {language.name} books in Catalog →
          </Link>
        )}
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          marginBottom: 40,
        }}>
          <span style={{ fontSize: 36 }}>📚</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '12px 0 6px' }}>No books found</h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
            Try adjusting your search query or switching to another category.
          </p>
          <Link
            href={`/library?q=${encodeURIComponent(search || language.name)}`}
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: 8,
              background: '#0f172a',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Search Complete Catalog →
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ marginBottom: 48 }}>
          {filteredBooks.map(b => (
            <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
          ))}
        </div>
      )}

      {/* SEO Localized FAQ Section */}
      {faqs && faqs.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '30px',
          border: '1px solid #e2e8f0',
          marginTop: 30,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
            Frequently Asked Questions — {language.nativeName} ({language.name})
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Everything you need to know about downloading and reading free {language.name} PDFs on Bookshelf.
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
                      textAlign: language.isRtl ? 'right' : 'left',
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
      )}
    </div>
  );
}