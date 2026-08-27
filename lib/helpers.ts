import { Product } from './products';
import { escapeHtml, isValidHttpUrl } from './security';

export const money = (n: number): string => {
  const safeNumber = Number(n) || 0;
  const [i, f] = safeNumber.toFixed(2).split('.');
  return `<span class="price"><sup>$</sup>${Number(i).toLocaleString()}<sup>${f}</sup></span>`;
};

export const stars = (r: number, s: number = 15): string => {
  const safeRating = Math.min(5, Math.max(0, Number(r) || 0));
  const safeSize = Math.min(40, Math.max(8, Number(s) || 15));
  return `<span class="stars" style="--s:${safeSize}px" aria-label="${safeRating} out of 5">★★★★★<i style="width:${(safeRating / 5) * 100}%">★★★★★</i></span>`;
};

export const flagCls = (b: string | null): string => {
  if (!b) return '';
  if (b === 'Best Seller') return '';
  if (b === '#1 New Release') return 'new';
  if (b === "Editor's Choice") return 'edit';
  if (b === 'Partner Pick') return 'partner';
  return '';
};

export const getFallbackDesign = (title: string = '') => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const bgs = ['#0f2a43', '#1e3a8a', '#1e40af', '#3730a3', '#4c1d95', '#6b21a8', '#831843', '#881337', '#7f1d1d', '#713f12', '#064e3b', '#134e4a', '#164e63', '#0f172a'];
  const acs = ['#f59e0b', '#38bdf8', '#fb7185', '#34d399', '#a78bfa', '#fcd34d', '#4ade80'];
  const pats = ['p-dots', 'p-lines', 'p-grid', 'p-rings', 'p-blocks'];
  
  return {
    bg: bgs[absHash % bgs.length],
    ac: acs[absHash % acs.length],
    pat: pats[absHash % pats.length],
    fg: '#ffffff'
  };
};

export const coverHTML = (p: Product, size: string = ''): string => {
  const img = (p.coverImage || p.coverUrl || '').trim();
  const safeTitle = escapeHtml(p.title);
  const safeAuthor = escapeHtml(p.author);
  const safeCat = escapeHtml(p.cat);
  const safeSub = escapeHtml(p.sub);
  const safeSize = ['sm', 'md', 'lg'].includes(size) ? size : '';

  const fallback = getFallbackDesign(p.title);
  
  // If the book has the exact default database colors injected by supabaseDb.ts, use our unique deterministic fallback instead
  const isDefaultBg = !p.bg || p.bg === '#0f2a43';
  const isDefaultAc = !p.ac || p.ac === '#f59e0b';
  const isDefaultPat = !p.pat || p.pat === 'p-rings';

  const safeBg = escapeHtml(isDefaultBg ? fallback.bg : p.bg);
  const safeFg = escapeHtml(p.fg || fallback.fg);
  const safeAc = escapeHtml(isDefaultAc ? fallback.ac : p.ac);
  const safePat = escapeHtml(isDefaultPat ? fallback.pat : p.pat);
  const safePages = Number(p.pages) || 80;
  const safeSlug = escapeHtml(p.slug);

  let imgHTML = '';
  if (img) {
    let resolvedImg = img;
    const driveMatch = img.match(/\/d\/([a-zA-Z0-9_-]+)/) || img.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      resolvedImg = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    if (isValidHttpUrl(resolvedImg)) {
      const cleanImgUrl = resolvedImg.replace('&source=gbs_api', '');
      const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(cleanImgUrl)}&w=400&output=webp`;
      const safeImgUrl = escapeHtml(proxiedUrl);
      imgHTML = `<img src="${safeImgUrl}" alt="${safeTitle}" crossorigin="anonymous" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:10;" loading="lazy" onerror="this.style.display='none';" />`;
    }
  }

  return `<a href="/pdf/${safeSlug}" class="coverwrap" data-open="${safeSlug}" style="cursor:pointer; display:block;">
    <div class="cover ${safeSize ? 'cover--' + safeSize : ''}" style="--cbg:${safeBg};--fg:${safeFg};--cac:${safeAc}; position:relative; overflow:hidden;">
      <div class="pat ${safePat}"></div><span class="cac"></span>
      <span class="ccat">${safeCat}</span>
      <div><div class="cttl">${safeTitle}</div>${safeSize === 'lg' ? `<div class="csub">${safeSub}</div>` : ''}</div>
      <div>
        <div class="caut">${safeAuthor}</div>
        <div class="cfoot"><span class="cpdf">PDF</span><span class="cpg">${safePages} pages</span></div>
      </div>
      ${imgHTML}
      <div style="position:absolute;inset:0;box-shadow:inset 10px 0 14px -10px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,0.08);pointer-events:none;z-index:11;"></div>
    </div>
  </a>`;
};

export const priceRow = (p: Product): string => {
  if (p.type === 'free') return `<div class="prow"><span class="price free">Free</span><span class="listp">$${(p.list || 29).toFixed(2)}</span></div>`;
  if (p.type === 'affiliate') return `<div class="prow"><span class="partn"><b>$${p.price}</b> at ${escapeHtml(p.partner || 'Partner')}</span></div>`;
  const save = p.list ? Math.round((1 - p.price / p.list) * 100) : 0;
  return `<div class="prow">${money(p.price)}${p.list ? `<span class="listp">$${p.list.toFixed(2)}</span><span class="save">−${save}%</span>` : ''}</div>`;
};

export const actionBtn = (p: Product, cls: string = 'pbtn'): string => {
  const safeId = Number(p.id) || 0;
  const safeCls = escapeHtml(cls);
  if (p.type === 'free') return `<button class="${safeCls} free" data-free="${safeId}">⤓ Download free PDF</button>`;
  if (p.type === 'affiliate') return `<button class="${safeCls} ext" data-ext="${safeId}">View at ${escapeHtml(p.partner || 'Partner')} ↗</button>`;
  return `<button class="${safeCls} cart" data-add="${safeId}">Add to Cart</button>`;
};

export const cardHTML = (p: Product, rank: number | null = null, deal: boolean = false, wishlistIds: Set<number> = new Set()): string => {
  const safeId = Number(p.id) || 0;
  const safeSlug = escapeHtml(p.slug);
  const safeTitle = escapeHtml(p.title);
  const safeAuthor = escapeHtml(p.author);
  const safeBought = escapeHtml(p.bought || 'Instant download');
  const safeReviews = (Number(p.reviews) || 120).toLocaleString();

  const flag = p.badge
    ? `<span class="flag ${flagCls(p.badge)}">${rank ? '#' + rank + ' ' : ''}${escapeHtml(p.badge)}</span>`
    : rank ? `<span class="flag">#${rank} Best Seller</span>` : '';

  return `<article class="pcard">
    ${flag}
    <button class="heart ${wishlistIds.has(safeId) ? 'on' : ''}" data-wish="${safeId}" aria-label="Add to wishlist"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.7-10-9.3C.3 8.6 2.4 4.5 6.2 4.5c2.2 0 3.9 1.2 5.8 3.4 1.9-2.2 3.6-3.4 5.8-3.4 3.8 0 5.9 4.1 4.2 7.2C19.5 16.3 12 21 12 21z"/></svg></button>
    <button class="qview" data-qv="${safeId}">Quick view</button>
    ${coverHTML(p)}
    <h3 class="ttl"><a href="/pdf/${safeSlug}" data-open="${safeSlug}">${safeTitle}</a></h3>
    <div class="auth">by <b>${safeAuthor}</b></div>
    <div class="rrow">${stars(p.rating)}<a href="/pdf/${safeSlug}#reviews" class="rcount" data-open="${safeSlug}">${safeReviews}</a></div>
    <div class="bought">${safeBought}</div>
    ${deal ? `<span class="deal-timer">⏱ Deal ends in <span class="dt">--:--:--</span></span>` : ''}
    ${priceRow(p)}
    ${actionBtn(p)}
  </article>`;
};
