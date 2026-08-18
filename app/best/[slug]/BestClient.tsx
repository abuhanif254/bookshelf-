'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { coverHTML, stars } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { FAQItem } from '@/components/JsonLd';

interface BestClientProps {
  books: Product[];
  verdict: string;
  faqs: FAQItem[];
}

export default function BestClient({ books, verdict, faqs }: BestClientProps) {
  const { downloadFree, addToCart, toast } = useStore();
  const router = useRouter();

  return (
    <div>
      {/* Quick Navigation Anchor Bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 28 }}>
        <b style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
          Quick Jump:
        </b>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          {books.map((b, idx) => (
            <a
              key={b.id}
              href={`#book-${b.id}`}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ink)',
                background: '#f1f5f9',
                padding: '4px 12px',
                borderRadius: 20,
                textDecoration: 'none',
              }}
            >
              #{idx + 1} {b.title}
            </a>
          ))}
        </div>
      </div>

      {/* Ranked Books Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
        {books.map((b, idx) => (
          <div
            key={b.id}
            id={`book-${b.id}`}
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: '130px 1fr auto',
              gap: 24,
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
            }}
          >
            {/* Rank Badge + Cover */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: idx === 0 ? 'var(--amber)' : '#0f172a',
                  color: idx === 0 ? '#0f172a' : '#fff',
                  fontWeight: 900,
                  fontSize: 14,
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                #{idx + 1}
              </div>
              <div dangerouslySetInnerHTML={{ __html: coverHTML(b, 'sm') }} />
            </div>

            {/* Book Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: '#475569' }}>
                  {b.cat}
                </span>
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
                  ⚡ {b.pages} pages PDF
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', margin: '0 0 4px' }}>
                <Link href={`/pdf/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {b.title}
                </Link>
              </h2>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                by <b>{b.author}</b> · <span dangerouslySetInnerHTML={{ __html: stars(b.rating, 14) }} /> ({b.reviews} reviews)
              </div>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '0 0 10px' }}>
                {b.blurb}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {b.feat.slice(0, 2).map((f, i) => (
                  <span key={i} style={{ fontSize: 12, background: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Box */}
            <div style={{ minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: b.type === 'free' ? 'var(--green)' : 'var(--ink)' }}>
                {b.type === 'free' ? '100% FREE' : `$${b.price.toFixed(2)}`}
              </div>
              {b.type === 'free' ? (
                <button
                  onClick={() => downloadFree(b.id)}
                  style={{
                    background: 'var(--amber)',
                    color: '#0f172a',
                    fontSize: 13,
                    fontWeight: 800,
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: '1px solid #d97706',
                    cursor: 'pointer',
                  }}
                >
                  ⤓ Download PDF
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/pdf/${b.slug}`)}
                  style={{
                    background: 'var(--ink)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 800,
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View Details →
                </button>
              )}
              <Link href={`/pdf/${b.slug}`} style={{ fontSize: 12, color: 'var(--link)', fontWeight: 600 }}>
                Read Full Review ↗
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Editorial Verdict Callout */}
      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1.5px solid #cbd5e1', marginBottom: 36 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '0 0 6px' }}>
          💡 Editorial Verdict &amp; Recommendation
        </h3>
        <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.6, margin: 0 }}>
          {verdict}
        </p>
      </div>

      {/* FAQs */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 14 }}>
          Frequently Asked Questions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px' }}>
              <b style={{ fontSize: 14, color: '#0f172a' }}>{faq.question}</b>
              <p style={{ fontSize: 13.5, color: '#475569', margin: '4px 0 0', lineHeight: 1.5 }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
