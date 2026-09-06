'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/products';
import { getBaseUrl } from '@/lib/url';

interface SocialShareBarProps {
  book: Product;
  className?: string;
}

export default function SocialShareBar({ book, className = '' }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [citationFormat, setCitationFormat] = useState<'apa' | 'mla' | 'bibtex'>('apa');
  const [citationCopied, setCitationCopied] = useState(false);

  // Formulate absolute URL and share text
  const baseUrl = getBaseUrl();
  const pageUrl = typeof window !== 'undefined' && window.location?.href
    ? window.location.href
    : `${baseUrl}/pdf/${book.slug}`;

  const shareText = `📚 Read and download "${book.title}" by ${book.author} for free in PDF on Bookshelf:`;

  // Academic Citation generators
  const currentYear = new Date().getFullYear();
  const apaCitation = `${book.author}. (${currentYear}). ${book.title}. Bookshelf Open Digital Library. Retrieved from ${pageUrl}`;
  const mlaCitation = `${book.author}. ${book.title}. Bookshelf Open Digital Library, ${currentYear}, ${pageUrl}.`;
  const bibtexCitation = `@book{${book.slug.replace(/[^a-zA-Z0-9]/g, '_')},
  author    = {${book.author}},
  title     = {${book.title}},
  year      = {${currentYear}},
  publisher = {Bookshelf Open Digital Library},
  url       = {${pageUrl}}
}`;

  const getActiveCitationText = () => {
    if (citationFormat === 'mla') return mlaCitation;
    if (citationFormat === 'bibtex') return bibtexCitation;
    return apaCitation;
  };

  const handleCopyCitation = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(getActiveCitationText());
        setCitationCopied(true);
        setTimeout(() => setCitationCopied(false), 2500);
      }
    } catch {
      prompt('Copy citation:', getActiveCitationText());
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback prompt if clipboard API is restricted
      prompt('Copy this link:', pageUrl);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${book.title} — Free PDF on Bookshelf`,
          text: shareText,
          url: pageUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }
    handleCopyLink();
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;

  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        margin: '20px 0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📢</span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
            Share with classmates &amp; study groups
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setShowCitation(!showCitation)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#2563eb',
              background: '#eff6ff',
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #bfdbfe',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>📜</span>
            <span>{showCitation ? 'Hide Citation' : 'Cite (APA/MLA)'}</span>
          </button>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#059669',
              background: '#ecfdf5',
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #a7f3d0',
            }}
          >
            100% Free Sharing
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 8,
        }}
      >
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#25D366',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
          title="Share via WhatsApp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.02 2.57.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
          </svg>
          <span>WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#229ED9',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
          title="Share on Telegram"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span>Telegram</span>
        </a>

        {/* X / Twitter */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#0f172a',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
          title="Share on X"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>Post</span>
        </a>

        {/* Facebook */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: '#1877F2',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.15s ease',
          }}
          title="Share on Facebook"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </a>

        {/* Copy Link / Mobile Share Sheet */}
        <button
          onClick={handleNativeShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: copied ? '#059669' : '#f1f5f9',
            color: copied ? '#ffffff' : '#334155',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
            border: copied ? '1px solid #059669' : '1px solid #cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Copy Link to Clipboard"
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Expandable Citation Drawer */}
      {showCitation && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
              Academic &amp; Research Citation Format:
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['apa', 'mla', 'bibtex'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: citationFormat === fmt ? '#3b82f6' : '#cbd5e1',
                    background: citationFormat === fmt ? '#eff6ff' : '#ffffff',
                    color: citationFormat === fmt ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              fontFamily: citationFormat === 'bibtex' ? 'monospace' : 'serif',
              whiteSpace: citationFormat === 'bibtex' ? 'pre-wrap' : 'normal',
              color: '#1e293b',
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            {getActiveCitationText()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCopyCitation}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: citationCopied ? '#ffffff' : '#1e293b',
                background: citationCopied ? '#059669' : '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{citationCopied ? '✓' : '📋'}</span>
              <span>{citationCopied ? 'Citation Copied!' : 'Copy Formatted Citation'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
