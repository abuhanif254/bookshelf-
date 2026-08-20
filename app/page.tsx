'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { P, Product } from '@/lib/products';
import { cardHTML, coverHTML, stars } from '@/lib/helpers';
import HeroCarousel from '@/components/HeroCarousel';
import ScrollSection from '@/components/ScrollSection';
import { BUNDLES } from '@/lib/bundles';
import { getClientBooks, saveClientBooks } from '@/lib/customBooks';

const dealEnd = Date.now() + (7 * 3600 + 42 * 60 + 15) * 1000;

export default function HomePage() {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [allBooks, setAllBooks] = useState<Product[]>(P);

  useEffect(() => {
    const local = getClientBooks();
    if (local && local.length > 0) setAllBooks(local);

    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.books) && data.books.length > 0) {
          setAllBooks(data.books);
          saveClientBooks(data.books);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Deal countdown
  useEffect(() => {
    const tick = () => {
      let s = Math.max(0, Math.floor((dealEnd - Date.now()) / 1000));
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      document.querySelectorAll('.dt').forEach(el => el.textContent = `${h}:${m}:${ss}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-nav],[data-cat],[data-preset]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.qv) dispatch({ type: 'SET_QUICK_VIEW', id: +btn.dataset.qv });
    if (btn.dataset.open) router.push(`/pdf/${btn.dataset.open}`);
    if (btn.dataset.wish) {
      const id = +btn.dataset.wish;
      dispatch({ type: 'TOGGLE_WISHLIST', id });
      toast(state.wishlist.has(id) ? 'Removed from Wishlist' : 'Added to Wishlist ♡');
    }
  };

  const getBook = (id: number) => allBooks.find(b => b.id === id);

  // Data
  const deals = allBooks.filter(p => p.list && p.price > 0).sort((a, b) => (1 - b.price / b.list!) - (1 - a.price / a.list!));
  const freeBooks = allBooks.filter(p => p.type === 'free');
  const bestSellers = [...allBooks].filter(p => p.type !== 'affiliate').sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  const newReleases = [...allBooks].slice(0, 8);
  const editorPicks = [4, 1, 10, 20, 15];

  const dealsHTML = deals.map(p => cardHTML(p, null, true, state.wishlist)).join('');
  const freeHTML = freeBooks.map(p => cardHTML(p, null, false, state.wishlist)).join('');
  const bestHTML = bestSellers.map((p, i) => cardHTML(p, i + 1, false, state.wishlist)).join('');
  const newHTML = newReleases.map(p => cardHTML(p, null, false, state.wishlist)).join('');

  const editorStackHTML = [4, 10, 1].map(id => getBook(id) ? coverHTML(getBook(id)!) : '').join('');
  const edlistHTML = editorPicks.map((id, i) => {
    const p = getBook(id);
    if (!p) return '';
    return `<div class="row" data-open="${p.slug}"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><div class="t">${p.title}</div><div class="a">${p.author} · ${p.cat}</div></div><span class="pr">${p.type === 'free' ? 'Free' : '$' + p.price.toFixed(2)}</span></div>`;
  }).join('');

  const quadCards = [
    { title: 'Best Sellers in Productivity', ids: [1, 15, 17, 2], href: '/library?cat=Productivity', label: 'See more in Productivity →' },
    { title: 'Free this week', ids: [5, 7, 11, 14], href: '/library?preset=free', label: 'Browse all free PDFs →' },
    { title: 'Most-wished-for Design PDFs', ids: [4, 10, 16, 14], href: '/library?cat=Design', label: 'See more in Design →' },
    { title: 'Trending Coding & AI Guides', ids: [20, 5, 8, 12], href: '/category/programming', label: 'Explore Programming PDFs →' },
  ];

  const faqs = [
    {
      q: 'Are all PDF books on Bookshelf really 100% free?',
      a: 'Yes! Every free digital PDF handbook, cheat sheet, and field manual on Bookshelf is 100% free to download. We never ask for credit cards, subscriptions, or recurring memberships.',
    },
    {
      q: 'How does the ad-supported download unlock work?',
      a: 'To keep high-speed downloads completely free for readers worldwide, we display a short 5-to-10 second sponsor countdown screen before download. These sponsors cover cloud server bandwidth and direct Google Drive stream hosting costs.',
    },
    {
      q: 'Can I read downloaded PDFs on Kindle, iPad, or mobile?',
      a: 'Yes! All downloaded PDFs are DRM-free and formatted to universal standards (Letter and A4 dimensions). You can open them in Apple Books, Kindle, Google Play Books, Adobe Acrobat, or any third-party PDF reader.',
    },
    {
      q: 'Can I read the books online without downloading?',
      a: 'Yes! Every book features a built-in "Read Online" web viewer with dark mode, zoom controls, full-text search, and ambient focus soundscapes.',
    },
    {
      q: 'How does the AI Study Assistant work?',
      a: 'On each book details page, you can open our interactive AI Study Companion (powered by Google Gemini). It can summarize chapters, answer questions, provide real-world examples, and quiz your retention.',
    },
    {
      q: 'Can I publish or distribute my own PDF book?',
      a: 'Yes! Authors, educators, and indie developers can visit our Creator Portal (/publish) to submit free developer cheat sheets, startup guides, or educational materials to reach thousands of readers.',
    },
  ];

  const handleNewsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = input?.value;
    if (!email) return;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast('You\'re on the VIP list! 🎉', data.message);
        form.reset();
      } else {
        toast('Notice', data.message || 'Subscription failed', true);
      }
    } catch {
      toast('You\'re in! 🎉', '"The 90-Minute Deep Work Sprint" lands Friday.');
      form.reset();
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bookshelf',
    url: 'https://bookshelf.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bookshelf.com/library?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <HeroCarousel stacks={[[1, 5, 12], [7, 11, 18], [3, 9, 13], [20, 6, 12]]} />

      <div className="wrap">
        {/* Quad category cards */}
        <div className="quad">
          {quadCards.map((q, i) => (
            <div key={i} className="qcard rv">
              <h3>{q.title}</h3>
              <div
                className="qgrid"
                onClick={handleAction}
                dangerouslySetInnerHTML={{
                  __html: q.ids.map(id => {
                    const p = getBook(id)!;
                    return `<div class="qitem" data-open="${p.slug}">${coverHTML(p, 'sm')}<span>${p.title}</span></div>`;
                  }).join('')
                }}
              />
              <Link href={q.href} className="more">{q.label}</Link>
            </div>
          ))}
        </div>

        {/* Today's Deals */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>Today&apos;s Deals</h2>
            <span className="sub">Prices reset at midnight</span>
            <Link href="/library?preset=deals">See all deals →</Link>
          </div>
          <ScrollSection id="sc-deals" html={dealsHTML} onAction={handleAction} />
        </section>
      </div>

      {/* Modern High-Trust Value Ribbon */}
      <div className="ribbon rv">
        <div className="wrap">
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div><b>100% Free &amp; DRM-Free</b><span>Zero cards or subscriptions</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/></svg>
            <div><b>Instant Cloud Stream</b><span>High-speed direct PDF links</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>
            <div><b>AI Study Companion</b><span>24/7 chapter breakdowns</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            <div><b>Read Anywhere</b><span>Phone, iPad, Kindle &amp; PC</span></div>
          </div>
        </div>
      </div>

      <div className="wrap">
        {/* Curated Multi-Book Bundles Showcase */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>📦 Curated Multi-Book PDF Bundles</h2>
            <span className="sub">Complete 3-book mastery collections</span>
            <Link href="/bundles/indie-founder-stack">Browse all bundles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
            {BUNDLES.map(b => (
              <div
                key={b.slug}
                style={{
                  background: b.bg,
                  borderRadius: 14,
                  padding: 24,
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              >
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 8px', borderRadius: 4 }}>
                    {b.badge}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '10px 0 6px' }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4, margin: '0 0 14px' }}>{b.tagline}</p>
                </div>
                <Link
                  href={`/bundles/${b.slug}`}
                  style={{
                    display: 'inline-block',
                    textAlign: 'center',
                    background: 'var(--amber)',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: 13,
                    padding: '10px 16px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  Explore 3-Book Bundle ↗
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Free library */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>The Free PDF Library</h2>
            <span className="sub">100% free, forever</span>
            <Link href="/library?preset=free">See all 40+ free titles →</Link>
          </div>
          <ScrollSection id="sc-free" html={freeHTML} onAction={handleAction} />
        </section>

        {/* Best sellers */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>Best Sellers</h2>
            <span className="sub">Ranked by readers this month</span>
            <Link href="/library?preset=best">See the full list →</Link>
          </div>
          <ScrollSection id="sc-best" html={bestHTML} onAction={handleAction} />
        </section>

        {/* New Releases */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>⚡ New Releases &amp; Field Manuals</h2>
            <span className="sub">Freshly added to the catalog this month</span>
            <Link href="/library?preset=new">Explore all new titles →</Link>
          </div>
          <ScrollSection id="sc-new" html={newHTML} onAction={handleAction} />
        </section>

        {/* Editor's shelf */}
        <section className="sec rv">
          <div className="editor">
            <div className="stack" dangerouslySetInnerHTML={{ __html: editorStackHTML }} />
            <div>
              <span className="tag">The Editor&apos;s Shelf · July 2026</span>
              <h2>Five PDFs our editors actually re-read.</h2>
              <p>Not the most sold — the most <em>used</em>. Dog-eared, annotated, sent to friends. This month&apos;s shelf is about building things that last.</p>
              <div
                className="edlist"
                dangerouslySetInnerHTML={{ __html: edlistHTML }}
                onClick={handleAction}
              />
            </div>
          </div>
        </section>

        {/* How It Works in 3 Simple Steps */}
        <section className="sec rv" style={{ marginTop: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>
              Simple &amp; Transparent
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>How Free Downloads Work on Bookshelf</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '6px auto 0', maxWidth: 540 }}>
              Zero hidden paywalls, zero account friction. Here is how our ad-supported model keeps knowledge free forever.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>Step 1</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 0 6px' }}>Choose Any PDF</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Browse our curated catalog across programming, indie business, design, and deep focus.
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏱️</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>Step 2</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 0 6px' }}>Quick Sponsor Unlock</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Watch a brief 5–8s sponsor card that covers high-speed cloud bandwidth and direct Google Drive hosting.
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📥</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Step 3</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 0 6px' }}>Instant DRM-Free Download</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Get direct high-speed PDF stream to your iPad, Kindle, smartphone, or PC. No DRM lock-in.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section with Google FAQPage Schema */}
        <section className="sec rv" style={{ marginTop: 40, marginBottom: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>
              Got Questions?
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--ink)' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '6px auto 0', maxWidth: 540 }}>
              Everything you need to know about our free PDF library, DRM-free downloads, and AI study companion.
            </p>
          </div>

          <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      fontWeight: 800,
                      fontSize: 15,
                      color: 'var(--ink)',
                      background: isOpen ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: 18, color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', color: '#475569', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Newsletter */}
      <div className="news rv">
        <div className="wrap">
          <div>
            <h2>One free PDF, every Friday.</h2>
            <p>Join 48,000 readers. This week: <b>&ldquo;The 90-Minute Deep Work Sprint&rdquo;</b> (128 pages, $14 value — free).</p>
          </div>
          <form onSubmit={handleNewsSubmit}>
            <input type="email" required placeholder="you@example.com" aria-label="Email address" />
            <button type="submit">Send me the free PDF</button>
          </form>
        </div>
      </div>
    </>
  );
}
