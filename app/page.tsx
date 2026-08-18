'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { P, byId } from '@/lib/products';
import { cardHTML, coverHTML, stars, priceRow, actionBtn, flagCls } from '@/lib/helpers';
import HeroCarousel from '@/components/HeroCarousel';
import ScrollSection from '@/components/ScrollSection';

const dealEnd = Date.now() + (7 * 3600 + 42 * 60 + 15) * 1000;

export default function HomePage() {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const rvRefs = useRef<HTMLElement[]>([]);

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

  // Data
  const deals = P.filter(p => p.list && p.price > 0).sort((a, b) => (1 - b.price / b.list!) - (1 - a.price / a.list!));
  const freeBooks = P.filter(p => p.type === 'free');
  const bestSellers = [...P].filter(p => p.type !== 'affiliate').sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  const partners = P.filter(p => p.type === 'affiliate');
  const editorPicks = [4, 1, 10, 20, 15];

  const dealsHTML = deals.map(p => cardHTML(p, null, true, state.wishlist)).join('');
  const freeHTML = freeBooks.map(p => cardHTML(p, null, false, state.wishlist)).join('');
  const bestHTML = bestSellers.map((p, i) => cardHTML(p, i + 1, false, state.wishlist)).join('');

  const partnerHTML = partners.map(p => `
    <div class="pwide">
      ${coverHTML(p)}
      <div>
        <span class="flag partner" style="position:static;display:inline-block;margin-bottom:8px">Partner Pick</span>
        <h4><a data-open="${p.slug}" style="color:#0f1111">${p.title}</a></h4>
        <div class="pmeta">${stars(p.rating, 13)} <span class="rcount">${p.reviews.toLocaleString()}</span> · ${p.pages} pages</div>
        ${actionBtn(p, 'pbtn ext')}
        <div class="pnote">🔗 Sold &amp; fulfilled by <b>&nbsp;${p.partner}</b></div>
      </div>
    </div>`).join('');

  const editorStackHTML = [4, 10, 1].map(id => coverHTML(byId(id)!)).join('');
  const edlistHTML = editorPicks.map((id, i) => {
    const p = byId(id)!;
    return `<div class="row" data-open="${p.slug}"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><div class="t">${p.title}</div><div class="a">${p.author} · ${p.cat}</div></div><span class="pr">${p.type === 'free' ? 'Free' : '$' + p.price.toFixed(2)}</span></div>`;
  }).join('');

  const quadCards = [
    { title: 'Best Sellers in Productivity', ids: [1, 15, 17, 2], href: '/library?cat=Productivity', label: 'See more in Productivity →' },
    { title: 'Free this week', ids: [5, 7, 11, 14], href: '/library?preset=free', label: 'Browse all free PDFs →' },
    { title: 'Most-wished-for Design PDFs', ids: [4, 10, 16, 14], href: '/library?cat=Design', label: 'See more in Design →' },
    { title: 'Top picks from partners', ids: [3, 9, 13, 16], href: '/library?preset=partner', label: 'Visit the Partner Store →' },
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

  return (
    <>
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
                    const p = byId(id)!;
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

      {/* Value ribbon */}
      <div className="ribbon rv">
        <div className="wrap">
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/></svg>
            <div><b>Instant delivery</b><span>Download link in seconds</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4"/></svg>
            <div><b>Lifetime updates</b><span>New editions, free forever</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            <div><b>Read anywhere</b><span>Phone, tablet, e-reader</span></div>
          </div>
          <div className="it">
            <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
            <div><b>Secure checkout</b><span>256-bit encrypted payments</span></div>
          </div>
        </div>
      </div>

      <div className="wrap">
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

        {/* Partner store */}
        <section className="sec rv">
          <div className="sec-hd">
            <h2>From Our Partners</h2>
            <span className="sub">Sold on partner sites, curated by us</span>
            <Link href="/library?preset=partner">Visit the Partner Store →</Link>
          </div>
          <ScrollSection id="sc-partner" html={partnerHTML} onAction={handleAction} noArrows />
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
