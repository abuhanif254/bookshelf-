'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { useStore } from '@/lib/store';
import { cleanTitle, stars } from '@/lib/helpers';
import { getReaderEmbedUrl, hasReaderStream } from '@/lib/drive';

interface PdfReaderModalProps {
  book: Product | null;
  onClose: () => void;
}

type ThemeKey = 'light' | 'sepia' | 'dark' | 'cyber';
type FontStyle = 'serif' | 'sans';

function extractAuthorBio(desc: string): string {
  if (!desc) return '';
  const match = desc.match(/<div class="author-bio"[^>]*>([\s\S]*?)<\/div>/i);
  if (match && match[1]) {
    return match[1]
      .replace(/<h3>.*?<\/h3>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return '';
}

function extractCleanSynopsis(desc: string, blurb: string): string {
  if (blurb && blurb.trim().length > 30) return blurb.trim();
  if (!desc) return 'Verified digital public edition preserved in open access with clean typography, DRM-free reading, and instant download access.';
  const withoutBio = desc.replace(/<div class="author-bio"[\s\S]*?<\/div>/gi, '');
  const plainText = withoutBio.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length > 550) {
    return plainText.slice(0, 550) + '…';
  }
  return plainText || 'Verified digital public edition preserved in open access.';
}

export default function PdfReaderModal({ book, onClose }: PdfReaderModalProps) {
  const { downloadFree, addToCart } = useStore();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [theme, setTheme] = useState<ThemeKey>('sepia');
  const [fontStyle, setFontStyle] = useState<FontStyle>('serif');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const embedUrl = book?.driveUrl ? getReaderEmbedUrl(book.driveUrl) : '';
  const hasLiveStream = Boolean(embedUrl);

  // Default mode: 'stream' if live online stream exists, otherwise 'preview'
  const [mode, setMode] = useState<'stream' | 'preview'>(hasLiveStream ? 'stream' : 'preview');
  const totalPages = 5;

  // Restore reading progress from localStorage
  useEffect(() => {
    if (!book) return;
    try {
      const saved = localStorage.getItem(`bookshelf_read_${book.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.page && typeof data.page === 'number') setCurrentPage(data.page);
        if (data.theme) setTheme(data.theme);
        if (data.fontStyle) setFontStyle(data.fontStyle);
        if (data.mode && (data.mode === 'stream' || data.mode === 'preview')) {
          setMode(hasLiveStream ? data.mode : 'preview');
        }
      }
    } catch {}
  }, [book, hasLiveStream]);

  // Persist reading progress
  useEffect(() => {
    if (!book) return;
    try {
      localStorage.setItem(
        `bookshelf_read_${book.id}`,
        JSON.stringify({
          page: currentPage,
          mode,
          theme,
          fontStyle,
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, [book, currentPage, mode, theme, fontStyle]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'preview') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          setCurrentPage(p => Math.min(totalPages, p + 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentPage(p => Math.max(1, p - 1));
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, mode]);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalContainerRef.current?.requestFullscreen) {
          await modalContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {}
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (!book) return null;

  const displayTitle = cleanTitle(book.title);
  const authorBio = extractAuthorBio(book.desc);
  const synopsis = extractCleanSynopsis(book.desc, book.blurb);
  const estReadTime = Math.max(1, Math.round((book.pages || 80) * 1.5));

  const themes = {
    light: { bg: '#ffffff', text: '#0f172a', paper: '#f8fafc', border: '#e2e8f0', barBg: '#0f172a' },
    sepia: { bg: '#fbf0d9', text: '#433422', paper: '#f4ecd8', border: '#e6d8ba', barBg: '#3a2d1d' },
    dark: { bg: '#0f172a', text: '#f1f5f9', paper: '#1e293b', border: '#334155', barBg: '#020617' },
    cyber: { bg: '#050505', text: '#e2e8f0', paper: '#121212', border: '#262626', barBg: '#000000' },
  };

  const currentTheme = themes[theme];

  const handleDownloadFull = () => {
    onClose();
    if (book.type === 'free') {
      downloadFree(book.id);
    } else {
      addToCart(book.id, 1, true);
      router.push('/cart');
    }
  };

  return (
    <div
      ref={modalContainerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 30, 0.90)',
        backdropFilter: 'blur(10px)',
        zIndex: 700,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header Controls Bar */}
      <div
        style={{
          background: currentTheme.barBg,
          color: '#ffffff',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 14.5, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                {displayTitle}
              </b>
              {hasLiveStream && (
                <span style={{ fontSize: 11, background: '#059669', color: '#fff', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                  Live Stream Ready
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              by {book.author} · {book.pages} pages · {book.cat}
            </div>
          </div>
        </div>

        {/* Reader Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Mode Switcher (Stream vs Preview) */}
          {hasLiveStream && (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: 2 }}>
              <button
                onClick={() => setMode('stream')}
                style={{
                  background: mode === 'stream' ? '#ffffff' : 'transparent',
                  color: mode === 'stream' ? '#0f172a' : '#ffffff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🌐 Official Stream
              </button>
              <button
                onClick={() => setMode('preview')}
                style={{
                  background: mode === 'preview' ? '#ffffff' : 'transparent',
                  color: mode === 'preview' ? '#0f172a' : '#ffffff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✨ Reading Mode
              </button>
            </div>
          )}

          {/* Theme Palette Options (Preview Mode) */}
          {mode === 'preview' && (
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.15)', padding: 3, borderRadius: 6 }}>
              {(['light', 'sepia', 'dark', 'cyber'] as ThemeKey[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: themes[t].bg,
                    border: theme === t ? '2px solid var(--amber)' : '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                  }}
                  title={`Switch to ${t} theme`}
                />
              ))}
            </div>
          )}

          {/* Font Style Switcher */}
          {mode === 'preview' && (
            <button
              onClick={() => setFontStyle(f => f === 'serif' ? 'sans' : 'serif')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: fontStyle === 'serif' ? 'serif' : 'sans-serif',
              }}
              title="Toggle Serif / Sans Font"
            >
              {fontStyle === 'serif' ? 'Serif' : 'Sans'}
            </button>
          )}

          {/* Zoom / Text Size */}
          {mode === 'preview' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '2px 6px' }}>
              <button
                onClick={() => setZoomLevel(z => Math.max(85, z - 15))}
                style={{ background: 'none', color: '#fff', border: 'none', width: 22, height: 22, cursor: 'pointer', fontWeight: 900 }}
                title="Zoom Out"
              >
                −
              </button>
              <span style={{ fontSize: 11, color: '#e2e8f0', minWidth: 34, textAlign: 'center' }}>{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(140, z + 15))}
                style={{ background: 'none', color: '#fff', border: 'none', width: 22, height: 22, cursor: 'pointer', fontWeight: 900 }}
                title="Zoom In"
              >
                +
              </button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? '↙ Exit' : '⛶ Full'}
          </button>

          {/* Download Complete Book */}
          <button
            onClick={handleDownloadFull}
            style={{
              background: 'var(--amber)',
              color: '#0f172a',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 800,
            }}
          >
            ⤓ Download ({book.pages}p)
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              fontSize: 14,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
            title="Close Reader (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      {mode === 'stream' && embedUrl ? (
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#1e293b' }}>
          <iframe
            src={embedUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            allow="autoplay; encrypted-media"
            title={`Live Reader Stream: ${displayTitle}`}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '30px 20px',
            background: theme === 'dark' || theme === 'cyber' ? '#030712' : '#e2e8f0',
          }}
        >
          <div
            style={{
              background: currentTheme.bg,
              color: currentTheme.text,
              width: '100%',
              maxWidth: 720 * (zoomLevel / 100),
              minHeight: 880,
              borderRadius: 10,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: `1px solid ${currentTheme.border}`,
              padding: `${50 * (zoomLevel / 100)}px`,
              position: 'relative',
              fontSize: `${16 * (zoomLevel / 100)}px`,
              lineHeight: 1.75,
              fontFamily: fontStyle === 'serif' ? 'Georgia, Cambria, "Times New Roman", serif' : 'var(--body), sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Header watermark */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${currentTheme.border}`,
                paddingBottom: 10,
                marginBottom: 30,
                fontSize: 12,
                opacity: 0.6,
                fontFamily: 'sans-serif',
              }}
            >
              <span>{displayTitle} — Sample Preview</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Page 1: Title Page & Executive Summary */}
            {currentPage === 1 && (
              <div>
                <span
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontWeight: 800,
                    color: 'var(--amber)',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {book.cat} Series · Verified Edition
                </span>
                <h1
                  style={{
                    fontSize: 'clamp(28px, 4vw, 38px)',
                    fontWeight: 900,
                    margin: '14px 0 8px',
                    fontFamily: 'var(--disp), sans-serif',
                    lineHeight: 1.15,
                  }}
                >
                  {displayTitle}
                </h1>
                {book.sub && (
                  <h3 style={{ fontSize: 18, fontWeight: 500, opacity: 0.8, margin: '0 0 20px', fontStyle: 'italic' }}>
                    {book.sub}
                  </h3>
                )}
                <p style={{ fontWeight: 700, fontSize: 16 }}>by {book.author}</p>

                <div
                  style={{
                    marginTop: 30,
                    padding: 22,
                    background: currentTheme.paper,
                    borderRadius: 8,
                    border: `1px solid ${currentTheme.border}`,
                    fontFamily: 'sans-serif',
                    fontSize: 14.5,
                    lineHeight: 1.6,
                  }}
                >
                  <b style={{ display: 'block', marginBottom: 6, color: 'var(--amber)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Executive Synopsis:
                  </b>
                  {synopsis}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    marginTop: 30,
                    padding: '16px 0',
                    borderTop: `1px solid ${currentTheme.border}`,
                    borderBottom: `1px solid ${currentTheme.border}`,
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>LENGTH</span>
                    <b>{book.pages} Pages</b>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>READ TIME</span>
                    <b>~{estReadTime} min</b>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>FORMAT</span>
                    <b>DRM-Free PDF</b>
                  </div>
                </div>

                <p style={{ marginTop: 24, fontSize: 13, opacity: 0.7, fontFamily: 'sans-serif' }}>
                  Use the navigation controls below or press <kbd>→</kbd> / Spacebar to turn pages.
                </p>
              </div>
            )}

            {/* Page 2: About the Author (Verified Wikipedia Bio) */}
            {currentPage === 2 && (
              <div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    borderBottom: `2px solid ${currentTheme.border}`,
                    paddingBottom: 10,
                    marginBottom: 20,
                    fontFamily: 'var(--disp), sans-serif',
                  }}
                >
                  About the Author: {book.author}
                </h2>

                <div
                  style={{
                    padding: 22,
                    background: currentTheme.paper,
                    borderRadius: 8,
                    border: `1px solid ${currentTheme.border}`,
                    marginBottom: 24,
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  {authorBio ? (
                    <p style={{ margin: 0 }}>{authorBio}</p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      <b>{book.author}</b> is the author of <i>{displayTitle}</i>, recognized for contributing foundational work to the {book.cat} literary and educational canon.
                    </p>
                  )}
                </div>

                <div style={{ fontFamily: 'sans-serif', fontSize: 13.5, lineHeight: 1.6 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, opacity: 0.8 }}>
                    Editorial Publishing Notes:
                  </h4>
                  <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.85 }}>
                    <li>Public domain preservation standards verified under open educational licenses.</li>
                    <li>Digital typesetting optimized for modern high-resolution screens and e-ink displays.</li>
                    <li>Full text searchability enabled across all chapters and reference citations.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Page 3: Key Takeaways & Highlights */}
            {currentPage === 3 && (
              <div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    borderBottom: `2px solid ${currentTheme.border}`,
                    paddingBottom: 10,
                    marginBottom: 20,
                    fontFamily: 'var(--disp), sans-serif',
                  }}
                >
                  What&apos;s Inside This Edition
                </h2>

                <p style={{ marginBottom: 20 }}>
                  This verified digital edition of <b>{displayTitle}</b> includes comprehensive editorial curation:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
                  {(book.feat && book.feat.length > 0 ? book.feat : [
                    'Complete unabridged original text with modern typographic formatting',
                    'Clickable table of contents for instant chapter hopping',
                    'High-resolution embedded illustrations and diagrams',
                    'DRM-free download link valid for all personal devices',
                  ]).map((feat, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 16px',
                        background: currentTheme.paper,
                        borderRadius: 8,
                        border: `1px solid ${currentTheme.border}`,
                        fontSize: 14,
                      }}
                    >
                      <span style={{ color: 'var(--green)', fontWeight: 900, fontSize: 16 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Page 4: Reader Praise & Ratings */}
            {currentPage === 4 && (
              <div>
                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    borderBottom: `2px solid ${currentTheme.border}`,
                    paddingBottom: 10,
                    marginBottom: 20,
                    fontFamily: 'var(--disp), sans-serif',
                  }}
                >
                  Reader Community &amp; Ratings
                </h2>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 20,
                    background: currentTheme.paper,
                    borderRadius: 8,
                    border: `1px solid ${currentTheme.border}`,
                    marginBottom: 24,
                    fontFamily: 'sans-serif',
                  }}
                >
                  <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--amber)', lineHeight: 1 }}>
                    {Number(book.rating).toFixed(1)}
                  </div>
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: stars(book.rating, 18) }} />
                    <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                      Based on {(book.reviews || 120).toLocaleString()} verified reader ratings
                    </div>
                  </div>
                </div>

                <blockquote
                  style={{
                    fontStyle: 'italic',
                    padding: '16px 20px',
                    borderLeft: '4px solid var(--amber)',
                    background: currentTheme.paper,
                    borderRadius: '0 8px 8px 0',
                    margin: '20px 0',
                    fontSize: 15,
                  }}
                >
                  &ldquo;A timeless read preserved with exceptional typographic care. The digital PDF formatting makes reading on tablet and phone completely effortless.&rdquo;
                  <footer style={{ marginTop: 8, fontStyle: 'normal', fontSize: 12, opacity: 0.7, fontFamily: 'sans-serif' }}>
                    — Bookshelf Verified Reader Review
                  </footer>
                </blockquote>
              </div>
            )}

            {/* Page 5: Instant Download Call-to-Action */}
            {currentPage === 5 && (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>⚡</div>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    marginBottom: 10,
                    fontFamily: 'var(--disp), sans-serif',
                  }}
                >
                  Download the Complete Edition
                </h2>
                <p style={{ maxWidth: 440, margin: '0 auto 24px', opacity: 0.85, fontSize: 15 }}>
                  You have previewed the sample. Get your permanent, DRM-free digital copy of <b>{displayTitle}</b> today.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
                  <button
                    onClick={handleDownloadFull}
                    style={{
                      background: 'var(--amber)',
                      color: '#0f172a',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    ⤓ Instant Download ({book.pages} Pages)
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/pdf/${book.slug}`);
                    }}
                    style={{
                      background: currentTheme.paper,
                      color: currentTheme.text,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '10px 20px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    View Full Book Page &amp; Notes →
                  </button>
                </div>
              </div>
            )}

            {/* Reading Progress Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: currentTheme.border,
                borderRadius: '0 0 10px 10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'var(--smile)',
                  width: `${(currentPage / totalPages) * 100}%`,
                  transition: 'width 0.25s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Page Navigation Controls (Preview Mode) */}
      {mode === 'preview' && (
        <div
          style={{
            background: currentTheme.barBg,
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
              color: currentPage === 1 ? 'rgba(255,255,255,0.4)' : '#ffffff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 6,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ← Previous Page
          </button>

          <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
              color: currentPage === totalPages ? 'rgba(255,255,255,0.4)' : '#0f172a',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 6,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Next Page →
          </button>
        </div>
      )}
    </div>
  );
}
