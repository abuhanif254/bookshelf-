'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { coverHTML } from '@/lib/helpers';
import { extractDriveId, getDirectDownloadUrl } from '@/lib/drive';
import { CategoryConfig, HeroSlide, PromoBarConfig, QuadCardConfig, ScrollSectionConfig, CreatorSubmission, Subscriber, BookReview, AdSettings } from '@/lib/db';

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'categories' | 'submissions' | 'newsletter' | 'sections' | 'ads' | 'analytics' | 'settings' | 'reviews'>('books');
  const [toastMsg, setToastMsg] = useState('');
  const [allReviews, setAllReviews] = useState<BookReview[]>([]);

  // Books State
  const [books, setBooks] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Product | null>(null);
  const [savingBook, setSavingBook] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    sub: '',
    author: '',
    cat: 'Productivity',
    type: 'free' as 'free' | 'paid' | 'affiliate',
    price: 0,
    list: 14.99,
    rating: 4.8,
    pages: 84,
    badge: 'Free',
    bg: '#0f2a43',
    fg: '#ffffff',
    ac: '#f59e0b',
    pat: 'p-rings',
    blurb: '',
    desc: '',
    feat1: 'Comprehensive practical guide with actionable checklists',
    feat2: 'Searchable PDF typeset for screen and mobile e-readers',
    feat3: 'DRM-free for unlimited personal lifetime access',
    driveUrl: '',
    coverImage: '',
    partner: '',
  });

  // Categories State
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryConfig | null>(null);
  const [catFormData, setCatFormData] = useState<CategoryConfig>({
    id: '',
    name: '',
    slug: '',
    badge: 'Popular',
    seoTitle: '',
    seoDesc: '',
    h1: '',
    intro: '',
  });

  // Submissions & Subscribers
  const [submissions, setSubmissions] = useState<CreatorSubmission[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Sections State
  const [promoBar, setPromoBar] = useState<PromoBarConfig>({
    enabled: true,
    pillText: '⚡ FREE PDF FRIDAYS',
    mainText: 'Download 10 new handpicked productivity & coding PDFs — 100% free this week only',
    codeText: 'NO CODE NEEDED',
    linkText: 'Claim Free PDFs ↗',
    linkUrl: '/library?preset=free',
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [quadCards, setQuadCards] = useState<QuadCardConfig[]>([]);
  const [scrollSections, setScrollSections] = useState<ScrollSectionConfig[]>([]);

  // Ads & Site Settings
  const [adSettings, setAdSettings] = useState<AdSettings>({
    adNetwork: 'built-in',
    countdownSeconds: 8,
    adCode: '',
    directSmartLink: '',
    sponsorTitle: 'SkillBoost Pro — Master High-Income Tech Skills',
    sponsorSubtitle: 'Get 85% off premium project-based roadmaps, certifications, and AI tools for developers.',
    sponsorCta: 'Explore SkillBoost Free Trial ↗',
    sponsorUrl: 'https://github.com',
    siteName: 'Bookshelf',
    siteTagline: 'Buy & Download Free PDF Books Instantly',
    supportEmail: 'support@bookshelf.com',
    adminPasscode: '',
    aiApiKey: '',
    aiProvider: 'auto',
    stats: { totalDownloads: 1420, adImpressions: 3890, adUnlocks: 2740, vipReferralUnlocks: 184 },
  });

  // Passcode update state
  const [newPasscode, setNewPasscode] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [debugLink, setDebugLink] = useState('');
  const [loginMode, setLoginMode] = useState<'passcode' | 'magic'>('passcode');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Check if session cookie is already valid on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setIsAuthenticated(true);
          loadAllData();
        }
      })
      .catch(() => {});
  }, []);

  // Send Magic Link Handler
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setMagicLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setMagicSent(true);
        if (data.debugLink) setDebugLink(data.debugLink);
        if (data.pin) setPinInput(data.pin);
        showToast('✉️ Magic link and 6-digit PIN sent!');
      } else {
        setAuthError(data.message || 'Failed to send login link');
      }
    } catch {
      setAuthError('Connection failed');
    } finally {
      setMagicLoading(false);
    }
  };

  // Verify 6-Digit PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setMagicLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        showToast('✅ Welcome back Mohammad!');
        loadAllData();
      } else {
        setAuthError(data.message || 'Invalid or expired 6-digit PIN');
      }
    } catch {
      setAuthError('Connection failed');
    } finally {
      setMagicLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setMagicSent(false);
      setPinInput('');
      setDebugLink('');
      showToast('Logged out securely');
    } catch {}
  };

  // Passcode Auth Fallback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setAuthError(data.message || 'Incorrect passcode');
      }
    } catch {
      setAuthError('Connection failed');
    }
  };

  const loadAllData = () => {
    fetch('/api/books').then(r => r.json()).then(d => { if (d.success) setBooks(d.books); });
    fetch('/api/admin/categories').then(r => r.json()).then(d => { if (d.success) setCategories(d.categories); });
    fetch('/api/publish').then(r => r.json()).then(d => { if (d.success) setSubmissions(d.submissions); });
    fetch('/api/subscribe').then(r => r.json()).then(d => { if (d.success) setSubscribers(d.subscribers); });
    fetch('/api/admin/sections').then(r => r.json()).then(d => {
      if (d.success) {
        if (d.promoBar) setPromoBar(d.promoBar);
        if (d.heroSlides) setHeroSlides(d.heroSlides);
        if (d.quadCards) setQuadCards(d.quadCards);
        if (d.scrollSections) setScrollSections(d.scrollSections);
      }
    });
    fetch('/api/settings').then(r => r.json()).then(d => { if (d.success && d.settings) setAdSettings(d.settings); });
    fetch('/api/reviews?all=true').then(r => r.json()).then(d => { if (d.success && d.reviews) setAllReviews(d.reviews); });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this reader review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAllReviews(prev => prev.filter(r => r.id !== reviewId));
        showToast('Review deleted successfully 🗑️');
      } else {
        showToast(data.message || 'Error deleting review');
      }
    } catch {
      showToast('Error deleting review');
    }
  };

  // BOOK ACTIONS
  const openAddBookModal = () => {
    setEditingBook(null);
    setBookFormData({
      title: '',
      sub: 'Actionable practical handbook',
      author: '',
      cat: categories[0]?.name || 'Productivity',
      type: 'free',
      price: 0,
      list: 14.99,
      rating: 4.8,
      pages: 96,
      badge: 'Free',
      bg: '#0f2a43',
      fg: '#ffffff',
      ac: '#f59e0b',
      pat: 'p-rings',
      blurb: 'A comprehensive guide with step-by-step frameworks.',
      desc: '<p>A practical, zero-fluff manual you can implement immediately.</p>',
      feat1: 'Comprehensive practical guide with actionable checklists',
      feat2: 'Searchable PDF typeset for screen and mobile e-readers',
      feat3: 'DRM-free for unlimited personal lifetime access',
      driveUrl: '',
      coverImage: '',
      partner: '',
    });
    setShowBookModal(true);
  };

  const openEditBookModal = (book: Product) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      sub: book.sub,
      author: book.author,
      cat: book.cat,
      type: book.type,
      price: book.price,
      list: book.list || 14.99,
      rating: book.rating,
      pages: book.pages,
      badge: book.badge || 'Free',
      bg: book.bg,
      fg: book.fg,
      ac: book.ac,
      pat: book.pat,
      blurb: book.blurb,
      desc: book.desc,
      feat1: book.feat[0] || '',
      feat2: book.feat[1] || '',
      feat3: book.feat[2] || '',
      driveUrl: book.driveUrl || '',
      coverImage: book.coverImage || book.coverUrl || '',
      partner: book.partner || '',
    });
    setShowBookModal(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBook(true);
    const feats = [bookFormData.feat1, bookFormData.feat2, bookFormData.feat3].filter(Boolean);
    const payload = {
      ...bookFormData,
      coverImage: bookFormData.coverImage.trim() || undefined,
      coverUrl: bookFormData.coverImage.trim() || undefined,
      price: Number(bookFormData.price),
      list: bookFormData.list ? Number(bookFormData.list) : null,
      rating: Number(bookFormData.rating),
      pages: Number(bookFormData.pages),
      feat: feats,
    };

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingBook ? 'Book updated! ✅' : 'Book added to catalog! 🎉');
        setShowBookModal(false);
        fetch('/api/books').then(r => r.json()).then(d => setBooks(d.books));
      }
    } catch {
      showToast('Error saving book');
    } finally {
      setSavingBook(false);
    }
  };

  const handleDeleteBook = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`"${title}" deleted.`);
        setBooks(books.filter(b => b.id !== id));
      }
    } catch {
      showToast('Error deleting book');
    }
  };

  // SUBMISSION ACTIONS
  const handleApproveSubmission = async (id: string) => {
    try {
      const res = await fetch('/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, id, action: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Book approved and published live! 🚀');
        loadAllData();
      }
    } catch {
      showToast('Approval failed');
    }
  };

  const handleRejectSubmission = async (id: string) => {
    try {
      const res = await fetch('/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, id, action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Submission rejected.');
        loadAllData();
      }
    } catch {
      showToast('Action failed');
    }
  };

  // GENERATE NEWSLETTER HTML
  const handleGenerateNewsletter = () => {
    const freeBooks = books.filter(b => b.type === 'free').slice(0, 4);
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Free PDF Friday Drop</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 30px 10px; margin: 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <tr>
          <td style="background-color: #0f172a; padding: 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em;">⚡ FREE PDF FRIDAYS DROP</h1>
            <p style="margin: 6px 0 0; color: #f59e0b; font-size: 14px; font-weight: bold;">Your 4 Handpicked Free PDFs for the Weekend</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 20px;">
              Hey Reader! Here are your freshly unlocked, 100% free PDF books on Bookshelf. Click any title to download instantly via Google Drive:
            </p>
            ${freeBooks.map(b => `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 16px; background-color: #f8fafc;">
                <h3 style="margin: 0 0 4px; font-size: 18px; color: #0f172a;">${b.title}</h3>
                <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">by <b>${b.author}</b> · ${b.pages} Pages PDF · ${b.cat}</p>
                <p style="margin: 0 0 14px; font-size: 14px; color: #334155; line-height: 1.5;">${b.blurb}</p>
                <a href="https://bookshelf.com/pdf/${b.slug}" style="display: inline-block; background-color: #f59e0b; color: #0f172a; font-weight: 800; font-size: 13px; padding: 8px 18px; border-radius: 999px; text-decoration: none;">⤓ Download Free PDF</a>
              </div>
            `).join('')}
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    setGeneratedHtml(html);
    showToast('Newsletter HTML generated! 📧');
  };

  // CATEGORY ACTIONS
  const openAddCategoryModal = () => {
    setEditingCat(null);
    setCatFormData({ id: '', name: '', slug: '', badge: 'Popular', seoTitle: '', seoDesc: '', h1: '', intro: '' });
    setShowCatModal(true);
  };

  const openEditCategoryModal = (cat: CategoryConfig) => {
    setEditingCat(cat);
    setCatFormData(cat);
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, category: catFormData }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category saved successfully! 🏷️');
        setShowCatModal(false);
        fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories));
      }
    } catch {
      showToast('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Category "${name}" deleted.`);
        setCategories(categories.filter(c => c.id !== id && c.slug !== id));
      }
    } catch {
      showToast('Error deleting category');
    }
  };

  // SECTIONS SAVE
  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, sections: { promoBar, heroSlides, quadCards, scrollSections } }),
      });
      const data = await res.json();
      if (data.success) showToast('Homepage sections saved! 🚀');
    } catch {
      showToast('Error saving sections');
    }
  };

  // AD SETTINGS SAVE
  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, updates: adSettings }),
      });
      const data = await res.json();
      if (data.success) showToast('Ad monetization settings saved! 💰');
    } catch {
      showToast('Error saving ad settings');
    }
  };

  // SITE SETTINGS SAVE
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode,
          newPasscode: newPasscode || undefined,
          updates: {
            siteName: adSettings.siteName,
            siteTagline: adSettings.siteTagline,
            supportEmail: adSettings.supportEmail,
            aiApiKey: adSettings.aiApiKey,
            aiProvider: adSettings.aiProvider,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Site settings updated! ⚙️');
        if (newPasscode) { setPasscode(newPasscode); setNewPasscode(''); }
      }
    } catch {
      showToast('Error updating settings');
    }
  };

  // Mock Book for Live Cover Studio
  const previewBook: Product = {
    id: 0,
    slug: 'preview',
    title: bookFormData.title || 'Your Book Title',
    sub: bookFormData.sub,
    author: bookFormData.author || 'Author Name',
    cat: bookFormData.cat,
    type: bookFormData.type,
    price: bookFormData.price,
    list: bookFormData.list,
    rating: bookFormData.rating,
    reviews: 120,
    pages: bookFormData.pages,
    badge: bookFormData.badge,
    bought: '1.5K downloaded',
    bg: bookFormData.bg,
    fg: bookFormData.fg,
    ac: bookFormData.ac,
    pat: bookFormData.pat,
    blurb: bookFormData.blurb,
    feat: [],
    desc: bookFormData.desc,
    coverImage: bookFormData.coverImage || undefined,
    coverUrl: bookFormData.coverImage || undefined,
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="wrap" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', padding: '36px 32px', borderRadius: 16, maxWidth: 440, width: '100%', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.15)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#0f172a', color: '#f59e0b', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            🔒
          </div>
          
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Admin Control Center</h2>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px' }}>
            Enter your credentials to access the central operating dashboard.
          </p>

          {loginMode === 'passcode' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14, textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter secret passcode"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 15, outline: 'none' }}
                />
              </div>

              {authError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '10px 12px', borderRadius: 8, marginBottom: 14, textAlign: 'left' }}>
                  ⚠️ {authError}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  padding: '13px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
                }}
              >
                Unlock Control Center →
              </button>
            </form>
          ) : (
            <div>
              {!magicSent ? (
                <form onSubmit={handleSendMagicLink}>
                  <div style={{ marginBottom: 14, textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="Enter your admin email"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14, outline: 'none' }}
                    />
                  </div>

                  {authError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '10px 12px', borderRadius: 8, marginBottom: 14, textAlign: 'left' }}>
                      ⚠️ {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={magicLoading}
                    style={{
                      width: '100%',
                      background: magicLoading ? '#94a3b8' : '#f59e0b',
                      color: '#0f172a',
                      fontSize: 15,
                      fontWeight: 800,
                      padding: '13px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: magicLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
                    }}
                  >
                    {magicLoading ? 'Sending…' : '✉️ Send One-Time PIN to Email →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPin}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px', marginBottom: 16, textAlign: 'left' }}>
                    <b style={{ color: '#1e40af', fontSize: 13, display: 'block', marginBottom: 2 }}>📬 Check your email inbox</b>
                    <span style={{ fontSize: 12, color: '#3b82f6' }}>Enter the 6-digit security code sent to your email.</span>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '2px solid #f59e0b', fontSize: 24, textAlign: 'center', letterSpacing: 8, fontFamily: 'monospace', fontWeight: 900, outline: 'none' }}
                    />
                  </div>

                  {authError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600, padding: '10px 12px', borderRadius: 8, marginBottom: 14, textAlign: 'left' }}>
                      ⚠️ {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={magicLoading || pinInput.length < 6}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: pinInput.length === 6 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {magicLoading ? 'Verifying…' : '✓ Unlock with PIN'}
                  </button>

                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => { setMagicSent(false); setAuthError(''); setPinInput(''); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Switch Mode Button */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => {
                setLoginMode(loginMode === 'passcode' ? 'magic' : 'passcode');
                setAuthError('');
                setMagicSent(false);
                setPinInput('');
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, cursor: 'pointer', fontWeight: 600 }}
            >
              {loginMode === 'passcode' ? '✉️ Or log in with Email PIN code' : '🔑 Or log in with Secret Passcode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter(b => (b.title + ' ' + b.author + ' ' + b.cat).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="wrap" style={{ padding: '28px 20px 80px' }}>
      {toastMsg && (
        <div style={{ position: 'fixed', top: 90, right: 24, background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 500, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontWeight: 700, fontSize: 14 }}>
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)' }}>Central Operating System</span>
            <span style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
              🛡️ {adminEmail || 'Administrator (Online)'}
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', margin: '2px 0 0' }}>Enterprise Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={openAddBookModal} style={{ background: 'var(--amber)', color: '#0f172a', fontWeight: 800, fontSize: 13, padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            ➕ Add New Book
          </button>
          <Link href="/admin/books" style={{ background: '#0f172a', color: '#fff', fontWeight: 700, fontSize: 13, padding: '9px 14px', borderRadius: 8, textDecoration: 'none' }}>
            📚 Book Manager →
          </Link>
          <Link href="/" target="_blank" style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: 700, fontSize: 13, padding: '9px 14px', borderRadius: 8, textDecoration: 'none' }}>
            Live Site ↗
          </Link>
          <button onClick={handleLogout} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 800, fontSize: 12.5, padding: '9px 14px', borderRadius: 8, cursor: 'pointer' }}>
            Log Out 🚪
          </button>
        </div>
      </div>

      {/* 9 Tabs Navigation */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid #e2e8f0', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { id: 'books', label: `📚 Books (${books.length})` },
          { id: 'reviews', label: `💬 Reviews (${allReviews.length})` },
          { id: 'submissions', label: `📥 Submissions (${submissions.filter(s => s.status === 'pending').length})` },
          { id: 'categories', label: `🏷️ Categories (${categories.length})` },
          { id: 'newsletter', label: `📬 Newsletter (${subscribers.length})` },
          { id: 'sections', label: '🎨 Homepage Builder' },
          { id: 'ads', label: '💰 Ad Monetization' },
          { id: 'analytics', label: '📊 Analytics & Leaderboard' },
          { id: 'settings', label: '⚙️ Settings & Security' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 14px',
              fontSize: 13.5,
              fontWeight: 800,
              color: activeTab === tab.id ? 'var(--ink)' : 'var(--muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--amber)' : '3px solid transparent',
              marginBottom: -3,
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BOOKS */}
      {activeTab === 'books' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Banner linking to the dedicated book manager */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📚 Book Management</span>
              <p style={{ fontSize: 14, color: '#e2e8f0', margin: '2px 0 0', fontWeight: 600 }}>
                Add, edit, delete and manage all {books.length} books — with live cover preview and full field control.
              </p>
            </div>
            <Link
              href="/admin/books"
              style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: 13.5, padding: '10px 22px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 4px 12px rgba(245,158,11,0.35)', whiteSpace: 'nowrap' }}
            >
              Open Full Book Manager →
            </Link>
          </div>

          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <input
              type="text"
              placeholder="Search books by title, author, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, minWidth: 300 }}
            />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Showing {filteredBooks.length} of {books.length} titles</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Book</th>
                  <th style={{ padding: '12px 16px' }}>Author &amp; Cat</th>
                  <th style={{ padding: '12px 16px' }}>Type &amp; Price</th>
                  <th style={{ padding: '12px 16px' }}>Google Drive Link</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: coverHTML(b, 'sm') }} />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{b.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.pages}p · {b.badge}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{b.author}</div>
                      <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>{b.cat}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: b.type === 'free' ? 'var(--green)' : '#0f172a' }}>
                        {b.type === 'free' ? 'FREE' : `$${b.price.toFixed(2)}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {b.driveUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                            ✓ Linked
                          </span>
                          <a href={getDirectDownloadUrl(b.driveUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--link)' }}>
                            Test ↗
                          </a>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No Drive link</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => openEditBookModal(b)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700, marginRight: 6, cursor: 'pointer' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteBook(b.id, b.title)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '5px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: READER REVIEWS */}
      {activeTab === 'reviews' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>💬 Reader Ratings &amp; Reviews ({allReviews.length})</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
                All user-submitted customer reviews saved locally in <code>data/bookshelf-db.json</code>.
              </p>
            </div>
            <button
              onClick={() => {
                fetch('/api/reviews?all=true')
                  .then(r => r.json())
                  .then(d => { if (d.success && d.reviews) setAllReviews(d.reviews); });
                showToast('Refreshed reviews list 🔄');
              }}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '7px 14px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
            >
              🔄 Refresh
            </button>
          </div>

          {allReviews.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              No reader reviews found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {allReviews.map(r => {
                const book = books.find(b => b.id === r.bookId);
                return (
                  <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: '#f59e0b', fontSize: 15, fontWeight: 800 }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(Math.max(0, 5 - r.rating))}
                        </span>
                        <b style={{ fontSize: 14, color: 'var(--ink)' }}>{r.title}</b>
                        {r.verified && (
                          <span style={{ fontSize: 11, background: '#ecfdf5', color: '#065f46', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            ✓ Verified Reader
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', margin: '4px 0 10px', lineHeight: 1.5 }}>{r.body}</p>
                      <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span>👤 <b>{r.userName}</b></span>
                        <span>📚 Book: <b>{book?.title || `Book #${r.bookId}`}</b></span>
                        <span>📅 {r.date}</span>
                        <span>👍 {r.helpfulCount || 0} helpful</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                    >
                      🗑️ Delete Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATOR SUBMISSIONS QUEUE */}
      {activeTab === 'submissions' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>📥 Incoming Author Submissions Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {submissions.length === 0 ? (
              <div style={{ background: '#fff', padding: 40, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', color: 'var(--muted)' }}>
                No pending creator submissions.
              </div>
            ) : (
              submissions.map(sub => (
                <div key={sub.id} style={{ background: '#fff', padding: 22, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, background: sub.status === 'approved' ? '#ecfdf5' : '#fef3c7', color: sub.status === 'approved' ? '#065f46' : '#92400e', fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                        {sub.status}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '0 0 2px' }}>{sub.title}</h3>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      by <b>{sub.author}</b> ({sub.authorEmail}) · {sub.pages} pages · Category: {sub.cat}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
                      <b>Drive Link:</b> <a href={getDirectDownloadUrl(sub.driveUrl)} target="_blank" rel="noreferrer" style={{ color: 'var(--link)' }}>Inspect File Stream ↗</a>
                    </div>
                  </div>

                  {sub.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleApproveSubmission(sub.id)} style={{ background: '#059669', color: '#fff', fontSize: 13, fontWeight: 800, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                        ✓ Approve &amp; Publish
                      </button>
                      <button onClick={() => handleRejectSubmission(sub.id)} style={{ background: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 700, padding: '9px 14px', borderRadius: 6, border: '1px solid #fca5a5', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>Manage categories, custom SEO titles, meta descriptions, and Googlebot breadcrumbs.</p>
            <button onClick={openAddCategoryModal} style={{ background: 'var(--ink)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
              ➕ Add New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {categories.map(c => (
              <div key={c.id} style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, color: 'var(--muted)' }}>
                      /category/{c.slug}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '6px 0 2px' }}>{c.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEditCategoryModal(c)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteCategory(c.id, c.name)} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NEWSLETTER & EMAIL DIGEST GENERATOR */}
      {activeTab === 'newsletter' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left: Generator */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>📧 1-Click Free PDF Friday HTML Generator</h3>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              Generates a responsive, pre-styled HTML email containing your top 4 free downloads. Copy-paste directly into Mailchimp, Substack, Beehiiv, or Resend.
            </p>
            <button
              onClick={handleGenerateNewsletter}
              style={{ background: 'var(--amber)', color: '#0f172a', fontWeight: 800, fontSize: 14, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 16 }}
            >
              ⚡ Generate Email HTML
            </button>

            {generatedHtml && (
              <div>
                <textarea
                  readOnly
                  rows={10}
                  value={generatedHtml}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedHtml); showToast('HTML copied to clipboard! 📋'); }}
                  style={{ marginTop: 8, background: 'var(--ink)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                >
                  Copy HTML to Clipboard
                </button>
              </div>
            )}
          </div>

          {/* Right: Subscribers List */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
              👥 Active VIP Subscribers ({subscribers.length})
            </h3>
            <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {subscribers.map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                  <b style={{ color: 'var(--ink)' }}>{sub.email}</b>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(sub.subscribedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HOMEPAGE BUILDER */}
      {activeTab === 'sections' && (
        <form onSubmit={handleSaveSections} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>📢 Top Announcement Bar</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                <input type="checkbox" checked={promoBar.enabled} onChange={e => setPromoBar({ ...promoBar, enabled: e.target.checked })} />
                Enable
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 180px', gap: 12 }}>
              <input type="text" value={promoBar.pillText} onChange={e => setPromoBar({ ...promoBar, pillText: e.target.value })} style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
              <input type="text" value={promoBar.mainText} onChange={e => setPromoBar({ ...promoBar, mainText: e.target.value })} style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
              <input type="text" value={promoBar.linkText} onChange={e => setPromoBar({ ...promoBar, linkText: e.target.value })} style={{ padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 800, padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            💾 Save Homepage Settings
          </button>
        </form>
      )}

      {/* TAB 6: ADS */}
      {activeTab === 'ads' && (
        <form onSubmit={handleSaveAds} style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>💰 Ad Monetization &amp; Sponsor Settings</h3>
            <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
              ⚡ Rewarded PDF Unlock Model
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Active Ad Mode</label>
              <select value={adSettings.adNetwork} onChange={e => setAdSettings({ ...adSettings, adNetwork: e.target.value as any })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 14 }}>
                <option value="built-in">Featured Sponsor Card (Default High CPM)</option>
                <option value="adsterra">Adsterra / Monetag Script Banner</option>
                <option value="custom">Custom HTML / Direct SmartLink</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Countdown Duration ({adSettings.countdownSeconds}s)</label>
              <input type="range" min="3" max="30" value={adSettings.countdownSeconds} onChange={e => setAdSettings({ ...adSettings, countdownSeconds: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--amber)', marginTop: 8 }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>⭐ Featured Sponsor Configuration</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Sponsor Headline</label>
              <input type="text" value={adSettings.sponsorTitle} onChange={e => setAdSettings({ ...adSettings, sponsorTitle: e.target.value })} placeholder="e.g. SkillBoost Pro — Master Tech Skills" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Sponsor Subtitle / Pitch</label>
              <input type="text" value={adSettings.sponsorSubtitle} onChange={e => setAdSettings({ ...adSettings, sponsorSubtitle: e.target.value })} placeholder="e.g. Get 85% off premium project roadmaps &amp; AI certifications" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Button CTA Text</label>
                <input type="text" value={adSettings.sponsorCta} onChange={e => setAdSettings({ ...adSettings, sponsorCta: e.target.value })} placeholder="e.g. Explore Free Trial ↗" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Sponsor / Affiliate Target URL</label>
                <input type="url" value={adSettings.sponsorUrl} onChange={e => setAdSettings({ ...adSettings, sponsorUrl: e.target.value })} placeholder="https://your-affiliate-link.com" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>⚡ Direct SmartLink &amp; Custom Ad Script</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Direct SmartLink URL (Auto-opened on Unlock Click)</label>
              <input type="url" value={adSettings.directSmartLink} onChange={e => setAdSettings({ ...adSettings, directSmartLink: e.target.value })} placeholder="https://your-monetag-or-adsterra-smartlink.com" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Custom Ad Banner / Script Code (Adsterra, Monetag, Google AdSense)</label>
              <textarea rows={4} value={adSettings.adCode} onChange={e => setAdSettings({ ...adSettings, adCode: e.target.value })} placeholder="<!-- Paste your ad network <script> or iframe code here -->" style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'monospace' }} />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 800, padding: '13px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            💾 Save Ad &amp; Sponsor Settings
          </button>
        </form>
      )}

      {/* TAB 7: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Total PDF Downloads</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#059669', marginTop: 4 }}>{adSettings.stats?.totalDownloads || 1420}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Ad Impressions</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>{adSettings.stats?.adImpressions || 3890}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Completed Ad Unlocks</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--amber)', marginTop: 4 }}>{adSettings.stats?.adUnlocks || 2740}</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Unlock Completion Rate</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#8b5cf6', marginTop: 4 }}>
                {Math.round(((adSettings.stats?.adUnlocks || 2740) / (adSettings.stats?.adImpressions || 3890)) * 100)}%
              </div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>VIP Referral Passes</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ec4899', marginTop: 4 }}>{adSettings.stats?.vipReferralUnlocks || 184}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSiteSettings} style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', maxWidth: 640 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 16 }}>⚙️ Settings &amp; Security</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Site Name</label>
            <input type="text" value={adSettings.siteName} onChange={e => setAdSettings({ ...adSettings, siteName: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
          </div>

          {/* AI Book Assistant Configuration */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
              <b style={{ fontSize: 14, color: 'var(--ink)' }}>AI Book Assistant Configuration</b>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>AI Provider</label>
              <select
                value={adSettings.aiProvider || 'auto'}
                onChange={e => setAdSettings({ ...adSettings, aiProvider: e.target.value as any })}
                style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
              >
                <option value="auto">Auto-Detect from API Key (Recommended)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="groq">Groq (Ultra-Fast Llama 3)</option>
                <option value="deepseek">DeepSeek / OpenRouter</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                AI API Key (Google Gemini / OpenAI / Groq)
              </label>
              <input
                type="password"
                placeholder="Paste your AI API Key (e.g. AIzaSy... or sk-...)"
                value={adSettings.aiApiKey || ''}
                onChange={e => setAdSettings({ ...adSettings, aiApiKey: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'monospace' }}
              />
              <span style={{ fontSize: 11.5, color: '#64748b', display: 'block', marginTop: 4 }}>
                💡 Or add <code>GEMINI_API_KEY=...</code> or <code>OPENAI_API_KEY=...</code> in your <code>.env.local</code> file.
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>New Admin Passcode</label>
            <input type="password" placeholder="Minimum 6 characters" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
          </div>
          <button type="submit" style={{ width: '100%', background: 'var(--ink)', color: '#fff', fontSize: 15, fontWeight: 800, padding: '13px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            💾 Save Settings
          </button>
        </form>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {showBookModal && (
        <div className="overlay open" style={{ zIndex: 400, background: 'rgba(15, 23, 42, 0.75)' }} onClick={(e) => { if ((e.target as HTMLElement).classList.contains('overlay')) setShowBookModal(false); }}>
          <div className="modal" style={{ maxWidth: 880, padding: 30, borderRadius: 16 }}>
            <button className="x" onClick={() => setShowBookModal(false)}>✕</button>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 20 }}>
              {editingBook ? `Edit: ${editingBook.title}` : '➕ Add New PDF Book to Catalog'}
            </h2>
            <form onSubmit={handleSaveBook}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
                <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 6 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 700 }}>Book Title *</label>
                      {bookFormData.title && (
                        <button
                          type="button"
                          onClick={() => {
                            setBookFormData(prev => ({
                              ...prev,
                              sub: `The complete practitioner's manual for ${prev.cat.toLowerCase()}`,
                              blurb: `A comprehensive, zero-fluff blueprint breaking down actionable systems in ${prev.title}.`,
                              desc: `<p><b>${prev.title}</b> is a masterclass in modern ${prev.cat.toLowerCase()} principles, designed for knowledge workers who value clarity and execution speed.</p>`,
                              feat1: 'Comprehensive chapter checklists and templates',
                              feat2: 'Searchable PDF typeset for screen and mobile e-readers',
                              feat3: 'DRM-free for unlimited personal lifetime access',
                            }));
                            showToast('✨ AI generated book details!');
                          }}
                          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
                        >
                          ✨ AI Auto-Generate Details
                        </button>
                      )}
                    </div>
                    <input type="text" required placeholder="e.g. The 90-Minute Focus Protocol" value={bookFormData.title} onChange={e => setBookFormData({ ...bookFormData, title: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Author *</label>
                      <input type="text" required value={bookFormData.author} onChange={e => setBookFormData({ ...bookFormData, author: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Category</label>
                      <select value={bookFormData.cat} onChange={e => setBookFormData({ ...bookFormData, cat: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }}>
                        {categories.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cover Image Link Field */}
                  <div style={{ marginBottom: 14, background: '#eff6ff', padding: 12, borderRadius: 8, border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 800, color: '#1e40af' }}>🖼️ Cover Image Link (URL)</label>
                      {bookFormData.coverImage && (
                        <button
                          type="button"
                          onClick={() => setBookFormData({ ...bookFormData, coverImage: '' })}
                          style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                        >
                          ✕ Clear (Use Canvas)
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="https://example.com/cover.jpg or Google Drive image link..."
                      value={bookFormData.coverImage}
                      onChange={e => setBookFormData({ ...bookFormData, coverImage: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #93c5fd', fontSize: 13, background: '#fff' }}
                    />
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                      Paste any image link (JPG/PNG/WebP/Google Drive). If empty, the auto-generated 3D canvas cover is used.
                    </span>
                  </div>

                  {/* Google Drive PDF Link */}
                  <div style={{ marginBottom: 14, background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #86efac' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 4 }}>⤓ Google Drive PDF Download Link</label>
                    <input type="text" placeholder="https://drive.google.com/file/d/..." value={bookFormData.driveUrl} onChange={e => setBookFormData({ ...bookFormData, driveUrl: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #86efac', fontSize: 13, background: '#fff' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>Type</label>
                      <select value={bookFormData.type} onChange={e => setBookFormData({ ...bookFormData, type: e.target.value as any })} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                        <option value="affiliate">Affiliate</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>Price ($)</label>
                      <input type="number" min={0} step={0.01} value={bookFormData.price} onChange={e => setBookFormData({ ...bookFormData, price: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>Pages</label>
                      <input type="number" min={1} value={bookFormData.pages} onChange={e => setBookFormData({ ...bookFormData, pages: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                    {bookFormData.coverImage ? '🖼️ Custom Image Cover' : '🎨 Dynamic Canvas Cover'}
                  </label>
                  <div style={{ width: 150, margin: '0 auto 12px' }} dangerouslySetInnerHTML={{ __html: coverHTML(previewBook, 'md') }} />
                  <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
                    {bookFormData.coverImage ? 'Live Custom Image Preview' : 'Auto-generated SVG Canvas Cover'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 16, marginTop: 12 }}>
                <button type="button" onClick={() => setShowBookModal(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingBook} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: 'var(--amber)', color: '#0f172a', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                  {savingBook ? 'Saving…' : 'Publish Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT CAT MODAL */}
      {showCatModal && (
        <div className="overlay open" style={{ zIndex: 400, background: 'rgba(15, 23, 42, 0.75)' }} onClick={(e) => { if ((e.target as HTMLElement).classList.contains('overlay')) setShowCatModal(false); }}>
          <div className="modal" style={{ maxWidth: 520, padding: 26, borderRadius: 14 }}>
            <button className="x" onClick={() => setShowCatModal(false)}>✕</button>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{editingCat ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSaveCategory}>
              <input type="text" required placeholder="Category Name" value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value })} style={{ width: '100%', padding: '9px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 14 }} />
              <button type="submit" style={{ width: '100%', background: 'var(--amber)', color: '#0f172a', fontWeight: 800, padding: '10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Save Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
