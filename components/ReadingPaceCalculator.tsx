'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/products';

export default function ReadingPaceCalculator({ book }: { book: Product }) {
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [streak, setStreak] = useState(4);
  const [markedToday, setMarkedToday] = useState(false);

  // Average reading speed: 1.5 minutes per PDF page
  const totalMinutes = Math.round(book.pages * 1.5);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const daysToFinish = Math.max(1, Math.ceil(totalMinutes / dailyMinutes));
  const pagesPerDay = Math.ceil(book.pages / daysToFinish);

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToFinish);
  const formattedTargetDate = targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    try {
      const savedStreak = localStorage.getItem('bookshelf_reading_streak');
      if (savedStreak) setStreak(Number(savedStreak));
      const today = new Date().toDateString();
      const lastMarked = localStorage.getItem('bookshelf_streak_date');
      if (lastMarked === today) setMarkedToday(true);
    } catch {}
  }, []);

  const handleMarkReadToday = () => {
    const today = new Date().toDateString();
    const newStreak = streak + 1;
    setStreak(newStreak);
    setMarkedToday(true);
    try {
      localStorage.setItem('bookshelf_reading_streak', String(newStreak));
      localStorage.setItem('bookshelf_streak_date', today);
    } catch {}
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '0.1em' }}>
            ⏱️ Smart Reading Pace Engine
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '4px 0 0' }}>
            Pace &amp; Completion Target
          </h3>
        </div>

        {/* Streak Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fef3c7', padding: '6px 12px', borderRadius: 20 }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>
            {streak}-Day Focus Streak
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
        Total read time for all {book.pages} pages is approximately <b>~{totalHours} hours</b>. Select your daily reading commitment:
      </p>

      {/* Daily Minutes Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {[10, 15, 20, 30, 45, 60].map(mins => (
          <button
            key={mins}
            onClick={() => setDailyMinutes(mins)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              border: dailyMinutes === mins ? '1.5px solid var(--ink)' : '1px solid #cbd5e1',
              background: dailyMinutes === mins ? '#0f172a' : '#f8fafc',
              color: dailyMinutes === mins ? '#ffffff' : '#334155',
              transition: 'all 0.15s ease',
            }}
          >
            {mins} min/day
          </button>
        ))}
      </div>

      {/* Forecast Result Box */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Target Completion</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginTop: 2 }}>{formattedTargetDate}</div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>in {daysToFinish} days</span>
        </div>

        <div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Daily Reading Target</span>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginTop: 2 }}>{pagesPerDay} pages / day</div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>at {dailyMinutes} mins/session</span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button
            onClick={handleMarkReadToday}
            disabled={markedToday}
            style={{
              background: markedToday ? '#ecfdf5' : 'var(--amber)',
              color: markedToday ? '#065f46' : '#0f172a',
              border: markedToday ? '1px solid #86efac' : 'none',
              fontWeight: 800,
              fontSize: 12.5,
              padding: '9px 16px',
              borderRadius: 8,
              cursor: markedToday ? 'default' : 'pointer',
              boxShadow: markedToday ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            {markedToday ? '✅ Read Logged Today' : '🔥 Mark Today Read (+1)'}
          </button>
        </div>
      </div>
    </div>
  );
}
