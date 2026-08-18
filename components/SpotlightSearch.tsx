'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { coverHTML } from '@/lib/helpers';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load books
  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => { if (data.success) setBooks(data.books); })
      .catch(() => {});
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? books.filter(b => (b.title + ' ' + b.author + ' ' + b.cat + ' ' + b.sub + ' ' + b.blurb).toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : books.slice(0, 5);

  const handleSelectBook = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/pdf/${slug}`);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelectBook(filtered[selectedIndex].slug);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 600,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 620,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all books, authors, cheat sheets, or topics… (ESC to close)"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDownInInput}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontWeight: 600,
              color: '#0f172a',
            }}
          />
          <span style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, color: '#64748b', fontWeight: 700 }}>
            ESC
          </span>
        </div>

        {/* Quick Category Jump Pills */}
        {!query && (
          <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8' }}>Topics:</span>
            {['Productivity', 'Programming', 'Business', 'Design', 'Marketing', 'Finance'].map(cat => (
              <button
                key={cat}
                onClick={() => { setIsOpen(false); router.push(`/category/${cat.toLowerCase()}`); }}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '3px 10px',
                  borderRadius: 20,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
              No PDF books matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((b, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelectBook(b.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 14px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected ? '#f1f5f9' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ width: 34, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: coverHTML(b, 'sm') }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b style={{ color: '#0f172a', fontSize: 14 }}>{b.title}</b>
                      <span style={{ fontSize: 10, background: b.type === 'free' ? '#ecfdf5' : '#fef3c7', color: b.type === 'free' ? '#065f46' : '#92400e', fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>
                        {b.type === 'free' ? 'FREE' : `$${b.price.toFixed(2)}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      by {b.author} · <span style={{ color: '#0284c7' }}>{b.cat}</span> · {b.pages} pages
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--link)', fontWeight: 700 }}>
                    Jump ↵
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div style={{ padding: '10px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
          <span>Navigate with <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>↑</kbd> <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>↓</kbd></span>
          <span>Press <kbd style={{ background: '#e2e8f0', padding: '1px 4px', borderRadius: 3 }}>Enter</kbd> to open</span>
        </div>
      </div>
    </div>
  );
}
