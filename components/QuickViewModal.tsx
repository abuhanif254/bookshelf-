'use client';

import { useEffect, useState } from 'react';
import { coverHTML, stars, priceRow, actionBtn, flagCls, cleanTitle } from '@/lib/helpers';
import { getClientBooks } from '@/lib/customBooks';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { usePdfReader } from '@/components/PdfReaderWrapper';

export default function QuickViewModal() {
  const { state, dispatch, addToCart, downloadFree, openPartner } = useStore();
  const { openReader } = usePdfReader();
  const router = useRouter();
  const id = state.quickViewId;

  const [book, setBook] = useState<Product | null>(() => {
    return id ? getClientBooks().find(b => b.id === id) || null : null;
  });
  const [loading, setLoading] = useState<boolean>(!book && !!id);

  useEffect(() => {
    if (!id) {
      setBook(null);
      setLoading(false);
      return;
    }

    const local = getClientBooks().find(b => b.id === id);
    if (local) {
      setBook(local);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.book) {
          setBook(data.book);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SET_QUICK_VIEW', id: null });
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!id) return null;

  const handleAction = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-add],[data-free],[data-ext],[data-open],[data-read]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.read && p) {
      dispatch({ type: 'SET_QUICK_VIEW', id: null });
      openReader(p);
      return;
    }
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.open) {
      dispatch({ type: 'SET_QUICK_VIEW', id: null });
      router.push(`/pdf/${btn.dataset.open}`);
    }
  };

  const p = book;

  return (
    <div
      className="overlay open"
      id="qvOverlay"
      onClick={(e) => { if ((e.target as HTMLElement).id === 'qvOverlay') dispatch({ type: 'SET_QUICK_VIEW', id: null }); }}
    >
      <div className="modal" id="qvModal" style={{ maxWidth: 680 }}>
        <button className="x" onClick={() => dispatch({ type: 'SET_QUICK_VIEW', id: null })} aria-label="Close">✕</button>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="sug-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading book details…</p>
          </div>
        ) : p ? (
          <div
            id="qvBody"
            onClick={handleAction}
            dangerouslySetInnerHTML={{
              __html: `<div class="qv">${coverHTML(p)}
                <div>
                  ${p.badge ? `<span class="flag ${flagCls(p.badge)}" style="position:static;display:inline-block;margin-bottom:8px">${p.badge}</span>` : ''}
                  <h2 style="font-size:22px;font-weight:800;line-height:1.2;color:#0f172a">${cleanTitle(p.title)}</h2>
                  <div class="auth" style="margin:6px 0 8px;font-size:13.5px">by <b style="color:var(--link)">${p.author}</b> · ${p.cat} · ${p.pages || 80} pages</div>
                  <div class="rrow">${stars(p.rating, 16)}<span class="rcount">${(p.reviews || 120).toLocaleString()} ratings</span></div>
                  <p style="font-size:14px;color:#334155;margin:10px 0 14px;line-height:1.5">${p.blurb || (p.sub ? p.sub : 'Verified digital edition with DRM-free reading and instant direct download access.')}</p>
                  ${priceRow(p)}
                  <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
                    ${actionBtn(p, 'pbtn').replace('class="pbtn', 'style="width:auto;padding:10px 22px" class="pbtn')}
                    <button class="pbtn" style="width:auto;padding:10px 18px;background:#f8fafc;border:1.5px solid var(--line);color:#0f172a" data-read="1">📖 Sample Preview</button>
                    <button class="pbtn" style="width:auto;padding:10px 18px;background:#fff;border:1.5px solid var(--line);color:#0f172a" data-open="${p.slug}">Full Details →</button>
                  </div>
                </div></div>`
            }}
          />
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>Book details could not be loaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}
