'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getClientBooks } from '@/lib/customBooks';
import { coverHTML } from '@/lib/helpers';
import { getDirectDownloadUrl } from '@/lib/drive';
import ReferralModal from './ReferralModal';

const AdInjector = React.memo(({ adCode }: { adCode: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // When the iframe announces it's ready, send it the ad code!
      if (e.data?.type === 'AD_FRAME_READY' && iframeRef.current?.contentWindow === e.source) {
        const safeAdCode = adCode.replace(/(src|href)=['"]\/\//g, '$1="https://');
        
        iframeRef.current.contentWindow.postMessage({
          type: 'INJECT_AD',
          code: `
            <!DOCTYPE html>
            <html>
              <head>
                <base target="_blank">
                <style>
                  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; background: transparent; }
                </style>
              </head>
              <body>
                ${safeAdCode}
              </body>
            </html>
          `
        }, '*');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [adCode]);

  return (
    <iframe
      ref={iframeRef}
      src="/ad-frame"
      style={{ width: '100%', height: '100%', minHeight: 250, border: 'none', overflow: 'hidden' }}
      scrolling="no"
    />
  );
}, (prevProps, nextProps) => prevProps.adCode === nextProps.adCode);

export default function AdUnlockModal() {
  const { state, dispatch, triggerDirectDownload, toast } = useStore();
  const bookId = state.adUnlockBookId;
  const book = bookId ? getClientBooks().find(b => b.id === bookId) : null;

  const [settings, setSettings] = useState<{
    adNetwork: string;
    countdownSeconds: number;
    sponsorTitle: string;
    sponsorSubtitle: string;
    sponsorCta: string;
    sponsorUrl: string;
    adCode: string;
    directSmartLink: string;
  }>({
    adNetwork: 'built-in',
    countdownSeconds: 8,
    sponsorTitle: 'SkillBoost Pro — Master High-Income Tech Skills',
    sponsorSubtitle: 'Get 85% off premium project-based roadmaps, certifications, and AI tools for developers.',
    sponsorCta: 'Explore SkillBoost Free Trial ↗',
    sponsorUrl: 'https://github.com',
    adCode: '',
    directSmartLink: '',
  });

  const [timeLeft, setTimeLeft] = useState(8);
  const [isWatching, setIsWatching] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch settings from API
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          setTimeLeft(data.settings.countdownSeconds || 8);
        }
      })
      .catch(() => {});
  }, []);

  // Check if user is VIP (referred 3 friends)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const code = localStorage.getItem('bookshelf_user_ref');
      if (code) {
        fetch(`/api/referral?refCode=${code}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.isVipUnlocked) {
              setIsUnlocked(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [bookId]);

  // Reset state on modal open
  useEffect(() => {
    if (bookId) {
      setIsWatching(false);
      setDownloading(false);
      setTimeLeft(settings.countdownSeconds || 8);
      // Log ad impression
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment-impression' }),
      }).catch(() => {});
    }
  }, [bookId, settings.countdownSeconds]);

  // Handle countdown
  useEffect(() => {
    if (isWatching && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isWatching && timeLeft === 0) {
      setIsUnlocked(true);
      setIsWatching(false);
      toast('Download Unlocked! 🎉', 'Your PDF is ready for 1-click download');
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment-unlock' }),
      }).catch(() => {});
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isWatching, timeLeft, toast]);

  if (!book) return null;

  const handleStartWatch = () => {
    setIsWatching(true);
  };

  const handleExecuteDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await res.json();
      const directUrl = data.success ? data.downloadUrl : getDirectDownloadUrl(book.driveUrl || '');
      triggerDirectDownload(book.id, directUrl);
      dispatch({ type: 'SET_AD_UNLOCK', id: null });
    } catch {
      triggerDirectDownload(book.id, getDirectDownloadUrl(book.driveUrl || ''));
      dispatch({ type: 'SET_AD_UNLOCK', id: null });
    }
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dispatch({ type: 'SET_AD_UNLOCK', id: null });
  };

  const progressPercent = Math.round(((settings.countdownSeconds - timeLeft) / settings.countdownSeconds) * 100);

  return (
    <>
      {showReferralModal && (
        <ReferralModal
          onClose={() => setShowReferralModal(false)}
          onVipUnlocked={() => {
            setIsUnlocked(true);
            setShowReferralModal(false);
            toast('VIP Pass Activated! 🚀', 'Instant 0-second downloads enabled');
          }}
        />
      )}

      <div
        className="overlay open"
        id="adOverlay"
        onClick={(e) => { if ((e.target as HTMLElement).id === 'adOverlay') handleClose(); }}
        style={{ zIndex: 350, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className="modal"
          style={{
            maxWidth: 620,
            padding: 28,
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            background: '#ffffff',
          }}
        >
          <button className="x" onClick={handleClose} aria-label="Close modal">✕</button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
            <div style={{ width: 56, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: coverHTML(book, 'sm') }} />
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', background: '#ecfdf5', padding: '3px 8px', borderRadius: 6 }}>
                ⚡ 100% Free Download
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 2px', color: 'var(--ink)' }}>{book.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>by {book.author} · {book.pages} pages · {(book.pages * 0.09).toFixed(1)} MB PDF</p>
            </div>
          </div>

          {/* Warning / Support Notice */}
          <div style={{ margin: '16px 0', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#334155' }}>
              <span style={{ fontSize: 18 }}>📢</span>
              <span>Watching a short sponsor message keeps this PDF 100% free.</span>
            </div>
            <button
              onClick={() => setShowReferralModal(true)}
              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 800, fontSize: 11.5, padding: '4px 10px', borderRadius: 20, cursor: 'pointer' }}
            >
              ⚡ Get 0s VIP Pass ↗
            </button>
          </div>

          {/* Ad Container Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
              border: '2px dashed #cbd5e1',
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
              minHeight: 150,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ position: 'absolute', top: 8, right: 10, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Sponsored Ad
            </span>

            {settings.adCode ? (
              <AdInjector adCode={settings.adCode} />
            ) : (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 8 }}>
                  ⭐ Featured Sponsor
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {settings.sponsorTitle}
                </h4>
                <p style={{ fontSize: 13, color: '#475569', maxWidth: 440, margin: '4px auto 12px' }}>
                  {settings.sponsorSubtitle}
                </p>
                <a
                  href={settings.sponsorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { if (!isWatching && !isUnlocked) handleStartWatch(); }}
                  style={{
                    display: 'inline-block',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '7px 18px',
                    borderRadius: 999,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  }}
                >
                  {settings.sponsorCta}
                </a>
              </div>
            )}
          </div>

          {/* Progress & Countdown Section */}
          <div style={{ marginTop: 20 }}>
            {isUnlocked ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 14, color: 'var(--green)', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 20 }}>✅</span> PDF Ready for Instant Google Drive Download!
                </div>
                <button
                  onClick={handleExecuteDownload}
                  disabled={downloading}
                  style={{
                    width: '100%',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 800,
                    padding: '14px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.2s ease',
                    transform: 'scale(1.01)',
                  }}
                >
                  {downloading ? '⏳ Connecting to Google Drive…' : '⤓ Click to Download PDF Now (Google Drive)'}
                </button>
              </div>
            ) : isWatching ? (
              <div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  <span>Unlocking your download…</span>
                  <span style={{ color: 'var(--amber)', fontSize: 15 }}>⏳ {timeLeft}s left</span>
                </div>
                <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #059669)',
                      borderRadius: 999,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                  Please wait {timeLeft} seconds while the secure link generates.
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleStartWatch}
                  style={{
                    width: '100%',
                    background: 'var(--amber)',
                    color: '#0f172a',
                    fontSize: 15,
                    fontWeight: 800,
                    padding: '13px',
                    borderRadius: 999,
                    border: '1px solid #d97706',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ▶ Watch {settings.countdownSeconds}s Sponsor Ad to Unlock Free Download
                </button>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
                  <span>🔒 Virus-checked &amp; Clean</span>
                  <span>⚡ Instant Google Drive Stream</span>
                  <span>📱 Mobile &amp; PC Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
