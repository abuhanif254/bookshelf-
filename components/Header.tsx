'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { P } from '@/lib/products';

export default function Header() {
  const { state, cartQty } = useStore();
  const [query, setQuery] = useState('');
  const [sugOpen, setSugOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const router = useRouter();
  const sugRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevQty = useRef(0);

  const qty = cartQty();

  useEffect(() => {
    if (qty !== prevQty.current) {
      setBump(true);
      prevQty.current = qty;
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
  }, [qty]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) {
        setSugOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const runSearch = (q: string) => {
    setSugOpen(false);
    router.push(`/library?q=${encodeURIComponent(q)}`);
  };

  const suggestions = query.trim()
    ? P.filter(p =>
        (p.title + ' ' + p.author + ' ' + p.cat).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : null;

  const trending = ['deep focus', 'python', 'free', 'ai handbook', 'design'];

  return (
    <header className="hd">
      <div className="hd-top">
        <Link href="/" className="cell logo" aria-label="Bookshelf home">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--smile)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
              <path d="M6 14h6"/>
            </svg>
            <b>book<i>shelf</i></b>
          </div>
        </Link>

        <button className="cell deliver">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Instant Access<br/><b>Digital PDF Downloads ⚡</b></span>
        </button>

        <div className="sugwrap" ref={sugRef}>
          <div className="search" role="search">
            <select id="searchScope" aria-label="Search scope">
              <option>All PDFs</option>
              <option>Free</option>
              <option>Paid</option>
              <option>Partners</option>
              <option>Business</option>
              <option>Design</option>
              <option>Programming</option>
            </select>
            <input
              ref={inputRef}
              id="searchInput"
              type="text"
              placeholder='Search Bookshelf — try "focus", "python", "free"… (⌘K)'
              autoComplete="off"
              aria-label="Search PDFs"
              value={query}
              onChange={e => { setQuery(e.target.value); setSugOpen(true); }}
              onFocus={() => setSugOpen(true)}
              onKeyDown={e => { if (e.key === 'Enter') runSearch(query.trim()); }}
            />
            <button id="searchBtn" aria-label="Search" onClick={() => runSearch(query.trim())}>
              <svg viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.5"/>
                <path d="M15.5 15.5 21 21"/>
              </svg>
            </button>
          </div>

          <div className={`sug${sugOpen ? ' open' : ''}`} id="sugBox">
            {suggestions ? (
              suggestions.length > 0 ? suggestions.map(p => (
                <button key={p.id} onClick={() => { setSugOpen(false); router.push(`/pdf/${p.slug}`); }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.bg, flex: 'none', display: 'inline-block' }}></span>
                  {p.title}
                  <span className="cat">{p.type === 'free' ? 'Free' : p.type === 'affiliate' ? 'Partner' : p.cat}</span>
                </button>
              )) : (
                <div style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 14 }}>
                  No matches — press Enter to search everything.
                </div>
              )
            ) : (
              <>
                <div className="hd-lbl">Trending searches</div>
                <div style={{ padding: '0 16px' }}>
                  {trending.map(t => (
                    <button key={t} className="chip" onClick={() => { setQuery(t); runSearch(t); }}>{t}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button className="cell acct"><span>Hello, Reader</span><b>My Account ▾</b></button>
        <button className="cell acct"><span>My Orders</span><b>&amp; Downloads</b></button>
        <Link href="/cart" className="cell cartbtn" aria-label="Cart">
          <svg viewBox="0 0 24 24">
            <circle cx="9.5" cy="20" r="1.6"/>
            <circle cx="18" cy="20" r="1.6"/>
            <path d="M2.5 3.5h2.6l2.5 11.5h10.6l2.3-8H6.2"/>
          </svg>
          <span className={`n${bump ? ' bump' : ''}`} id="cartCount">{qty}</span>
          <span className="lbl">Cart</span>
        </Link>
      </div>

      <nav className="hd-sub">
        <div className="wrap">
          <button className="cell all">☰ All</button>
          <Link href="/library?preset=deals" className="cell">Today&apos;s Deals</Link>
          <Link href="/library?preset=free" className="cell">Free PDFs</Link>
          <Link href="/library?preset=best" className="cell">Best Sellers</Link>
          <Link href="/library?preset=new" className="cell">New Releases</Link>
          <Link href="/library?preset=partner" className="cell">Partner Store</Link>
          <Link href="/account/library" className="cell">My Library</Link>
          <Link href="/admin" className="cell" style={{ color: 'var(--amber)', fontWeight: 700 }}>⚙️ Admin</Link>
          <div className="right">
            <Link href="/admin" className="cell">Upload PDF</Link>
            <button className="cell" onClick={() => alert('Gift cards arrive as beautiful printable PDFs.')}>Gift Cards</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
