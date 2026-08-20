'use client';

import { useEffect } from 'react';
import { coverHTML, stars, priceRow, actionBtn, flagCls } from '@/lib/helpers';
import { getClientBooks } from '@/lib/customBooks';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function QuickViewModal() {
  const { state, dispatch, addToCart, downloadFree, openPartner } = useStore();
  const router = useRouter();
  const id = state.quickViewId;
  const p = id ? getClientBooks().find(b => b.id === id) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'SET_QUICK_VIEW', id: null });
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!p) return null;

  const handleAction = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-add],[data-free],[data-ext],[data-open]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.open) { dispatch({ type: 'SET_QUICK_VIEW', id: null }); router.push(`/pdf/${btn.dataset.open}`); }
  };

  return (
    <div
      className="overlay open"
      id="qvOverlay"
      onClick={(e) => { if ((e.target as HTMLElement).id === 'qvOverlay') dispatch({ type: 'SET_QUICK_VIEW', id: null }); }}
    >
      <div className="modal" id="qvModal">
        <button className="x" onClick={() => dispatch({ type: 'SET_QUICK_VIEW', id: null })} aria-label="Close">✕</button>
        <div
          id="qvBody"
          onClick={handleAction}
          dangerouslySetInnerHTML={{
            __html: `<div class="qv">${coverHTML(p)}
              <div>
                ${p.badge ? `<span class="flag ${flagCls(p.badge)}" style="position:static;display:inline-block;margin-bottom:8px">${p.badge}</span>` : ''}
                <h2 style="font-size:23px;font-weight:800;line-height:1.15">${p.title}</h2>
                <div class="auth" style="margin:6px 0 8px">by <b style="color:var(--link)">${p.author}</b> · ${p.cat} · ${p.pages} pages</div>
                <div class="rrow">${stars(p.rating, 16)}<span class="rcount">${p.reviews.toLocaleString()} ratings</span></div>
                <p style="font-size:14.5px;color:#333;margin:10px 0 14px">${p.blurb}</p>
                ${priceRow(p)}
                <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
                  ${actionBtn(p, 'pbtn').replace('class="pbtn', 'style="width:auto;padding:10px 26px" class="pbtn')}
                  <button class="pbtn" style="width:auto;padding:10px 26px;background:#fff;border:1.5px solid var(--line)" data-open="${p.slug}">Full details →</button>
                </div>
              </div></div>`
          }}
        />
      </div>
    </div>
  );
}
