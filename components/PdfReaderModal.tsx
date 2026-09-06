'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/products';
import { useStore } from '@/lib/store';
import { extractDriveId, getDriveEmbedUrl } from '@/lib/drive';

interface PdfReaderModalProps {
  book: Product | null;
  onClose: () => void;
}

export default function PdfReaderModal({ book, onClose }: PdfReaderModalProps) {
  const { downloadFree } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark' | 'cyber'>('sepia');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const driveId = book?.driveUrl ? extractDriveId(book.driveUrl) : null;
  const hasLiveStream = Boolean(driveId);
  const embedUrl = book?.driveUrl ? getDriveEmbedUrl(book.driveUrl) : '';

  // Mode: 'stream' (live Google Drive iframe) vs 'preview' (custom typography reader)
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
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, [book, currentPage, mode, theme]);

  // Keyboard navigation listener (left/right arrow keys & escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'preview') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          setCurrentPage(p => Math.min(totalPages, p + 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentPage(p => Math.max(1, p - 1));
        }
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

  const themes = {
    light: { bg: '#ffffff', text: '#0f172a', paper: '#f8fafc', border: '#e2e8f0', barBg: '#0f172a' },
    sepia: { bg: '#fbf0d9', text: '#5f4b32', paper: '#f4ecd8', border: '#e6d8ba', barBg: '#453523' },
    dark: { bg: '#0f172a', text: '#f1f5f9', paper: '#1e293b', border: '#334155', barBg: '#020617' },
    cyber: { bg: '#050505', text: '#e2e8f0', paper: '#121212', border: '#262626', barBg: '#000000' },
  };

  const currentTheme = themes[theme];

  const handleDownloadFull = () => {
    onClose();
    downloadFree(book.id);
  };

  return (
    <div
      ref={modalContainerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 30, 0.88)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <b style={{ fontSize: 14.5, color: '#ffffff' }}>{book.title}</b>
              {hasLiveStream && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: '#059669',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  LIVE CLOUD STREAM
                </span>
              )}
            </div>
            <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
              by {book.author} · {book.pages} Pages · DRM-Free
            </span>
          </div>
        </div>

        {/* Reader Mode Selector */}
        {hasLiveStream && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.1)',
              padding: '3px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <button
              onClick={() => setMode('stream')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'stream' ? 'var(--amber)' : 'transparent',
                color: mode === 'stream' ? '#0f172a' : '#cbd5e1',
                transition: 'all 0.15s ease',
              }}
            >
              ☁️ Cloud Stream
            </button>
            <button
              onClick={() => setMode('preview')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'preview' ? 'var(--amber)' : 'transparent',
                color: mode === 'preview' ? '#0f172a' : '#cbd5e1',
                transition: 'all 0.15s ease',
              }}
            >
              📄 Typography Mode
            </button>
          </div>
        )}

        {/* Theme, Zoom, Fullscreen & Close Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Eye-Care Themes (in Typography Mode) */}
          {mode === 'preview' && (
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: 8 }}>
              {(['sepia', 'light', 'dark', 'cyber'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: theme === t ? 'var(--amber)' : 'transparent',
                    color: theme === t ? '#0f172a' : '#cbd5e1',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Zoom Controls (in Typography Mode) */}
          {mode === 'preview' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setZoomLevel(z => Math.max(90, z - 15))}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontWeight: 900 }}
                title="Zoom Out"
              >
                −
              </button>
              <span style={{ fontSize: 11, color: '#e2e8f0', minWidth: 36, textAlign: 'center' }}>{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(140, z + 15))}
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', width: 24, height: 24, borderRadius: 4, cursor: 'pointer', fontWeight: 900 }}
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
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '↙ Exit Full' : '⛶ Fullscreen'}
          </button>

          {/* Direct Download Button */}
          <button
            onClick={handleDownloadFull}
            style={{
              background: 'var(--amber)',
              color: '#0f172a',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
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
              fontSize: 15,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
            title="Close Reader"
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
            title={`PDF Reader Stream: ${book.title}`}
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
              borderRadius: 8,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: `1px solid ${currentTheme.border}`,
              padding: `${50 * (zoomLevel / 100)}px`,
              position: 'relative',
              fontSize: `${16 * (zoomLevel / 100)}px`,
              lineHeight: 1.7,
              fontFamily: 'serif',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Header watermark */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: 10, marginBottom: 30, fontSize: 12, opacity: 0.6, fontFamily: 'sans-serif' }}>
              <span>{book.title} — Official Preview</span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Page 1: Title & Cover Intro */}
            {currentPage === 1 && (
              <div>
                <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'var(--amber)', fontFamily: 'sans-serif' }}>
                  {book.cat} Series · First Edition
                </span>
                <h1 style={{ fontSize: 36, fontWeight: 900, margin: '14px 0 6px', fontFamily: 'sans-serif' }}>{book.title}</h1>
                <h3 style={{ fontSize: 20, fontWeight: 500, opacity: 0.8, margin: '0 0 24px', fontStyle: 'italic' }}>{book.sub}</h3>
                <p style={{ fontWeight: 700 }}>by {book.author}</p>
                <div style={{ marginTop: 40, padding: 20, background: currentTheme.paper, borderRadius: 8, border: `1px solid ${currentTheme.border}`, fontFamily: 'sans-serif', fontSize: 14 }}>
                  <b>Executive Summary:</b> {book.blurb}
                </div>
                <p style={{ marginTop: 30 }}>
                  This is an interactive in-browser preview typeset from the official PDF master file. Use the buttons below or your keyboard arrow keys (<kbd>←</kbd> / <kbd>→</kbd>) to turn pages.
                </p>
              </div>
            )}

            {/* Page 2: Table of Contents */}
            {currentPage === 2 && (
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, borderBottom: `2px solid ${currentTheme.border}`, paddingBottom: 10, marginBottom: 20, fontFamily: 'sans-serif' }}>
                  Table of Contents
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'sans-serif', fontSize: 14.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${currentTheme.border}`, paddingBottom: 6 }}>
                    <b>Introduction: The Core Framework</b>
                    <span>p. 4</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${currentTheme.border}`, paddingBottom: 6 }}>
                    <b>Chapter 1: Foundational Principles &amp; Mental Models</b>
                    <span>p. 18</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${currentTheme.border}`, paddingBottom: 6 }}>
                    <b>Chapter 2: Step-by-Step Implementation Protocol</b>
                    <span>p. 45</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${currentTheme.border}`, paddingBottom: 6 }}>
                    <b>Chapter 3: Optimization, Workflows &amp; Scaling</b>
                    <span>p. 78</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${currentTheme.border}`, paddingBottom: 6 }}>
                    <b>Appendix: Printable Worksheets &amp; Checklists</b>
                    <span>p. {Math.max(1, book.pages - 10)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: Introduction */}
            {currentPage === 3 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 16px', fontFamily: 'sans-serif' }}>Introduction: The Attention Paradox</h2>
                <p>
                  In the modern knowledge economy, time and focus are finite, diminishing resources. Most conventional advice tells readers to &ldquo;try harder&rdquo; or work longer hours. But cognitive research demonstrates that sustained excellence is not a virtue of willpower — it is a product of deliberate system architecture.
                </p>
                <p>
                  When you engineer your daily environment and calibrate high-impact output blocks, deep progress becomes the effortless default rather than a daily struggle.
                </p>
                <blockquote style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 16, margin: '24px 0', fontStyle: 'italic', opacity: 0.9 }}>
                  &ldquo;Do not fight distraction with brute willpower. Eliminate the friction of starting, and focus will follow.&rdquo;
                </blockquote>
              </div>
            )}

            {/* Page 4: Chapter 1 Extract */}
            {currentPage === 4 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 16px', fontFamily: 'sans-serif' }}>Chapter 1: The 90-Minute Sprint</h2>
                <p>
                  Ultradian rhythms govern human energy in 90-minute waves. By aligning your highest-leverage intellectual work with a focused 90-minute block followed by a 15-minute physical reset, you achieve in two hours what most knowledge workers produce in a full day.
                </p>
                <div style={{ background: currentTheme.paper, padding: 18, borderRadius: 8, margin: '20px 0', border: `1px solid ${currentTheme.border}`, fontFamily: 'sans-serif', fontSize: 13.5 }}>
                  <b>⚡ Sprint Rules:</b>
                  <ol style={{ paddingLeft: 20, margin: '8px 0 0' }}>
                    <li>One singular objective written on physical paper.</li>
                    <li>Zero notification badges or open browser tabs outside the task.</li>
                    <li>Mandatory offline shutdown when the timer chimes.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Page 5: End of Sample */}
            {currentPage === 5 && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <span style={{ fontSize: 36 }}>✨</span>
                <h2 style={{ fontSize: 26, fontWeight: 900, margin: '14px 0 8px', fontFamily: 'sans-serif' }}>End of Free Sample Preview</h2>
                <p style={{ opacity: 0.85, maxWidth: 460, margin: '0 auto 24px', fontFamily: 'sans-serif' }}>
                  You have reached the end of the sample chapter. The complete {book.pages}-page edition is 100% free and includes all printable worksheets, cheat sheets, and checklists.
                </p>
                <button
                  onClick={handleDownloadFull}
                  style={{
                    background: 'var(--amber)',
                    color: '#0f172a',
                    fontSize: 16,
                    fontWeight: 900,
                    padding: '14px 28px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
                    fontFamily: 'sans-serif',
                  }}
                >
                  ⤓ Download Full {book.pages}p PDF (100% Free)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Bar (Only in Typography Mode) */}
      {mode === 'preview' && (
        <div
          style={{
            background: currentTheme.barBg,
            color: '#ffffff',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              ← Previous Page
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Next Page →
            </button>
          </div>

          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
            Page {currentPage} of {totalPages} (Sample Chapter)
          </span>

          <button
            onClick={handleDownloadFull}
            style={{
              background: 'var(--amber)',
              color: '#0f172a',
              fontWeight: 900,
              fontSize: 13,
              padding: '8px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ⤓ Download Full PDF ({book.pages}p)
          </button>
        </div>
      )}
    </div>
  );
}
