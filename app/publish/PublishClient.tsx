'use client';

import React, { useState } from 'react';
import { coverHTML } from '@/lib/helpers';
import { Product } from '@/lib/products';
import { extractDriveId } from '@/lib/drive';

export default function PublishClient() {
  const [formData, setFormData] = useState({
    title: '',
    sub: '',
    author: '',
    authorEmail: '',
    cat: 'Productivity',
    pages: 80,
    driveUrl: '',
    blurb: '',
    desc: '',
    bg: '#0f2a43',
    ac: '#f59e0b',
    pat: 'p-rings',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.driveUrl) {
      setErrorMsg('Please fill in Title, Author, and your Google Drive Link');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Submission failed');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Connection error. Please try again.');
    }
  };

  const previewBook: Product = {
    id: 0,
    slug: 'preview',
    title: formData.title || 'Your Book Title',
    sub: formData.sub || 'Subtitle Hook',
    author: formData.author || 'Author Name',
    cat: formData.cat,
    type: 'free',
    price: 0,
    list: 14.99,
    rating: 5.0,
    reviews: 1,
    pages: formData.pages,
    badge: 'Creator Submission',
    bought: 'Instant download',
    bg: formData.bg,
    fg: '#ffffff',
    ac: formData.ac,
    pat: formData.pat,
    blurb: formData.blurb,
    feat: [],
    desc: formData.desc,
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', padding: 40, borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ecfdf5', color: 'var(--green)', fontSize: 32, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          🎉
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)', margin: '0 0 8px' }}>
          Your Book Was Submitted for Review!
        </h2>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
          Thank you for sharing &ldquo;{formData.title}&rdquo; with the Bookshelf community. Our editorial team will review your Google Drive file and publish it to the catalog and Google sitemap within 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{ background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
        >
          Submit Another Title →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 940, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
        {/* Left Inputs */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: 'var(--ink)' }}>
            1. Book Details
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Architecture in TypeScript"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Subtitle / Hook</label>
            <input
              type="text"
              placeholder="e.g. Patterns for production-ready backend systems"
              value={formData.sub}
              onChange={e => setFormData({ ...formData, sub: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Author Name *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Author Email *</label>
              <input
                type="email"
                required
                value={formData.authorEmail}
                onChange={e => setFormData({ ...formData, authorEmail: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Category</label>
              <select
                value={formData.cat}
                onChange={e => setFormData({ ...formData, cat: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                {['Productivity', 'Programming', 'Business', 'Design', 'Marketing', 'Self-Help', 'Technology', 'Finance', 'Health'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Page Count</label>
              <input
                type="number"
                value={formData.pages}
                onChange={e => setFormData({ ...formData, pages: Number(e.target.value) })}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Google Drive Link Box */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
              🔗 Google Drive PDF Share Link *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/XYZ123/view?usp=sharing"
              value={formData.driveUrl}
              onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #86efac', fontSize: 13, background: '#fff' }}
            />
            <span style={{ fontSize: 11, color: '#15803d', display: 'block', marginTop: 4 }}>
              {formData.driveUrl && extractDriveId(formData.driveUrl) ? `✓ Valid File ID: ${extractDriveId(formData.driveUrl)}` : '⚠️ Please ensure link is set to "Anyone with the link can view"'}
            </span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Summary Blurb</label>
            <textarea
              rows={3}
              placeholder="A brief 2-3 sentence overview of what readers will learn..."
              value={formData.blurb}
              onChange={e => setFormData({ ...formData, blurb: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>
        </div>

        {/* Right Cover Preview */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: 'var(--ink)' }}>
            2. Cover Styling Studio
          </h3>

          <div style={{ maxWidth: 170, margin: '0 auto 18px' }} dangerouslySetInnerHTML={{ __html: coverHTML(previewBook) }} />

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Geometric Pattern</label>
              <select
                value={formData.pat}
                onChange={e => setFormData({ ...formData, pat: e.target.value })}
                style={{ width: '100%', padding: '6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
              >
                <option value="p-rings">Radial Rings</option>
                <option value="p-grid">Geometric Grid</option>
                <option value="p-dots">Matrix Dots</option>
                <option value="p-lines">Diagonal Lines</option>
                <option value="p-blocks">Modern Blocks</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Background</label>
                <input
                  type="color"
                  value={formData.bg}
                  onChange={e => setFormData({ ...formData, bg: e.target.value })}
                  style={{ width: '100%', height: 32, borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Accent Pill</label>
                <input
                  type="color"
                  value={formData.ac}
                  onChange={e => setFormData({ ...formData, ac: e.target.value })}
                  style={{ width: '100%', height: 32, borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700, marginTop: 18 }}>
          {errorMsg}
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20, marginTop: 20, textAlign: 'right' }}>
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: 'var(--amber)',
            color: '#0f172a',
            fontSize: 15,
            fontWeight: 800,
            padding: '12px 28px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {status === 'loading' ? 'Submitting…' : '🚀 Submit PDF Book for Review'}
        </button>
      </div>
    </form>
  );
}
