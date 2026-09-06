import Link from 'next/link';
import { getAllBooks } from '@/lib/db';
import { getSupabaseBooksPaginated, getSupabaseTopBooks } from '@/lib/supabaseDb';
import { P, Product } from '@/lib/products';
import { cardHTML, coverHTML } from '@/lib/helpers';
import HeroCarousel from '@/components/HeroCarousel';
import ScrollSection from '@/components/ScrollSection';
import { FAQJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { BUNDLES } from '@/lib/bundles';
import { getBaseUrl } from '@/lib/url';
import HomeClientWrapper from '@/components/HomeClientWrapper';

// Cache homepage at CDN edge for 24 hours with background ISR
export const revalidate = 86400;

export default async function HomePage() {
  const baseUrl = getBaseUrl();

  // Fetch top books efficiently from Supabase
  let allBooks: Product[] = [];
  try {
    const res = await getSupabaseBooksPaginated({ page: 1, limit: 48, sort: 'downloads' });
    if (res && res.books.length > 0) {
      allBooks = res.books;
    }
  } catch {}

  if (allBooks.length === 0) {
    allBooks = getAllBooks();
  }

  // Segment books for targeted homepage sections
  const deals = allBooks.filter(p => p.list && p.price > 0).sort((a, b) => (1 - b.price / b.list!) - (1 - a.price / a.list!));
  const freeBooks = allBooks.filter(p => p.type === 'free');
  const bestSellers = [...allBooks].filter(p => p.type !== 'affiliate').sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 8);
  const newReleases = [...allBooks].slice(0, 8);
  const editorPicks = [4, 1, 10, 20, 15];

  const getBook = (id: number) => allBooks.find(b => b.id === id) || P.find(b => b.id === id);

  const dealsHTML = (deals.length > 0 ? deals : allBooks.slice(0, 6)).map(p => cardHTML(p, null, true)).join('');
  const freeHTML = (freeBooks.length > 0 ? freeBooks : allBooks.slice(0, 8)).map(p => cardHTML(p, null, false)).join('');
  const bestHTML = bestSellers.map((p, i) => cardHTML(p, i + 1, false)).join('');
  const newHTML = newReleases.map(p => cardHTML(p, null, false)).join('');

  const editorStackHTML = [4, 10, 1].map(id => getBook(id) ? coverHTML(getBook(id)!) : '').join('');
  const edlistHTML = editorPicks.map((id, i) => {
    const p = getBook(id);
    if (!p) return '';
    return `<a href="/pdf/${p.slug}" class="row" data-open="${p.slug}" style="text-decoration:none; display:flex;"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><div class="t">${p.title}</div><div class="a">${p.author} · ${p.cat}</div></div><span class="pr">${p.type === 'free' ? 'Free' : '$' + p.price.toFixed(2)}</span></a>`;
  }).join('');

  const categories = [...new Set(allBooks.map(b => b.cat))];
  const cat1 = categories[0] || 'Productivity';
  const cat2 = categories[1] || 'Design';
  const cat3 = categories[2] || 'Programming';

  const quadCards = [
    { title: `Best Sellers in ${cat1}`, ids: allBooks.filter(b => b.cat === cat1).slice(0, 4).map(b => b.id), href: `/library?cat=${encodeURIComponent(cat1)}`, label: `See more in ${cat1} →` },
    { title: 'Free this week', ids: (freeBooks.length > 0 ? freeBooks : allBooks).slice(0, 4).map(b => b.id), href: '/library?preset=free', label: 'Browse all free PDFs →' },
    { title: `Most-wished-for ${cat2}`, ids: allBooks.filter(b => b.cat === cat2).slice(0, 4).map(b => b.id), href: `/library?cat=${encodeURIComponent(cat2)}`, label: `See more in ${cat2} →` },
    { title: `Trending ${cat3}`, ids: allBooks.filter(b => b.cat === cat3).slice(0, 4).map(b => b.id), href: `/library?cat=${encodeURIComponent(cat3)}`, label: `Explore ${cat3} →` },
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

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bookshelf',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/library?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <FAQJsonLd faqs={faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <ItemListJsonLd
        title="Bookshelf Featured Free PDF Books"
        description="Top downloaded free PDF books, cheat sheets, and field manuals."
        url={baseUrl}
        items={bestSellers.slice(0, 10).map((b, i) => ({
          name: b.title,
          url: `${baseUrl}/pdf/${b.slug}`,
          position: i + 1,
        }))}
      />

      <HeroCarousel stacks={[[1, 5, 12], [7, 11, 18], [3, 9, 13], [20, 6, 12]]} />

      <HomeClientWrapper faqs={faqs}>
        <div className="wrap">
          {/* Multilingual Library Bar */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '16px 20px',
            border: '1px solid #e2e8f0',
            margin: '0 0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <div>
                <strong style={{ fontSize: 14, color: '#0f172a', display: 'block' }}>Global PDF Libraries (300,000+ Books)</strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>Read in your native language with instant free downloads</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href="/books/bangla" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f1f5f9', color: '#0f172a', textDecoration: 'none' }}>বাংলা (Bangla)</Link>
              <Link href="/books/hindi" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f1f5f9', color: '#0f172a', textDecoration: 'none' }}>हिन्दी (Hindi)</Link>
              <Link href="/books/urdu" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f1f5f9', color: '#0f172a', textDecoration: 'none' }}>اردو (Urdu)</Link>
              <Link href="/books/spanish" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f1f5f9', color: '#0f172a', textDecoration: 'none' }}>Español</Link>
              <Link href="/books/chinese" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#f1f5f9', color: '#0f172a', textDecoration: 'none' }}>中文 (Chinese)</Link>
              <Link href="/books/english" style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: '#0f172a', color: '#fff', textDecoration: 'none' }}>English</Link>
            </div>
          </div>

          {/* Quad category cards */}
          <div className="quad">
            {quadCards.map((q, i) => (
              <div key={i} className="qcard rv">
                <h3>{q.title}</h3>
                <div
                  className="qgrid"
                  dangerouslySetInnerHTML={{
                    __html: q.ids.map(id => {
                      const p = getBook(id);
                      if (!p) return '';
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
              <span className="sub">Prices reset at midnight (<span className="dt">07:42:15</span>)</span>
              <Link href="/library?preset=deals">See all deals →</Link>
            </div>
            <ScrollSection id="sc-deals" html={dealsHTML} />
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
            <ScrollSection id="sc-free" html={freeHTML} />
          </section>

          {/* Best sellers */}
          <section className="sec rv">
            <div className="sec-hd">
              <h2>Best Sellers</h2>
              <span className="sub">Ranked by readers this month</span>
              <Link href="/library?preset=best">See the full list →</Link>
            </div>
            <ScrollSection id="sc-best" html={bestHTML} />
          </section>

          {/* New Releases */}
          <section className="sec rv">
            <div className="sec-hd">
              <h2>⚡ New Releases &amp; Field Manuals</h2>
              <span className="sub">Freshly added to the catalog this month</span>
              <Link href="/library?preset=new">Explore all new titles →</Link>
            </div>
            <ScrollSection id="sc-new" html={newHTML} />
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
        </div>
      </HomeClientWrapper>
    </>
  );
}
