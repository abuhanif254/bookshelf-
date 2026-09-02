'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, P } from '@/lib/products';
import { coverHTML, stars, money, cardHTML, flagCls } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import ScrollSection from '@/components/ScrollSection';
import { FAQItem } from '@/components/JsonLd';
import { usePdfReader } from '@/components/PdfReaderWrapper';
import AudioSummaryPlayer from '@/components/AudioSummaryPlayer';
import BookAiChat from '@/components/BookAiChat';
import BookMindmap from '@/components/BookMindmap';
import BookQuiz from '@/components/BookQuiz';
import SendToKindleModal from '@/components/SendToKindleModal';
import ReaderNotes from '@/components/ReaderNotes';
import ReadingPaceCalculator from '@/components/ReadingPaceCalculator';
import AmbientSoundPlayer from '@/components/AmbientSoundPlayer';
import { useCurrency } from '@/lib/currency';
import WriteReviewModal from '@/components/WriteReviewModal';
import { BookReview } from '@/lib/db';

function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default function ProductClient({ p, faqs }: { p: Product; faqs?: FAQItem[] }) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const { openReader } = usePdfReader();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showKindleModal, setShowKindleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsList, setReviewsList] = useState<BookReview[]>([]);
  const [currentRating, setCurrentRating] = useState(p.rating);
  const [totalReviewsCount, setTotalReviewsCount] = useState(p.reviews);

  const [allBooks, setAllBooks] = useState<Product[]>(P);
  const [authorBooks, setAuthorBooks] = useState<Product[]>([]);

  // Fetch real reviews for this book
  React.useEffect(() => {
    fetch(`/api/reviews?bookId=${p.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList(data.reviews);
        }
      })
      .catch(() => {});
  }, [p.id]);

  // Fetch only same-category books (for "Related") and same-author books â€”
  // NOT the full library. This keeps the payload tiny at any catalog size.
  React.useEffect(() => {
    const catParam = encodeURIComponent(p.cat);
    const authorSlug = p.author.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Same-category books for the "Customers who viewed this also viewed" row
    fetch(`/api/books?cat=${catParam}&limit=24`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.books) && data.books.length > 0) {
          setAllBooks(data.books);
        }
      })
      .catch(() => {});

    // Same-author books for the "More by [Author]" row
    fetch(`/api/books?author=${authorSlug}&limit=12`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.books) && data.books.length > 1) {
          setAuthorBooks(data.books.filter((b: Product) => b.id !== p.id));
        }
      })
      .catch(() => {});
  }, [p.id, p.cat, p.author]);

  const handleReviewSubmitted = (newReview: BookReview) => {
    setReviewsList(prev => [newReview, ...prev]);
    setTotalReviewsCount(prev => prev + 1);
    toast('Review Submitted! â­', 'Your review is now live.');
  };

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: 'helpful' }),
      });
      setReviewsList(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
      );
      toast('Thanks for your feedback!', 'Marked as helpful');
    } catch {}
  };

  const isAff = p.type === 'affiliate';
  const isFree = p.type === 'free';
  const save = p.list ? Math.round((1 - p.price / p.list) * 100) : 0;
  // Filter same-category books for the "Related" row (exclude current book)
  const related = allBooks.filter(x => x.id !== p.id).slice(0, 6);

  const hist = [72, 17, 6, 3, 2];
  const names: [string, string][] = [['Sofia M.', '#e8590c'], ['James T.', '#0b7285'], ['Aisha B.', '#5f3dc4']];
  const revs = [
    { t: 'Worth 10Ã— the price', b: "I finished it in one evening and applied the framework the next morning. The printable extras alone justify it. This is the kind of PDF you actually keep.", d: 'July 22, 2026' },
    { t: 'Practical, zero fluff', b: "Every chapter ends with something to do, not something to ponder. I've bought three copies for my team and we run the playbook weekly.", d: 'July 9, 2026' },
    { t: 'Great â€” with one caveat', b: "Excellent structure and beautiful layout on both tablet and print. Wish there were more advanced examples in chapter 8, but the author replies to emails, which is rare.", d: 'June 28, 2026' },
  ];

  const authorSlug = normalizeSlug(p.author);
  const catSlug = normalizeSlug(p.cat);

  const tabContents = [
    <div key="desc" dangerouslySetInnerHTML={{ __html: p.desc }} />,
    <ReaderNotes key="notes" book={p} />,
    <BookAiChat key="aichat" book={p} />,
    <BookMindmap key="mindmap" book={p} />,
    <BookQuiz key="quiz" book={p} />,
    <ul key="inside" className="feat">{p.feat.map((f, i) => <li key={i}>{f}</li>)}<li>Beautifully typeset for screen &amp; print (A4 + Letter)</li><li>Searchable text, clickable table of contents</li><li>Free lifetime updates to every new edition</li></ul>,
    <ul key="details" className="feat">
      <li><b>Format:</b> High-Res PDF (Searchable, DRM-Free)</li>
      <li><b>Page Count:</b> {p.pages} Pages</li>
      <li><b>Language:</b> English</li>
      <li><b>File Size:</b> {(p.pages * 0.09).toFixed(1)} MB</li>
      <li><b>Hosting &amp; Stream:</b> High-Speed Google Drive Direct Stream</li>
      <li><b>Compatibility:</b> iPhone, Android, iPad, Kindle, macOS, Windows, Linux</li>
    </ul>
  ];

  const handleAction = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-wish],[data-toast],[data-read],[data-kindle]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.read) openReader(p);
    if (btn.dataset.kindle) setShowKindleModal(true);
    if (btn.dataset.add) addToCart(+btn.dataset.add, qty);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.qv) dispatch({ type: 'SET_QUICK_VIEW', id: +btn.dataset.qv });
    if (btn.dataset.open) router.push(`/pdf/${btn.dataset.open}`);
    if (btn.dataset.toast) toast('Heads up', btn.dataset.toast, true);
    if (btn.dataset.wish) {
      const id = +btn.dataset.wish;
      dispatch({ type: 'TOGGLE_WISHLIST', id });
      toast(state.wishlist.has(id) ? 'Removed from Wishlist' : 'Added to Wishlist â™¡');
    }
  };

  const relatedHTML = related.map(x => cardHTML(x, null, false, state.wishlist)).join('');
  const authorBooksHTML = authorBooks.map(x => cardHTML(x, null, false, state.wishlist)).join('');

  return (
    <>
      {showKindleModal && <SendToKindleModal book={p} onClose={() => setShowKindleModal(false)} />}
      {showReviewModal && (
        <WriteReviewModal
          book={p}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <div className="wrap" onClick={handleAction}>
        {/* Breadcrumbs */}
        <div className="crumb">
          <Link href="/">Home</Link> â€º <Link href={`/category/${catSlug}`}>{p.cat}</Link> â€º <span style={{ color: '#0f1111' }}>{p.title}</span>
        </div>

        <div className="pd">
          {/* Cover */}
          <div className="pd-cover">
            <div className="coverwrap" onClick={() => openReader(p)} style={{ cursor: 'pointer' }}>
              <div dangerouslySetInnerHTML={{ __html: coverHTML(p, 'lg') }} />
              <div className="look">ðŸ” Look inside<span style={{ fontWeight: 400, fontSize: 12.5 }}>Sample chapter PDF</span></div>
            </div>
            <div className="thumbs">
              {['p.1', 'p.14', 'p.37', 'TOC'].map(lbl => (
                <div key={lbl} className="thumb" onClick={() => openReader(p)} style={{ cursor: 'pointer' }}><span>{lbl}</span></div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            {p.badge && <span className={`flag ${flagCls(p.badge)}`} style={{ position: 'static', display: 'inline-block', marginBottom: 10 }}>{p.badge}</span>}
            <h1>{p.title}</h1>
            <div className="byline">
              by <Link href={`/author/${authorSlug}`} style={{ fontWeight: 700, color: 'var(--link)' }}>{p.author}</Link> (Author) Â· <span style={{ color: 'var(--muted)' }}>{p.pages} pages Â· <Link href={`/category/${catSlug}`} style={{ color: 'var(--muted)' }}>{p.cat}</Link> Â· Updated July 2026</span>
            </div>
            <div className="rate">
              <span className="big">{p.rating}</span>
              <span dangerouslySetInnerHTML={{ __html: stars(p.rating, 17) }} />
              <a>{p.reviews.toLocaleString()} ratings</a>
              <span style={{ color: '#bbb' }}>|</span>
              <span style={{ color: 'var(--muted)' }}>{p.bought}</span>
              {(p.downloads || 0) > 0 && (
                <>
                  <span style={{ color: '#bbb' }}>|</span>
                  <span style={{ color: 'var(--muted)' }}>⬇️ {(p.downloads || 0).toLocaleString()} downloads</span>
                </>
              )}
            </div>

            <div className="fmt">
              <div className="f on"><b>eBook</b><span>{isFree ? 'Free' : p.type === 'paid' ? formatPrice(p.price) : 'From ' + formatPrice(p.price)}</span></div>
              <div className="f" data-kindle="1"><b>Kindle</b><span>Send ↗</span></div>
              <div className="f" data-toast="ePub edition coming soon"><b>ePub</b><span>Soon</span></div>
            </div>

            <div className="bigprice">
              {isFree ? (
                <><span className="price free" style={{ fontSize: 28 }}>Free</span><span className="listp" style={{ fontSize: 15 }}>{formatPrice(p.list || 14.99)}</span><span className="save">100% off — Free eBook Fridays</span></>
              ) : isAff ? (
                <><span className="price"><sup>$</sup>{p.price}<sup>00</sup></span><span className="partn">at <b>{p.partner}</b></span></>
              ) : (
                <><span dangerouslySetInnerHTML={{ __html: money(p.price) }} />{p.list && <><span className="listp" style={{ fontSize: 15 }}>List: {formatPrice(p.list)}</span><span className="save">Save {save}%</span></>}</>
              )}
            </div>

            {/* AI Voice Summary Audio Preview */}
            <AudioSummaryPlayer book={p} />

            <p style={{ fontSize: 15, color: '#333', marginTop: 6 }}>{p.blurb}</p>
            <ul className="feat">{p.feat.map((f, i) => <li key={i}>{f}</li>)}</ul>

            {/* Interactive Study Hub Tabs */}
            <div className="tabs" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {['Overview', '📍 Notes', '🤖 Ask AI', '🗺️ Mindmap', '📝 Quiz', "What's inside", 'Specs'].map((tab, i) => (
                <button key={i} className={activeTab === i ? 'on' : ''} onClick={() => setActiveTab(i)} style={{ whiteSpace: 'nowrap' }}>{tab}</button>
              ))}
            </div>
            {tabContents.map((content, i) => (
              <div key={i} className={`tabp${activeTab === i ? ' on' : ''}`}>{content}</div>
            ))}
          </div>

          {/* Buy box */}
          <div className="buybox">
            {isAff ? (
              <>
                <div className="bb-price">${p.price}.00</div>
                <div className="note">Sold &amp; fulfilled by <b style={{ color: 'var(--link)' }}>{p.partner}</b> via the Bookshelf Partner Store.</div>
                <button className="bb-btn bb-ext" data-ext={p.id}>Go to {p.partner} ↗</button>
                <button className="bb-btn bb-cart" data-wish={p.id}>♡ Add to Wishlist</button>
                <div className="disclose"><b>Affiliate disclosure:</b> Bookshelf may earn a commission when you purchase through partner links — at no extra cost to you.</div>
              </>
            ) : isFree ? (
              <>
                <div className="bb-price" style={{ color: 'var(--green)' }}>Free</div>
                <div className="inst">⚡ Instant download — no account needed</div>
                <div className="note">100% free, forever. Hosted on secure Google Drive streams.</div>
                <button className="bb-btn bb-buy" data-free={p.id}>⤓ Download free eBook ({(p.pages * 0.09).toFixed(1)} MB)</button>
                <button className="bb-btn" style={{ background: '#fff', border: '1.5px solid var(--line)' }} data-kindle="1">📱 Send to Kindle Paperwhite</button>
                <button className="bb-btn bb-cart" data-wish={p.id}>♡ Add to Wishlist</button>
                <div className="bb-sec">
                  <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/></svg>
                  <span>Scanned &amp; virus-checked. DRM-free for personal use.</span>
                </div>
              </>
            ) : (
              <>
                <div className="bb-price">${p.price.toFixed(2)}</div>
                <div className="inst">âš¡ Instant download after purchase</div>
                <div className="note">Delivered by email + your Library. Free lifetime updates.</div>
                <div className="qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>âˆ’</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(9, q + 1))}>+</button>
                </div>
                <button className="bb-btn bb-cart" data-add={p.id}>Add to Cart</button>
                <button className="bb-btn bb-buy" onClick={() => { addToCart(p.id, qty, true); toast('Redirecting to secure checkoutâ€¦', 'Stripe Â· 256-bit encrypted', true); setTimeout(() => router.push('/cart'), 900); }}>Buy Now</button>
                <button className="bb-btn" style={{ background: '#fff', border: '1.5px solid var(--line)' }} data-toast="Free sample chapter sent to your inbox ðŸ“¬">ðŸ“„ Read free sample chapter</button>
                <button className="bb-wish" data-wish={p.id}>â™¡ Add to Wishlist</button>
                <div className="bb-sec">
                  <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                  <span><b>Secure transaction.</b> Sold by PDF-Bookshelf.com. 30-day money-back guarantee.</span>
                </div>
                <div className="paychips">
                  {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY', 'STRIPE'].map(c => <span key={c}>{c}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ambient Soundscape & Pace Calculator */}
        <AmbientSoundPlayer />
        <ReadingPaceCalculator book={p} />

        {/* SEO Key Takeaways & Chapter Breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', margin: '24px 0' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>
            ðŸ“– Key Chapters &amp; Takeaways in &ldquo;{p.title}&rdquo;
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <b style={{ color: 'var(--ink)', fontSize: 14 }}>1. Foundations &amp; Architecture</b>
              <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Core mental models, fundamental rules, and background research distilled into actionable principles.</p>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <b style={{ color: 'var(--ink)', fontSize: 14 }}>2. Step-by-Step Implementation</b>
              <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Frameworks, copy-paste templates, checklists, and workflow patterns ready to execute immediately.</p>
            </div>
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <b style={{ color: 'var(--ink)', fontSize: 14 }}>3. Optimization &amp; Scaling</b>
              <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Advanced protocols, troubleshooting common pitfalls, and real-world case studies with quantifiable results.</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="revwrap">
          <div className="revsum">
            <div className="score">{currentRating} <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 600 }}>out of 5</span></div>
            <span dangerouslySetInnerHTML={{ __html: stars(currentRating, 19) }} />
            {' '}<span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{totalReviewsCount.toLocaleString()} global ratings</span>
            <div className="bars">
              {hist.map((h, i) => (
                <div key={i} className="bar">
                  <span className="bl">{5 - i} star</span>
                  <div className="track"><div className="fill" style={{ width: `${h}%` }}></div></div>
                  <span style={{ width: 34, textAlign: 'right', color: 'var(--link)' }}>{h}%</span>
                </div>
              ))}
            </div>
            <button className="write-rev" onClick={() => setShowReviewModal(true)}>âœï¸ Write a customer review</button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>Top reviews from readers</h2>
              <button
                onClick={() => setShowReviewModal(true)}
                style={{ background: '#f8fafc', color: 'var(--ink)', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                + Rate This PDF
              </button>
            </div>

            {(reviewsList.length > 0 ? reviewsList : revs.map((r, i) => ({
              id: 'mock-' + i,
              userName: names[i][0],
              rating: 5 - i * 0.5,
              title: r.t,
              body: r.b,
              date: r.d,
              verified: true,
              helpfulCount: 140 - i * 37,
            }))).map((r: any, i: number) => (
              <div key={r.id || i} className="revcard">
                <div className="top">
                  <span className="ava" style={{ background: names[i % names.length][1] }}>
                    {(r.userName || 'R')[0].toUpperCase()}
                  </span>
                  <div className="who">
                    <b>{r.userName || 'Reader'}</b>
                    {r.verified && <div className="vp">âœ“ Verified Reader</div>}
                  </div>
                </div>
                <span dangerouslySetInnerHTML={{ __html: stars(r.rating, 14) }} />
                <h4>{r.title}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 6 }}>Reviewed on {r.date}</p>
                <p>{r.body}</p>
                <div className="help">
                  <span>{r.helpfulCount || 0} people found this helpful</span>
                  <button onClick={() => handleVoteHelpful(r.id)}>Helpful</button>
                  <button onClick={() => toast('Feedback received', 'Thank you')}>Report</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Section */}
        {faqs && faqs.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              Frequently Asked Questions about {p.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              Direct answers regarding PDF file format, device compatibility, and download links.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: isOpen ? '#f8fafc' : '#ffffff',
                      transition: 'background 0.2s',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        textAlign: 'left',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f172a',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'none',
                      }}
                    >
                      <span>{faq.question}</span>
                      <span style={{ fontSize: 16, color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        â–¾
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 16px 14px', fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* More by same Author */}
        {authorBooksHTML && (
          <div className="sec">
            <div className="sec-hd">
              <h2>More by {p.author}</h2>
              <a href={`/author/${authorSlug}`} style={{ fontSize: 13, color: 'var(--link)', fontWeight: 600 }}>
                See all â†’
              </a>
            </div>
            <ScrollSection id="sc-author" html={authorBooksHTML} onAction={handleAction} />
          </div>
        )}

        {/* Related â€” same category */}
        <div className="sec" style={{ paddingBottom: 60 }}>
          <div className="sec-hd"><h2>Customers who viewed this also viewed</h2></div>
          <ScrollSection id="sc-rel" html={relatedHTML} onAction={handleAction} />
        </div>
      </div>
    </>
  );
}
