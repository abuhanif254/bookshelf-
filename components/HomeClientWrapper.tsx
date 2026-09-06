'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

interface HomeClientWrapperProps {
  children: React.ReactNode;
  faqs: { q: string; a: string }[];
}

const dealEnd = Date.now() + (7 * 3600 + 42 * 60 + 15) * 1000;

export default function HomeClientWrapper({ children, faqs }: HomeClientWrapperProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-nav],[data-cat],[data-preset],[data-wish]') as HTMLElement | null;
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
    <div onClick={handleAction}>
      {children}

      {/* Interactive FAQ Accordions */}
      <div className="wrap">
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
                      border: 'none',
                      cursor: 'pointer',
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

      {/* Newsletter Section */}
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
    </div>
  );
}
