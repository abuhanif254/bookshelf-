import { Product } from './products';

export const money = (n: number): string => {
  const [i, f] = n.toFixed(2).split('.');
  return `<span class="price"><sup>$</sup>${Number(i).toLocaleString()}<sup>${f}</sup></span>`;
};

export const stars = (r: number, s: number = 15): string =>
  `<span class="stars" style="--s:${s}px" aria-label="${r} out of 5">★★★★★<i style="width:${(r / 5) * 100}%">★★★★★</i></span>`;

export const flagCls = (b: string | null): string => {
  if (!b) return '';
  if (b === 'Best Seller') return '';
  if (b === '#1 New Release') return 'new';
  if (b === "Editor's Choice") return 'edit';
  if (b === 'Partner Pick') return 'partner';
  return '';
};

export const coverHTML = (p: Product, size: string = ''): string => {
  return `<div class="coverwrap"><div class="cover ${size ? 'cover--' + size : ''}" style="--cbg:${p.bg};--fg:${p.fg};--cac:${p.ac}">
    <div class="pat ${p.pat}"></div><span class="cac"></span>
    <span class="ccat">${p.cat}</span>
    <div><div class="cttl">${p.title}</div>${size === 'lg' ? `<div class="csub">${p.sub}</div>` : ''}</div>
    <div><div class="caut">${p.author}</div>
    <div class="cfoot"><span class="cpdf">PDF</span><span class="cpg">${p.pages} pages</span></div></div>
  </div></div>`;
};

export const priceRow = (p: Product): string => {
  if (p.type === 'free') return `<div class="prow"><span class="price free">Free</span><span class="listp">$${p.list!.toFixed(2)}</span></div>`;
  if (p.type === 'affiliate') return `<div class="prow"><span class="partn"><b>$${p.price}</b> at ${p.partner}</span></div>`;
  const save = p.list ? Math.round((1 - p.price / p.list) * 100) : 0;
  return `<div class="prow">${money(p.price)}${p.list ? `<span class="listp">$${p.list.toFixed(2)}</span><span class="save">−${save}%</span>` : ''}</div>`;
};

export const actionBtn = (p: Product, cls: string = 'pbtn'): string => {
  if (p.type === 'free') return `<button class="${cls} free" data-free="${p.id}">⤓ Download free PDF</button>`;
  if (p.type === 'affiliate') return `<button class="${cls} ext" data-ext="${p.id}">View at ${p.partner} ↗</button>`;
  return `<button class="${cls} cart" data-add="${p.id}">Add to Cart</button>`;
};

export const cardHTML = (p: Product, rank: number | null = null, deal: boolean = false, wishlistIds: Set<number> = new Set()): string => {
  const flag = p.badge
    ? `<span class="flag ${flagCls(p.badge)}">${rank ? '#' + rank + ' ' : ''}${p.badge}</span>`
    : rank ? `<span class="flag">#${rank} Best Seller</span>` : '';
  return `<article class="pcard">
    ${flag}
    <button class="heart ${wishlistIds.has(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Add to wishlist"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.7-10-9.3C.3 8.6 2.4 4.5 6.2 4.5c2.2 0 3.9 1.2 5.8 3.4 1.9-2.2 3.6-3.4 5.8-3.4 3.8 0 5.9 4.1 4.2 7.2C19.5 16.3 12 21 12 21z"/></svg></button>
    <button class="qview" data-qv="${p.id}">Quick view</button>
    ${coverHTML(p)}
    <h3 class="ttl"><a data-open="${p.slug}">${p.title}</a></h3>
    <div class="auth">by <b>${p.author}</b></div>
    <div class="rrow">${stars(p.rating)}<a class="rcount" data-open="${p.slug}">${p.reviews.toLocaleString()}</a></div>
    <div class="bought">${p.bought}</div>
    ${deal ? `<span class="deal-timer">⏱ Deal ends in <span class="dt">--:--:--</span></span>` : ''}
    ${priceRow(p)}
    ${actionBtn(p)}
  </article>`;
};
