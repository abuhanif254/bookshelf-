'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { coverHTML, stars } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { FAQItem } from '@/components/JsonLd';

interface CompareClientProps {
  bookA: Product;
  bookB: Product;
  faqs: FAQItem[];
}

export default function CompareClient({ bookA, bookB, faqs }: CompareClientProps) {
  const { downloadFree } = useStore();

  return (
    <div>
      {/* Side-by-Side Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Book A Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 140, margin: '0 auto 16px' }} dangerouslySetInnerHTML={{ __html: coverHTML(bookA, 'sm') }} />
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', margin: '0 0 4px' }}>
            <Link href={`/pdf/${bookA.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{bookA.title}</Link>
          </h2>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>by {bookA.author}</div>
          <div style={{ marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: stars(bookA.rating, 16) }} />
          <button
            onClick={() => downloadFree(bookA.id)}
            style={{ width: '100%', background: 'var(--amber)', color: '#0f172a', fontWeight: 800, fontSize: 14, padding: '12px', borderRadius: 999, border: '1px solid #d97706', cursor: 'pointer' }}
          >
            ⤓ Download &ldquo;{bookA.title}&rdquo; Free
          </button>
        </div>

        {/* Book B Card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 140, margin: '0 auto 16px' }} dangerouslySetInnerHTML={{ __html: coverHTML(bookB, 'sm') }} />
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', margin: '0 0 4px' }}>
            <Link href={`/pdf/${bookB.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{bookB.title}</Link>
          </h2>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>by {bookB.author}</div>
          <div style={{ marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: stars(bookB.rating, 16) }} />
          <button
            onClick={() => downloadFree(bookB.id)}
            style={{ width: '100%', background: 'var(--amber)', color: '#0f172a', fontWeight: 800, fontSize: 14, padding: '12px', borderRadius: 999, border: '1px solid #d97706', cursor: 'pointer' }}
          >
            ⤓ Download &ldquo;{bookB.title}&rdquo; Free
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table (For Google Featured Snippet) */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 36 }}>
        <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 900, fontSize: 16, color: 'var(--ink)' }}>
          📊 Direct Feature &amp; Spec Breakdown
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)', width: '25%' }}>Author</td>
              <td style={{ padding: '12px 18px', width: '37.5%', fontWeight: 700, color: 'var(--ink)' }}>{bookA.author}</td>
              <td style={{ padding: '12px 18px', width: '37.5%', fontWeight: 700, color: 'var(--ink)' }}>{bookB.author}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)' }}>Category</td>
              <td style={{ padding: '12px 18px' }}><span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>{bookA.cat}</span></td>
              <td style={{ padding: '12px 18px' }}><span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>{bookB.cat}</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)' }}>Page Count</td>
              <td style={{ padding: '12px 18px', fontWeight: 700 }}>{bookA.pages} Pages</td>
              <td style={{ padding: '12px 18px', fontWeight: 700 }}>{bookB.pages} Pages</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)' }}>Reader Rating</td>
              <td style={{ padding: '12px 18px', color: 'var(--amber)', fontWeight: 800 }}>★ {bookA.rating} / 5.0 ({bookA.reviews} ratings)</td>
              <td style={{ padding: '12px 18px', color: 'var(--amber)', fontWeight: 800 }}>★ {bookB.rating} / 5.0 ({bookB.reviews} ratings)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)' }}>Key Focus</td>
              <td style={{ padding: '12px 18px', color: '#334155' }}>{bookA.blurb}</td>
              <td style={{ padding: '12px 18px', color: '#334155' }}>{bookB.blurb}</td>
            </tr>
            <tr style={{ background: '#fafbfc' }}>
              <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--muted)' }}>Price &amp; License</td>
              <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--green)' }}>100% Free · DRM-Free</td>
              <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--green)' }}>100% Free · DRM-Free</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparison Verdict */}
      <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1.5px solid #cbd5e1', marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '0 0 8px' }}>
          🎯 Summary Recommendation: Which Should You Read?
        </h3>
        <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.6, margin: '0 0 10px' }}>
          • Choose <b>{bookA.title}</b> if your primary goal is <i>{bookA.cat.toLowerCase()}</i> and you want a {bookA.pages}-page systematic framework.
        </p>
        <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.6, margin: 0 }}>
          • Choose <b>{bookB.title}</b> if you are looking for <i>{bookB.cat.toLowerCase()}</i> with immediate actionable routines.
        </p>
      </div>

      {/* FAQs */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 14 }}>
          Comparison FAQs
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
