'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { FAQItem } from '@/components/JsonLd';

interface CategoryClientProps {
  books: Product[];
  categoryName: string;
  faqs: FAQItem[];
}

export default function CategoryClient({ books, categoryName, faqs }: CategoryClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      {/* Book Grid */}
      <div className="grid" style={{ marginBottom: 48 }}>
        {books.map(b => (
          <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
        ))}
      </div>

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
