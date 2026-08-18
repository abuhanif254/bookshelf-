'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { byId, P } from '@/lib/products';
import { coverHTML, cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import ScrollSection from '@/components/ScrollSection';

export default function CartPage() {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();

  const cartQty = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const ids = Object.keys(state.cart).map(Number);
  const items = ids.map(id => ({ p: byId(id)!, q: state.cart[id] })).filter(x => x.p);
  const subtotal = items.reduce((s, { p, q }) => s + p.price * q, 0);
  const savings = items.reduce((s, { p, q }) => s + ((p.list ? p.list - p.price : 0) * q), 0);
  const also = P.filter(p => !state.cart[p.id] && p.type === 'paid').sort((a, b) => b.reviews - a.reviews).slice(0, 6);

  const handleAction = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-toast]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.qv) dispatch({ type: 'SET_QUICK_VIEW', id: +btn.dataset.qv });
    if (btn.dataset.open) router.push(`/pdf/${btn.dataset.open}`);
    if (btn.dataset.toast) toast('Heads up', btn.dataset.toast, true);
  };

  const alsoHTML = also.map(p => cardHTML(p, null, false, state.wishlist)).join('');

  if (!ids.length) {
    return (
      <div className="wrap">
        <div className="cartlist" style={{ margin: '20px 0 60px' }}>
          <div className="cart-empty">
            <svg viewBox="0 0 24 24">
              <circle cx="9.5" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/>
              <path d="M2.5 3.5h2.6l2.5 11.5h10.6l2.3-8H6.2"/>
            </svg>
            <h2>Your Bookshelf cart is empty</h2>
            <p>PDFs are delivered instantly — your next great read is 30 seconds away.</p>
            <Link href="/library?preset=deals" className="btn-hero" style={{ background: 'var(--cart)', borderColor: '#fcd200' }}>Shop today&apos;s deals</Link>
            {' '}
            <Link href="/library?preset=free" className="btn-ghost" style={{ borderColor: 'var(--ink)', color: 'var(--ink)', marginLeft: 10 }}>Browse free PDFs</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" onClick={handleAction}>
      <div className="cartpg">
        <div className="cartlist">
          <h1>Shopping Cart <span>{cartQty} item{cartQty !== 1 ? 's' : ''}</span></h1>

          {items.map(({ p, q }) => (
            <div key={p.id} className="citem">
              <div dangerouslySetInnerHTML={{ __html: coverHTML(p) }} />
              <div>
                <h3><a data-open={p.slug} style={{ color: '#0f1111', cursor: 'pointer' }}>{p.title}</a></h3>
                <div className="ca">by {p.author} · PDF · {p.pages} pages</div>
                <div className="stock">✓ In stock — instant digital delivery</div>
                <div className="acts">
                  {p.type === 'free' ? (
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    <div className="qty" style={{ margin: 0 }}>
                      <button onClick={() => { dispatch({ type: 'UPDATE_QTY', id: p.id, delta: -1 }); }}>−</button>
                      <span>{q}</span>
                      <button onClick={() => { dispatch({ type: 'UPDATE_QTY', id: p.id, delta: 1 }); }}>+</button>
                    </div>
                  )}
                  <span>|</span>
                  <button onClick={() => { dispatch({ type: 'REMOVE_FROM_CART', id: p.id }); toast('Removed from cart'); }}>Delete</button>
                  <span>|</span>
                  <button data-toast="Saved for later ♡">Save for later</button>
                </div>
              </div>
              <div className="right">
                <span className="lp">{p.type === 'free' ? 'Free' : '$' + (p.price * q).toFixed(2)}</span>
                {q > 1 && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>${p.price.toFixed(2)} each</span>}
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'right', paddingTop: 16, fontSize: 17 }}>
            Subtotal ({cartQty} items): <b style={{ fontFamily: 'var(--disp)', fontSize: 20 }}>${subtotal.toFixed(2)}</b>
          </div>
        </div>

        <div className="summary">
          <div className="ok">
            <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.5L6.5 12l1.4-1.4 2.9 2.9 5.3-5.3 1.4 1.4-6.7 6.9z"/></svg>
            <span>Order qualifies for <b>FREE instant delivery</b> — download links arrive in seconds.</span>
          </div>
          <div className="sub"><span>Items:</span><span>${subtotal.toFixed(2)}</span></div>
          {savings > 0 && <div className="save-line">You&apos;re saving ${savings.toFixed(2)} on this order 🎉</div>}
          <div className="tot"><span>Total:</span><span style={{ color: 'var(--price)' }}>${subtotal.toFixed(2)}</span></div>
          <button className="bb-btn bb-cart" style={{ fontSize: 15 }} data-toast="Demo: Stripe checkout wires up in the Next.js build 🚀">Proceed to checkout</button>
          <button className="bb-btn" style={{ background: '#fff', border: '1.5px solid var(--line)' }} onClick={() => router.push('/library')}>Continue shopping</button>
          <div className="paychips" style={{ justifyContent: 'center' }}>
            {['VISA', 'MC', 'AMEX', 'PAYPAL', 'APPLE PAY'].map(c => <span key={c}>{c}</span>)}
          </div>
          <div className="bb-sec">
            <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
            <span>30-day money-back guarantee on every PDF.</span>
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingBottom: 60 }}>
        <div className="sec-hd"><h2>Customers with items in their cart also bought</h2></div>
        <ScrollSection id="sc-also" html={alsoHTML} onAction={handleAction} />
      </div>
    </div>
  );
}
