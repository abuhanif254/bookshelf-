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
            <Link href="/bundles/indie-founder-stack">📦 Curated PDF Bundles</Link>
            <Link href="/library?preset=best">Best Selling PDFs</Link>
            <Link href="/library?preset=new">New Releases</Link>
            <Link href="/library?preset=free">Free PDF Library</Link>
            <Link href="/library?preset=deals">Daily Reading Deals</Link>
            <Link href="/library?preset=partner">Partner Editions</Link>
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
            <h4>More Topics</h4>
            <Link href="/category/self-help">Self-Help &amp; Habits</Link>
            <Link href="/category/technology">AI &amp; Technology</Link>
            <Link href="/category/finance">Finance &amp; Investing</Link>
            <Link href="/category/health">Health &amp; Sleep Protocols</Link>
            <Link href="/admin">⚙️ Admin Control Panel</Link>
          </div>
          <div>
            <h4>Help &amp; Support</h4>
            <Link href="/publish">🚀 Publish Your PDF Book</Link>
            <Link href="/account/library">Your Library</Link>
            <Link href="/cart">Your Cart</Link>
            <Link href="/admin">⚙️ Admin Dashboard</Link>
            <a>FAQ &amp; Guides</a>
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
            Terms of Service · Privacy Policy · Cookie Preferences<br />
            © 2026 Bookshelf Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
