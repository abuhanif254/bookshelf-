'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/products';
import { getDirectDownloadUrl } from '@/lib/drive';

interface SendToKindleModalProps {
  book: Product;
  onClose: () => void;
}

export default function SendToKindleModal({ book, onClose }: SendToKindleModalProps) {
  const [kindleEmail, setKindleEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const directDownload = getDirectDownloadUrl(book.driveUrl || '');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 650,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 500,
          width: '100%',
          padding: 28,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef3c7', color: '#d97706', fontSize: 24, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            📱
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', margin: '0 0 4px' }}>
            Send to Amazon Kindle
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Read &ldquo;{book.title}&rdquo; wirelessly on your Kindle Paperwhite, Oasis, or Kindle App.
          </p>
        </div>

        {step === 1 ? (
          <div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 18 }}>
              <b style={{ fontSize: 13, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>
                ⚡ How it works in 2 quick steps:
              </b>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
                <li>Download your DRM-free PDF master file below.</li>
                <li>Email the file as an attachment to your personal <code>@kindle.com</code> address.</li>
              </ol>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Your Kindle Email (Optional)</label>
              <input
                type="email"
                placeholder="yourname@kindle.com"
                value={kindleEmail}
                onChange={e => setKindleEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href={directDownload}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--amber)',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: 14,
                  padding: '12px',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                ⤓ 1. Download Kindle-Optimized PDF
              </a>

              {kindleEmail && (
                <a
                  href={`mailto:${kindleEmail}?subject=${encodeURIComponent(book.title)}&body=${encodeURIComponent(`Attached is your PDF copy of ${book.title} by ${book.author} from Bookshelf.`)}`}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '10px',
                    borderRadius: 8,
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  ✉️ 2. Open Email Client to Send
                </a>
              )}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 18, borderTop: '1px solid #f1f5f9', paddingTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          💡 Tip: Make sure your email is whitelisted in Amazon Manage Your Content and Devices.
        </div>
      </div>
    </div>
  );
}
