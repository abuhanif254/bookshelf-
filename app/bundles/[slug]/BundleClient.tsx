'use client';

import React from 'react';
import Link from 'next/link';
import { Bundle } from '@/lib/bundles';
import { Product } from '@/lib/products';
import { coverHTML, stars } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { useCurrency } from '@/lib/currency';

export default function BundleClient({ bundle, books }: { bundle: Bundle; books: Product[] }) {
  const { downloadFree, toast } = useStore();
  const { formatPrice } = useCurrency();

  const totalPages = books.reduce((acc, b) => acc + b.pages, 0);

  const handleDownloadAll = () => {
    toast('Unlocking 3-Book Bundle! 🎉', 'Starting downloads sequentially');
    downloadFree(books[0].id);
  };

  return (
    <div className="wrap" style={{ padding: '20px 20px 80px' }}>
      {/* Breadcrumb */}
      <div className="crumb">
        <Link href="/">Home</Link> › <span>Bundles</span> › <span style={{ color: 'var(--ink)' }}>{bundle.title}</span>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: bundle.bg,
          color: '#ffffff',
          borderRadius: 16,
          padding: '40px 32px',
          margin: '20px 0 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          alignItems: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 12px', borderRadius: 20 }}>
            {bundle.badge}
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: '#ffffff', margin: '14px 0 8px', lineHeight: 1.2 }}>
            {bundle.title}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 20px' }}>
            {bundle.sub}
          </p>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Includes</span>
              <b style={{ fontSize: 15 }}>{books.length} Complete Books</b>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Total Length</span>
              <b style={{ fontSize: 15 }}>{totalPages} Pages PDF</b>
            </div>
          </div>

          <button
            onClick={handleDownloadAll}
            style={{
              background: 'var(--amber)',
              color: '#0f172a',
              fontSize: 16,
              fontWeight: 900,
              padding: '14px 32px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
            }}
          >
            ⤓ Download Complete 3-Book Bundle (Free)
          </button>
        </div>

        {/* Stacked 3D Covers Visual */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 280 }}>
          {books.map((b, i) => (
            <div
              key={b.id}
              style={{
                width: 140,
                position: 'absolute',
                left: `calc(50% - 70px + ${(i - 1) * 60}px)`,
                transform: `rotate(${(i - 1) * 8}deg) scale(${i === 1 ? 1.05 : 0.95})`,
                zIndex: i === 1 ? 3 : 1,
                boxShadow: '0 20px 35px rgba(0,0,0,0.5)',
                borderRadius: 8,
                overflow: 'hidden',
                transition: 'transform 0.3s ease',
              }}
              dangerouslySetInnerHTML={{ __html: coverHTML(b, 'md') }}
            />
          ))}
        </div>
      </div>

      {/* Books List Inside This Bundle */}
      <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 20 }}>
        📚 Included Titles in this Stack ({books.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {books.map((b, idx) => (
          <div
            key={b.id}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>
              {idx + 1}
            </span>
            <div style={{ width: 50, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: coverHTML(b, 'sm') }} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link href={`/pdf/${b.slug}`} style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)', textDecoration: 'none' }}>
                  {b.title}
                </Link>
                <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  {b.cat}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                by {b.author} · {b.pages} pages · {b.badge}
              </div>
              <p style={{ fontSize: 13.5, color: '#334155', margin: '6px 0 0', lineHeight: 1.4 }}>
                {b.blurb}
              </p>
            </div>
            <Link
              href={`/pdf/${b.slug}`}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 6,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Inspect Title →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
