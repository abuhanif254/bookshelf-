'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/products';

interface AudioSummaryPlayerProps {
  book: Product;
}

export default function AudioSummaryPlayer({ book }: AudioSummaryPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setHasSpeechSupport(false);
    }
  }, []);

  const summaryText = `Here is your 60-second audio summary of ${book.title}, written by ${book.author}. ${book.blurb} This ${book.pages}-page handbook is divided into three key protocols: First, mastering deep-focus architecture. Second, eliminating friction in your daily workflow. And third, scaling output with repeatable checklists. Download the complete free PDF edition on Bookshelf to read the full guide.`;

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // Reset any ongoing speech
      const utter = new SpeechSynthesisUtterance(summaryText);
      utter.rate = rate;
      utter.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (englishVoice) {
        utter.voice = englishVoice;
      }

      utter.onend = () => setIsPlaying(false);
      utter.onerror = () => setIsPlaying(false);

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(summaryText);
      utter.rate = newRate;
      utter.onend = () => setIsPlaying(false);
      utter.onerror = () => setIsPlaying(false);
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!hasSpeechSupport) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        margin: '18px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={handleTogglePlay}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--amber)',
            color: '#0f172a',
            border: 'none',
            fontSize: 18,
            fontWeight: 900,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            transition: 'transform 0.15s ease',
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: 14, color: '#ffffff' }}>🎧 AI Voice Summary Preview</b>
            {isPlaying && (
              <span style={{ fontSize: 10, background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                PLAYING
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            60-second audio digest of key takeaways &amp; lessons
          </div>
        </div>
      </div>

      {/* Speed Rate Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Speed:</span>
        {[1.0, 1.25, 1.5].map(r => (
          <button
            key={r}
            onClick={() => handleRateChange(r)}
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: rate === r ? 'var(--amber)' : 'rgba(255,255,255,0.1)',
              color: rate === r ? '#0f172a' : '#cbd5e1',
            }}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
