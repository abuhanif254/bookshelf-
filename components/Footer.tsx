'use client';

import Link from 'next/link';
import { useCurrency, CURRENCIES, CurrencyCode } from '@/lib/currency';

export default function Footer() {
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <button className="btt" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top
      </button>
      <footer className="ft">
        <div className="cols">
          <div>
            <h4>Explore Bookshelf</h4>
            <Link href="/about">📖 About Bookshelf</Link>
            <Link href="/bundles/indie-founder-stack">📦 Curated PDF Bundles</Link>
            <Link href="/best/free-programming-books-2026">🏆 Best Coding Books 2026</Link>
            <Link href="/best/top-productivity-books-for-founders">⚡ Best Productivity Books</Link>
            <Link href="/compare/deep-focus-vs-morning-reset">⚖️ Book Comparisons</Link>
            <Link href="/library">📚 Complete Catalog</Link>
            <Link href="/feed.xml">📡 RSS Feed</Link>
          </div>
          <div>
            <h4>Free PDF Categories</h4>
            <Link href="/category/productivity">Productivity PDFs</Link>
            <Link href="/category/programming">Programming &amp; Coding</Link>
            <Link href="/category/business">Business &amp; Founders</Link>
            <Link href="/category/design">Design Systems &amp; UI</Link>
            <Link href="/category/marketing">Marketing &amp; Growth</Link>
          </div>
          <div>
            <h4>Trending Topics</h4>
            <Link href="/topic/deep-work">Deep Work &amp; Focus</Link>
            <Link href="/topic/javascript-patterns">JavaScript &amp; TypeScript</Link>
            <Link href="/topic/ai-prompts">AI Prompts &amp; Workflows</Link>
            <Link href="/topic/personal-finance">Personal Finance &amp; Wealth</Link>
            <Link href="/topic/habit-building">Habit Protocols</Link>
          </div>
          <div>
            <h4>Creators &amp; Admin</h4>
            <Link href="/publish">🚀 Publish Your PDF Book</Link>
            <Link href="/account/library">Your Offline Library</Link>
            <Link href="/cart">Your Cart</Link>
            <Link href="/admin">⚙️ Admin Dashboard</Link>
          </div>
        </div>
        <div className="ft-bot">
          <div className="logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--smile)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
              <path d="M6 14h6"/>
            </svg>
            <b style={{ color: '#fff' }}>book<i style={{ color: 'var(--smile)' }}>shelf</i></b>
          </div>
          <span className="sel">🌐 English</span>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as CurrencyCode)}
            style={{
              background: 'transparent',
              color: '#cbd5e1',
              border: '1px solid #475569',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {Object.entries(CURRENCIES).map(([code, conf]) => (
              <option key={code} value={code} style={{ background: '#0f172a', color: '#fff' }}>
                {conf.name}
              </option>
            ))}
          </select>
          <span className="sel">🌍 Global DRM-Free</span>
          <div>
            <Link href="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link> · <Link href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link> · Cookie Preferences<br />
            © 2026 Bookshelf Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
