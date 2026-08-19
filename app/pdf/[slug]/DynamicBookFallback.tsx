'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, P } from '@/lib/products';
import { getClientBooks } from '@/lib/customBooks';
import ProductClient from './ProductClient';

function normalizeSlug(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default function DynamicBookFallback({ slug }: { slug: string }) {
  const [book, setBook] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      const list = getClientBooks();
      return list.find(b => b.slug === slug || normalizeSlug(b.title) === slug) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(!book);

  useEffect(() => {
    // Check client storage first
    const list = getClientBooks();
    const found = list.find(b => b.slug === slug || normalizeSlug(b.title) === slug);
    if (found) {
      setBook(found);
      setLoading(false);
      return;
    }

    // Try fetching from API
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.books)) {
          const apiFound = data.books.find((b: Product) => b.slug === slug || normalizeSlug(b.title) === slug);
          if (apiFound) {
            setBook(apiFound);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (book) {
    const bookFaqs = [
      {
        question: `How can I download "${book.title}" in PDF format?`,
        answer: `Click the "Download Free PDF" button above. After a quick 8-second sponsor message, your high-speed Google Drive direct download link will activate immediately.`,
      },
      {
        question: `Is "${book.title}" by ${book.author} completely free?`,
        answer: `Yes! "${book.title}" is 100% free to download on Bookshelf with no subscription fees, registration, or credit card required.`,
      },
      {
        question: `Can I open this PDF on mobile, iPad, and Kindle?`,
        answer: `Yes. This ${book.pages}-page edition is formatted as a standard, high-resolution PDF with searchable text, compatible with all PDF readers, iPads, Apple Books, and Kindle devices.`,
      },
    ];
    return <ProductClient p={book} faqs={bookFaqs} />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
        <p style={{ color: '#64748b', fontSize: 15, fontWeight: 600 }}>Loading book details…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)', marginBottom: 10 }}>Book Not Found</h1>
      <p style={{ fontSize: 15, color: '#64748b', maxWidth: 460, marginBottom: 24, lineHeight: 1.6 }}>
        We could not find the requested PDF book in our catalog. It may have been renamed or moved.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/library" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
          Browse All PDF Books →
        </Link>
        <Link href="/" style={{ background: '#f1f5f9', color: '#475569', fontWeight: 700, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
          Return Home
        </Link>
      </div>
    </div>
  );
}
