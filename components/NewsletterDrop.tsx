'use client';

import React, { useState } from 'react';

export default function NewsletterDrop() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed');
      }
    } catch {
      setStatus('error');
      setMessage('Connection failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: 16,
        padding: '36px 30px',
        margin: '40px 0',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
      }}
    >
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 20, marginBottom: 10 }}>
          ⚡ FREE PDF FRIDAYS VIP CLUB
        </div>
        <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Never miss a free PDF drop.
        </h2>
        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
          Join 42,000+ engineers, designers, and founders who get 10 freshly unlocked PDF books and cheat sheets delivered to their inbox every Friday. Zero spam.
        </p>
      </div>

      <div>
        {status === 'success' ? (
          <div style={{ background: '#065f46', padding: '16px 20px', borderRadius: 10, border: '1px solid #059669', color: '#ffffff' }}>
            <b style={{ fontSize: 15 }}>🎉 Welcome to the VIP List!</b>
            <p style={{ fontSize: 13, margin: '4px 0 0', color: '#a7f3d0' }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                placeholder="Enter your email address…"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 220,
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #475569',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  background: 'var(--amber)',
                  color: '#0f172a',
                  fontWeight: 900,
                  fontSize: 14,
                  padding: '12px 22px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'loading' ? 'Joining…' : 'Get Free PDFs ↗'}
              </button>
            </div>
            {status === 'error' && (
              <div style={{ color: '#f87171', fontSize: 12, marginTop: 8, fontWeight: 600 }}>{message}</div>
            )}
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              🔒 100% free · Unsubscribe anytime with 1-click.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
