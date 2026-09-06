'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🌐' },
  { code: 'bn', label: 'বাংলা (Bangla)', flag: '🇧🇩' },
  { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو (Urdu)', flag: '🇵🇰' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
];

const DISMISS_COOLDOWN_DAYS = 14;

export default function FreePdfFridaysModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Listen to custom trigger events from anywhere in the app (e.g., post-download)
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ force?: boolean }>;
      const isForce = customEvent.detail?.force;

      if (!isForce) {
        // Respect dismissal cooldown unless forced
        if (typeof window !== 'undefined') {
          const dismissedAt = localStorage.getItem('bookshelf_fridays_dismissed');
          if (dismissedAt) {
            const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
            if (daysSince < DISMISS_COOLDOWN_DAYS) return;
          }
          if (localStorage.getItem('bookshelf_subscribed') === 'true') return;
        }
      }

      setIsOpen(true);
    };

    window.addEventListener('open-fridays-modal', handleOpenEvent);
    return () => window.removeEventListener('open-fridays-modal', handleOpenEvent);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookshelf_fridays_dismissed', Date.now().toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bookshelf_subscribed', 'true');
        }
      } else {
        setErrorMsg(data.message || 'Subscription failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="overlay open"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 540,
          background: '#ffffff',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          color: '#0f172a',
          textAlign: 'left',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#e2e8f0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#f1f5f9')}
        >
          ✕
        </button>

        {!isSuccess ? (
          <>
            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid #a7f3d0',
                }}
              >
                ⚡ Free PDF Fridays VIP Club
              </span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                48,000+ Readers
              </span>
            </div>

            {/* Title & Pitch */}
            <h3
              style={{
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1.25,
                margin: '0 0 8px',
                color: '#0f172a',
              }}
            >
              Get 5 Free Hand-Picked PDFs in Your Inbox Every Friday 📬
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              Every Friday morning, our editors drop 5 curated DRM-free books, developer cheat sheets, and founder roadmaps. 100% free, forever.
            </p>

            {/* Instant Bonus Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 24 }}>🎁</span>
              <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.4 }}>
                <strong style={{ color: '#92400e', display: 'block' }}>
                  Instant Subscription Bonus:
                </strong>
                Download the <strong>2026 Master PDF Starter Kit</strong> (Cheat Sheets, High-Impact Workflows &amp; Productivity Blueprints) immediately upon subscribing!
              </div>
            </div>

            {/* Language Preferences */}
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}
              >
                Preferred Book Language:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: language === lang.code ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                      background: language === lang.code ? '#0f172a' : '#f8fafc',
                      color: language === lang.code ? '#ffffff' : '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your best email address…"
                  required
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#059669')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {errorMsg && (
                <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                  transition: 'transform 0.1s ease',
                }}
              >
                {isLoading ? 'Securing Your VIP Spot…' : 'Claim Free Friday PDFs & Starter Kit 🚀'}
              </button>
            </form>

            <div
              style={{
                marginTop: 14,
                fontSize: 11.5,
                color: '#64748b',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              🔒 100% Free · No spam ever · One-click unsubscribe anytime in footer.
            </div>
          </>
        ) : (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '12px 6px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: '#ecfdf5',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                marginBottom: 16,
              }}
            >
              🎉
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
              You&apos;re on the VIP List!
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              Every Friday morning, 5 curated PDF books in your preferred language will land directly in your inbox.
            </p>

            {/* Starter Kit Download Button */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: 18,
                marginBottom: 16,
              }}
            >
              <b style={{ display: 'block', fontSize: 15, color: '#0f172a', marginBottom: 6 }}>
                🎁 Claim Your Instant Bonus Kit:
              </b>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                The 2026 Master PDF Starter Kit is unlocked and ready for you:
              </p>
              <Link
                href="/bundles/fullstack-developer-kit"
                onClick={handleClose}
                style={{
                  display: 'inline-block',
                  width: '100%',
                  background: '#0f172a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              >
                ⤓ Access 2026 Master PDF Starter Kit ↗
              </Link>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Continue exploring library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
