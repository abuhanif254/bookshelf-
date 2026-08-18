'use client';

import React, { useState, useEffect } from 'react';

interface ReferralModalProps {
  onClose: () => void;
  onVipUnlocked?: () => void;
}

export default function ReferralModal({ onClose, onVipUnlocked }: ReferralModalProps) {
  const [refCode, setRefCode] = useState('');
  const [inviteCount, setInviteCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let code = localStorage.getItem('bookshelf_user_ref');
    if (!code) {
      code = 'vip_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('bookshelf_user_ref', code);
    }
    setRefCode(code);

    // Fetch referral count
    fetch(`/api/referral?refCode=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInviteCount(data.count);
          if (data.isVipUnlocked) {
            setIsUnlocked(true);
            if (onVipUnlocked) onVipUnlocked();
          }
        }
      })
      .catch(() => {});
  }, [onVipUnlocked]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${refCode}`
    : `https://bookshelf.com/?ref=${refCode}`;

  const shareMessage = `Download thousands of best-selling PDF books on coding, productivity, and startups 100% free on Bookshelf: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateInvite = () => {
    // Allows testing the referral unlock flow easily
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInviteCount(data.count);
          if (data.isVipUnlocked) {
            setIsUnlocked(true);
            if (onVipUnlocked) onVipUnlocked();
          }
        }
      });
  };

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
          maxWidth: 520,
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
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef3c7', color: '#d97706', fontSize: 26, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            ⚡
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', margin: '0 0 6px' }}>
            Unlock Instant 0-Second VIP Downloads
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Share your invite link with 3 friends. Once they visit, your account permanently unlocks **Instant Zero-Wait Downloads** with no ad timer!
          </p>
        </div>

        {/* Progress Tracker */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
            <span>Invite Progress</span>
            <span style={{ color: isUnlocked ? 'var(--green)' : 'var(--amber)' }}>
              {isUnlocked ? '✅ 3 / 3 (VIP Unlocked!)' : `${inviteCount} / 3 friends invited`}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (inviteCount / 3) * 100)}%`,
                height: '100%',
                background: isUnlocked ? '#059669' : 'var(--amber)',
                borderRadius: 999,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#25d366',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 13,
              padding: '11px',
              borderRadius: 8,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>💬</span> Share WhatsApp
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#0088cc',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 13,
              padding: '11px',
              borderRadius: 8,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>✈️</span> Share Telegram
          </a>
        </div>

        {/* Copy Link Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 12.5,
              background: '#f8fafc',
              color: '#334155',
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--green)' : 'var(--ink)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 12,
              padding: '9px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Demo Simulation Trigger for easy verification */}
        <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
          <button
            onClick={handleSimulateInvite}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11, textDecoration: 'underline', cursor: 'pointer' }}
          >
            [Test Demo: Click to simulate 1 friend visit ({inviteCount}/3)]
          </button>
        </div>
      </div>
    </div>
  );
}
