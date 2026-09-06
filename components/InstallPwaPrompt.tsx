'use client';

import React, { useState, useEffect } from 'react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true)
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the prompt recently (7-day cooldown)
    try {
      const dismissed = localStorage.getItem('bookshelf_pwa_dismissed');
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    } catch {}

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also check on mobile if not yet prompted after 5 seconds of active reading
    const timer = setTimeout(() => {
      if (!isInstalled && !localStorage.getItem('bookshelf_pwa_dismissed')) {
        // Ready to display if deferredPrompt was captured or standard iOS hint
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIos && !window.matchMedia('(display-mode: standalone)').matches) {
          setIsVisible(true);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS / browser manual install instructions
      alert('To install Bookshelf on iOS: tap the Share button below, then tap "Add to Home Screen" 📲');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('bookshelf_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 440,
        margin: '0 auto',
        zIndex: 600,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: 14,
        padding: '14px 18px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        animation: 'slideUp 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'var(--amber)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          }}
        >
          📚
        </div>
        <div>
          <b style={{ fontSize: 13.5, color: '#ffffff', display: 'block', lineHeight: 1.2 }}>
            Install Bookshelf App
          </b>
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            Fast offline reading · Zero downloads needed
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'var(--amber)',
            color: '#0f172a',
            fontSize: 12.5,
            fontWeight: 800,
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          }}
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            border: 'none',
            borderRadius: '50%',
            width: 26,
            height: 26,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
