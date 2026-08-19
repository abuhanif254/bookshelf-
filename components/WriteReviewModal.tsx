'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/products';
import { coverHTML } from '@/lib/helpers';
import { BookReview } from '@/lib/db';

interface Props {
  book: Product;
  onClose: () => void;
  onReviewSubmitted: (newReview: BookReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star — Poor read / Not recommended',
  2: '2 Stars — Fair / Lacks actionable depth',
  3: '3 Stars — Good / Helpful basics',
  4: '4 Stars — Very Good / Highly practical',
  5: '5 Stars — Excellent / Masterpiece read',
};

export default function WriteReviewModal({ book, onClose, onReviewSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill saved reader name if exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('bookshelf_reviewer_name');
      if (savedName) setName(savedName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please add a headline for your review');
      return;
    }
    if (!body.trim() || body.trim().length < 10) {
      setError('Please write at least a few words explaining your rating (minimum 10 characters)');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (typeof window !== 'undefined' && name.trim()) {
        localStorage.setItem('bookshelf_reviewer_name', name.trim());
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          userName: name.trim() || 'Anonymous Reader',
          rating: rating,
          title: title.trim(),
          body: body.trim(),
          verified: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        onReviewSubmitted(data.review);
        onClose();
      } else {
        setError(data.message || 'Error submitting review');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div
      className="overlay open"
      style={{ zIndex: 450, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if ((e.target as HTMLElement).classList.contains('overlay')) onClose(); }}
    >
      <div
        className="modal"
        style={{
          maxWidth: 560,
          padding: 28,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          background: '#ffffff',
        }}
      >
        <button className="x" onClick={onClose} aria-label="Close modal">✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 18 }}>
          <div style={{ width: 50, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: coverHTML(book, 'sm') }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--amber)', background: '#fef3c7', padding: '2px 8px', borderRadius: 4 }}>
              Customer Review
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 2px', color: 'var(--ink)' }}>{book.title}</h3>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>by {book.author}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Selector */}
          <div style={{ marginBottom: 18, textAlign: 'center', background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              Overall Rating
            </label>
            <div style={{ display: 'inline-flex', gap: 8, fontSize: 32, cursor: 'pointer', userSelect: 'none' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  style={{
                    color: star <= activeRating ? '#f59e0b' : '#cbd5e1',
                    transition: 'transform 0.1s ease',
                    transform: star <= activeRating ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginTop: 4 }}>
              {RATING_LABELS[activeRating]}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: 6, fontSize: 12.5, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Reviewer Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Your Name (or Nickname)
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none' }}
            />
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Review Headline *
            </label>
            <input
              type="text"
              placeholder="e.g. Actionable, practical, and zero fluff"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none' }}
            />
          </div>

          {/* Review Body */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Detailed Review *
            </label>
            <textarea
              rows={4}
              placeholder="What did you like about this PDF? Which chapter was most valuable? How did it help your daily work?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, outline: 'none', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 800,
              padding: '13px',
              borderRadius: 999,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.2)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting Review…' : '⭐ Submit Customer Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
