'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { getClientBooks, saveClientBooks, addClientBook, deleteClientBook } from '@/lib/customBooks';

// ─── Helpers ─────────────────────────────────────────────────────────────────

import { getFallbackDesign } from '@/lib/helpers';

const PATTERNS = ['p-rings', 'p-lines', 'p-dots', 'p-grid', 'p-blocks', 'p-waves'];
const DEFAULT_CATEGORIES = ['Productivity', 'Programming', 'Business', 'Design', 'Marketing', 'Self-Help', 'Technology', 'Finance', 'Health'];
const BOOK_TYPES = ['free', 'paid', 'affiliate'] as const;
const BADGES = ['Free', 'Best Seller', '#1 New Release', "Editor's Choice", 'Deal', 'Hot', 'Partner Pick', 'Trending', ''];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function MiniCover({ book }: { book: Partial<FormData> }) {
  const coverImage = (book.coverImage || '').trim();
  const fallback = getFallbackDesign(book.title || 'Your Book Title');
  
  const isDefaultBg = !book.bg || book.bg === '#0f2a43';
  const isDefaultAc = !book.ac || book.ac === '#f59e0b';
  const isDefaultPat = !book.pat || book.pat === 'p-rings';

  const bg = isDefaultBg ? fallback.bg : book.bg;
  const ac = isDefaultAc ? fallback.ac : book.ac;
  const fg = book.fg || fallback.fg;
  const title = book.title || 'Your Book Title';
  const author = book.author || 'Author Name';
  const cat = book.cat || 'Category';
  const pages = book.pages || 96;
  const pat = isDefaultPat ? fallback.pat : (book.pat || '');

  let imgHTML = null;
  if (coverImage) {
    let resolvedImg = coverImage;
    const driveMatch = coverImage.match(/\/d\/([a-zA-Z0-9_-]+)/) || coverImage.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      resolvedImg = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    imgHTML = (
      <img
        src={`https://wsrv.nl/?url=${encodeURIComponent(resolvedImg.replace('&source=gbs_api', ''))}&w=128&output=webp`}
        alt={title}
        crossOrigin="anonymous"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 10 }}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  const patternSVG = {
    'p-rings': `<circle cx="90" cy="90" r="60" fill="none" stroke="${ac}22" stroke-width="12"/><circle cx="90" cy="90" r="80" fill="none" stroke="${ac}15" stroke-width="16"/>`,
    'p-lines': `<line x1="0" y1="30" x2="200" y2="30" stroke="${ac}20" stroke-width="8"/><line x1="0" y1="70" x2="200" y2="70" stroke="${ac}15" stroke-width="8"/><line x1="0" y1="110" x2="200" y2="110" stroke="${ac}10" stroke-width="8"/>`,
    'p-dots': `<circle cx="30" cy="30" r="4" fill="${ac}30"/><circle cx="70" cy="30" r="4" fill="${ac}30"/><circle cx="30" cy="70" r="4" fill="${ac}25"/><circle cx="70" cy="70" r="4" fill="${ac}20"/>`,
    'p-grid': `<line x1="50" y1="0" x2="50" y2="120" stroke="${ac}15" stroke-width="1"/><line x1="0" y1="50" x2="120" y2="50" stroke="${ac}15" stroke-width="1"/>`,
    'p-blocks': `<rect x="10" y="10" width="40" height="40" fill="${ac}15" rx="4"/><rect x="70" y="10" width="40" height="40" fill="${ac}10" rx="4"/>`,
    'p-waves': `<path d="M0 60 Q25 30 50 60 Q75 90 100 60 Q125 30 150 60" fill="none" stroke="${ac}20" stroke-width="6"/>`,
  }[pat] || '';

  return (
    <div style={{ width: 110, height: 156, borderRadius: 6, overflow: 'hidden', position: 'relative', background: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', color: fg }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160">${patternSVG}</svg>`)}')`, opacity: 0.2 }}></div>
      <svg viewBox="0 0 120 170" width="110" height="156" style={{ position: 'absolute', inset: 0, display: 'block', zIndex: 1 }}>
        <rect x="8" y="8" width="104" height="154" rx="4" fill="none" stroke={`${ac}40`} strokeWidth="1"/>
        <text x="10" y="26" fill={ac} fontSize="8" fontFamily="sans-serif" fontWeight="800" textAnchor="start" letterSpacing="1">
          {cat.toUpperCase()}
        </text>
        <text x="8" y="46" fill={fg} fontSize="13" fontFamily="sans-serif" fontWeight="900">
          {title.substring(0, 16)}
        </text>
        <text x="8" y="62" fill={fg} fontSize="13" fontFamily="sans-serif" fontWeight="900">
          {title.substring(16, 32)}
        </text>
        <text x="8" y="78" fill={fg} fontSize="13" fontFamily="sans-serif" fontWeight="900">
          {title.substring(32, 48)}
        </text>
        <text x="8" y="152" fill={ac} fontSize="8" fontFamily="sans-serif" fontWeight="800">
          {author.substring(0, 20).toUpperCase()}
        </text>
      </svg>
      {imgHTML}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 8px 0 10px -6px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1)', pointerEvents: 'none', zIndex: 11 }} />
    </div>
  );
}



// ─── Form Data Types ───────────────────────────────────────────────────────────

interface FormData {
  title: string;
  sub: string;
  author: string;
  cat: string;
  type: 'free' | 'paid' | 'affiliate';
  price: string;
  list: string;
  rating: string;
  reviews: string;
  pages: string;
  badge: string;
  bought: string;
  bg: string;
  fg: string;
  ac: string;
  pat: string;
  blurb: string;
  feat: string;       // newline-separated
  desc: string;       // HTML
  driveUrl: string;
  coverImage: string; // Cover image URL link
  partner: string;
  partnerUrl: string;
}

const emptyForm = (): FormData => ({
  title: '',
  sub: '',
  author: '',
  cat: 'Productivity',
  type: 'free',
  price: '0',
  list: '',
  rating: '4.8',
  reviews: '250',
  pages: '100',
  badge: 'Free',
  bought: 'Instant download',
  bg: '#0f2a43',
  fg: '#ffffff',
  ac: '#f59e0b',
  pat: 'p-rings',
  blurb: '',
  feat: 'Instant PDF download\nDRM-free for personal use\nClean layout for screen & print',
  desc: '<p>Enter a rich description for this book here.</p>',
  driveUrl: '',
  coverImage: '',
  partner: '',
  partnerUrl: '',
});

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminBooksClient() {
  const [books, setBooks] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      return getClientBooks();
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginMode, setLoginMode] = useState<'passcode' | 'magic'>('passcode');
  const [magicSent, setMagicSent] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'rating' | 'pages'>('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState<'basic' | 'cover' | 'content' | 'pricing'>('basic');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      
      // Simple robust CSV parser
      function parseCSV(str: string) {
        const arr: string[][] = [];
        let quote = false;
        for (let row = 0, col = 0, c = 0; c < str.length; c++) {
          let cc = str[c], nc = str[c+1];
          arr[row] = arr[row] || [];
          arr[row][col] = arr[row][col] || '';

          if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
          if (cc == '"') { quote = !quote; continue; }
          if (cc == ',' && !quote) { ++col; continue; }
          if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
          if (cc == '\n' && !quote) { ++row; col = 0; continue; }
          if (cc == '\r' && !quote) { ++row; col = 0; continue; }
          arr[row][col] += cc;
        }
        return arr;
      }

      const rows = parseCSV(text);
      if (rows.length < 2) {
        showToast('❌ Invalid CSV or empty file');
        return;
      }

      const rawHeaders = rows[0].map(h => h.trim().toLowerCase());
      
      const headerMap: Record<string, string> = {
        'driveurl': 'driveUrl',
        'drive url': 'driveUrl',
        'drive link': 'driveUrl',
        'drivelink': 'driveUrl',
        'download link': 'driveUrl',
        'downloadurl': 'driveUrl',
        
        'coverimage': 'coverImage',
        'cover image': 'coverImage',
        'image': 'coverImage',
        'image url': 'coverImage',
        'imageurl': 'coverImage',
        'image link': 'coverImage',
        'coverurl': 'coverImage',
        'cover url': 'coverImage',
        
        'partnerurl': 'partnerUrl',
        'partner url': 'partnerUrl',
        'affiliate link': 'partnerUrl'
      };
      
      const headers = rawHeaders.map(h => headerMap[h] || h);
      
      const newBooks = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || (!row[0] && !row[1])) continue;
        
        const bookData: any = {};
        headers.forEach((h, index) => {
          if (h && row[index] !== undefined) {
            bookData[h] = row[index].trim();
          }
        });
        
        if (bookData.title && bookData.author) {
          if (typeof bookData.feat === 'string') {
             bookData.feat = bookData.feat.split('|').map((s: string) => s.trim()).filter(Boolean);
          }
          newBooks.push(bookData);
        }
      }

      if (newBooks.length === 0) {
        showToast('❌ No valid books found (CSV requires "title" and "author" columns)');
        return;
      }

      showToast(`⏳ Uploading ${newBooks.length} books in bulk...`);
      setSaving(true);
      
      try {
        const res = await fetch('/api/books/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ books: newBooks })
        });
        const data = await res.json();
        
        if (data.success) {
          showToast(`✅ Successfully bulk uploaded ${data.count} books!`);
          fetchBooks();
        } else {
          showToast(`❌ Bulk upload failed: ${data.message}`);
        }
      } catch (err) {
         showToast('❌ Network error during bulk upload');
      } finally {
        setSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Check auth session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setIsAuthenticated(true);
          fetchBooks();
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // Passcode Login
  const handlePasscodeLogin = async (e: React.FormEvent) => {
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
        showToast('✅ Welcome back!');
        fetchBooks();
      } else {
        setAuthError(data.message || 'Incorrect passcode');
      }
    } catch {
      setAuthError('Connection failed');
    }
  };

  // Send Magic Link
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
        showToast('✉️ Security PIN sent to email!');
      } else {
        setAuthError(data.message || 'Failed to send login link');
      }
    } catch {
      setAuthError('Connection failed');
    } finally {
      setMagicLoading(false);
    }
  };

  // Verify PIN
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
        fetchBooks();
      } else {
        setAuthError(data.message || 'Invalid or expired 6-digit PIN');
      }
    } catch {
      setAuthError('Connection failed');
    } finally {
      setMagicLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setMagicSent(false);
      setPinInput('');
      setPasscode('');
      showToast('Logged out securely');
    } catch {}
  };

  // ── Fetch books ─────────────────────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/books?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      const catRes = await fetch(`/api/admin/categories?_t=${Date.now()}`, { cache: 'no-store' });
      const catData = await catRes.json();
      if (catData.success && Array.isArray(catData.categories) && catData.categories.length > 0) {
        setCategories(catData.categories.map((c: any) => c.name));
      }

      if (data.success && Array.isArray(data.books)) {
        // Merge with any newly added local books that might not be indexed yet (just in case)
        const stored = getClientBooks();
        const apiBooks = data.books;
        
        // Find any stored books that are newer/missing from API result
        const missingStored = stored.filter((s: Product) => !apiBooks.some((a: Product) => a.id === s.id));
        const merged = [...missingStored, ...apiBooks].sort((a, b) => b.id - a.id);
        
        setBooks(merged);
        saveClientBooks(merged);
      } else {
        const stored = getClientBooks();
        if (stored.length > 0) setBooks(stored);
      }
    } catch {
      const stored = getClientBooks();
      if (stored.length > 0) setBooks(stored);
      showToast('❌ Failed to load books (using cached)');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Open "Add" modal ─────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm());
    setActiveSection('basic');
    setShowModal(true);
  };

  // ── Open "Edit" modal ─────────────────────────────────────────────────────────
  const openEditModal = (book: Product) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      sub: book.sub || '',
      author: book.author,
      cat: book.cat,
      type: book.type,
      price: String(book.price),
      list: book.list != null ? String(book.list) : '',
      rating: String(book.rating),
      reviews: String(book.reviews),
      pages: String(book.pages),
      badge: book.badge || '',
      bought: book.bought || '',
      bg: book.bg,
      fg: book.fg,
      ac: book.ac,
      pat: book.pat,
      blurb: book.blurb || '',
      feat: (book.feat || []).join('\n'),
      desc: book.desc || '',
      driveUrl: book.driveUrl || '',
      coverImage: book.coverImage || book.coverUrl || '',
      partner: book.partner || '',
      partnerUrl: book.partnerUrl || '',
    });
    setActiveSection('basic');
    setShowModal(true);
  };

  // ── Close modal ───────────────────────────────────────────────────────────────
  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  // ── Save (Create or Update) ────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      showToast('❌ Title and Author are required');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      sub: form.sub.trim(),
      author: form.author.trim(),
      cat: form.cat,
      type: form.type,
      price: parseFloat(form.price) || 0,
      list: form.list ? parseFloat(form.list) : null,
      rating: parseFloat(form.rating) || 4.8,
      reviews: parseInt(form.reviews) || 250,
      pages: parseInt(form.pages) || 100,
      badge: form.badge || null,
      bought: form.bought || 'Instant download',
      bg: form.bg,
      fg: form.fg,
      ac: form.ac,
      pat: form.pat,
      blurb: form.blurb.trim(),
      feat: form.feat.split('\n').map(l => l.trim()).filter(Boolean),
      desc: form.desc.trim(),
      driveUrl: form.driveUrl.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      coverUrl: form.coverImage.trim() || undefined,
      partner: form.partner.trim() || undefined,
      partnerUrl: form.partnerUrl.trim() || undefined,
    };

    try {
      let res: Response;
      if (editingBook) {
        res = await fetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editingBook ? '✅ Book updated successfully' : '✅ Book published successfully');
        if (data.book) {
          addClientBook(data.book);
        }
        closeModal();
        fetchBooks();
      } else {
        showToast(`❌ ${data.message || 'Save failed'}`);
      }
    } catch {
      showToast('❌ Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('🗑️ Book deleted');
        deleteClientBook(id);
        setBooks(prev => prev.filter(b => b.id !== id));
      } else {
        showToast('❌ Delete failed');
      }
    } catch {
      showToast('❌ Network error');
    } finally {
      setDeleting(null);
    }
  };

  // ── Field change ───────────────────────────────────────────────────────────────
  const set = (field: keyof FormData, value: string) => setForm(f => ({ ...f, [field]: value }));

  // ── Filtered + sorted book list ────────────────────────────────────────────────
  const filtered = books
    .filter(b => {
      const q = search.toLowerCase();
      const matchesQ = !q || (b.title + b.author + b.cat + b.sub).toLowerCase().includes(q);
      const matchesCat = !filterCat || b.cat === filterCat;
      const matchesType = !filterType || b.type === filterType;
      return matchesQ && matchesCat && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'pages') return b.pages - a.pages;
      return (b.id - a.id); // newest first by default
    });

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const paginatedBooks = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat, filterType, sortBy]);

  // ── Type badge colour ──────────────────────────────────────────────────────────
  const typeColor = (t: string) => ({ free: '#059669', paid: '#2563eb', affiliate: '#d97706' }[t] || '#6b7280');

  // ═══════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated && authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#fff', padding: '36px 32px', borderRadius: 16, maxWidth: 440, width: '100%', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.15)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#0f172a', color: '#f59e0b', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 24 }}>
            📚
          </div>
          
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Book Catalog Access</h2>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px' }}>
            Enter your credentials to manage books and PDF downloads.
          </p>

          {loginMode === 'passcode' ? (
            <form onSubmit={handlePasscodeLogin}>
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
                Unlock Book Manager →
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

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.startsWith('❌') ? '#ef4444' : '#0f172a',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          fontSize: 14, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Header Bar ── */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>← Admin Dashboard</Link>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#f59e0b' }}>📚 Complete Book Catalog Manager</span>
          <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
            {books.length} books
          </span>
          <span style={{ fontSize: 11, background: '#064e3b', color: '#6ee7b7', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
            🛡️ {adminEmail || 'Administrator (Online)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            style={{ display: 'none' }} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            style={{
              background: '#38bdf8', color: '#0f172a', fontWeight: 800, fontSize: 13,
              padding: '7px 16px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? '⏳ Uploading...' : '📄 Bulk Upload CSV'}
          </button>
          <button
            onClick={openAddModal}
            style={{
              background: '#f59e0b', color: '#0f172a', fontWeight: 800, fontSize: 13,
              padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ＋ Add New Book
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: '#334155', color: '#f87171', fontWeight: 700, fontSize: 12,
              padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            }}
          >
            Log Out 🚪
          </button>
        </div>
      </div>

      {/* ── Toolbar: search + filters ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍  Search books, authors, categories…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={selStyle}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selStyle}>
          <option value="">All Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
          <option value="affiliate">Affiliate</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={selStyle}>
          <option value="newest">Newest First</option>
          <option value="title">Title A–Z</option>
          <option value="rating">Top Rated</option>
          <option value="pages">Most Pages</option>
        </select>
        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Book Table ── */}
      <div style={{ padding: '20px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>Loading books…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
            <b>No books found</b>
            <p style={{ marginTop: 4, fontSize: 13 }}>Try adjusting your search or <button onClick={openAddModal} style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>add a new book</button>.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 130px 90px 80px 80px 100px 130px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 14px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', gap: 10 }}>
              <span>Cover</span>
              <span>Title & Author</span>
              <span>Category</span>
              <span>Type</span>
              <span>Price</span>
              <span>Pages</span>
              <span>Rating</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {/* Rows */}
            {paginatedBooks.map((book, idx) => (
              <div
                key={book.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 130px 90px 80px 80px 100px 130px',
                  padding: '12px 14px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Mini cover swatch or custom image */}
                <div style={{ width: 40, height: 56, borderRadius: 4, background: book.bg, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                  {(book.coverImage || book.coverUrl) ? (
                    <img
                      src={`https://wsrv.nl/?url=${encodeURIComponent((book.coverImage || book.coverUrl || '').replace('&source=gbs_api', ''))}&w=64&output=webp`}
                      alt={book.title}
                      crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span style={{ color: book.ac, fontSize: 10, fontWeight: 900 }}>PDF</span>
                  )}
                </div>

                {/* Title + Author */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{book.author}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                    {book.badge && (
                      <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>
                        {book.badge}
                      </span>
                    )}
                    {(book.coverImage || book.coverUrl) && (
                      <span style={{ fontSize: 10, background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>
                        🖼️ Image Cover
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <span style={{ fontSize: 12, color: '#475569' }}>{book.cat}</span>

                {/* Type pill */}
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: typeColor(book.type), padding: '2px 8px', borderRadius: 4, display: 'inline-block' }}>
                  {book.type.toUpperCase()}
                </span>

                {/* Price */}
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {book.type === 'free' ? 'Free' : `$${book.price}`}
                </span>

                {/* Pages */}
                <span style={{ fontSize: 13, color: '#475569' }}>{book.pages}pp</span>

                {/* Rating */}
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>★ {book.rating}</span>
                  <span style={{ color: '#94a3b8', marginLeft: 4 }}>({book.reviews.toLocaleString()})</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Link
                    href={`/pdf/${book.slug}`}
                    target="_blank"
                    style={{ fontSize: 11, fontWeight: 700, padding: '5px 8px', borderRadius: 4, background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', textDecoration: 'none' }}
                    title="View live page"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => openEditModal(book)}
                    style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    style={{ fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 4, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', opacity: deleting === book.id ? 0.5 : 1 }}
                  >
                    {deleting === book.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 24, paddingBottom: 32 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#0f172a', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
            >
              ← Previous
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#0f172a', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: 13 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
           BOOK MODAL — Add / Edit
         ═══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: '#fff', width: '100%', maxWidth: 920, borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.35)', overflow: 'hidden', marginBottom: 20 }}>

            {/* Modal Header */}
            <div style={{ background: '#0f172a', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                  {editingBook ? `✏️ Edit: ${editingBook.title}` : '＋ Add New PDF Book to Catalog'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                  Manage book info, cover image link, Google Drive downloads, pricing and content.
                </p>
              </div>
              <button onClick={closeModal} style={{ background: '#1e293b', color: '#94a3b8', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>×</button>
            </div>

            {/* Modal Body — 2 columns: form + live preview */}
            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 230px', height: 'auto' }}>

              {/* ── Left: tabbed form ── */}
              <div style={{ borderRight: '1px solid #e2e8f0' }}>

                {/* Section Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {(['basic', 'pricing', 'cover', 'content'] as const).map(s => {
                    const labels = { basic: '1 · Basic Info', pricing: '2 · Pricing', cover: '3 · Cover Design', content: '4 · Content' };
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setActiveSection(s)}
                        style={{
                          flex: 1, padding: '10px 4px', fontSize: 11.5, fontWeight: 700,
                          border: 'none', cursor: 'pointer', background: 'transparent',
                          borderBottom: activeSection === s ? '2px solid #f59e0b' : '2px solid transparent',
                          color: activeSection === s ? '#0f172a' : '#64748b',
                        }}
                      >
                        {labels[s]}
                      </button>
                    );
                  })}
                </div>

                <div style={{ padding: '20px 22px', maxHeight: 520, overflowY: 'auto' }}>

                  {/* ── SECTION 1: BASIC INFO ── */}
                  {activeSection === 'basic' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Book Title *" required>
                          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. The 90-Minute Focus Protocol" style={inp} />
                        </Field>
                        <Field label="Subtitle">
                          <input value={form.sub} onChange={e => set('sub', e.target.value)} placeholder="Short tagline or sub-title" style={inp} />
                        </Field>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Author Name *" required>
                          <input required value={form.author} onChange={e => set('author', e.target.value)} placeholder="e.g. John Doe, PhD" style={inp} />
                        </Field>
                        <Field label="Category">
                          <select value={form.cat} onChange={e => set('cat', e.target.value)} style={inp}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>

                      {/* Cover Image Link */}
                      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <label style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            🖼️ Cover Image Link (URL)
                          </label>
                          {form.coverImage && (
                            <button
                              type="button"
                              onClick={() => set('coverImage', '')}
                              style={{
                                fontSize: 11,
                                color: '#64748b',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '2px 8px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontWeight: 700,
                              }}
                            >
                              🗑️ Clear (Use Default Canvas)
                            </button>
                          )}
                        </div>
                        <input
                          value={form.coverImage}
                          onChange={e => set('coverImage', e.target.value)}
                          placeholder="https://example.com/cover.jpg or Google Drive image link..."
                          style={{ ...inp, background: '#fff', borderColor: form.coverImage ? '#60a5fa' : '#cbd5e1' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            Paste any direct image URL (JPG/PNG/WebP/Google Drive). If left empty, the canvas cover in Tab 3 is used.
                          </span>
                        </div>
                      </div>

                      {/* Google Drive PDF Link */}
                      <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 8, padding: 14 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#166534', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          ⤓ Google Drive PDF Download Link
                        </label>
                        <input
                          value={form.driveUrl}
                          onChange={e => set('driveUrl', e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          style={{ ...inp, fontFamily: 'monospace', fontSize: 12, borderColor: form.driveUrl ? '#86efac' : '#cbd5e1', background: '#fff' }}
                        />
                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                          Paste the full Google Drive share link. Downloads are served through the secure high-speed download engine.
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Book Type">
                          <select value={form.type} onChange={e => set('type', e.target.value as any)} style={inp}>
                            <option value="free">Free (No purchase needed)</option>
                            <option value="paid">Paid (Direct PDF sale)</option>
                            <option value="affiliate">Affiliate (Partner redirect)</option>
                          </select>
                        </Field>
                        <Field label="Badge Label">
                          <select value={form.badge} onChange={e => set('badge', e.target.value)} style={inp}>
                            {BADGES.map(b => <option key={b} value={b}>{b || '(None)'}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Total Pages">
                          <input type="number" min={1} value={form.pages} onChange={e => set('pages', e.target.value)} style={inp} />
                        </Field>
                        <Field label="Social Proof Text">
                          <input value={form.bought} onChange={e => set('bought', e.target.value)} placeholder="e.g. 3.2K bought this month" style={inp} />
                        </Field>
                      </div>
                      <Field label="Short Blurb (1–2 sentences)">
                        <textarea
                          rows={2}
                          value={form.blurb}
                          onChange={e => set('blurb', e.target.value)}
                          placeholder="A compelling 1–2 sentence description shown on book cards."
                          style={{ ...inp, resize: 'vertical' }}
                        />
                      </Field>
                    </div>
                  )}

                  {/* ── SECTION 2: PRICING ── */}
                  {activeSection === 'pricing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, fontSize: 13, color: '#475569' }}>
                        <b>Type selected:</b> <span style={{ fontWeight: 800, color: typeColor(form.type) }}>{form.type.toUpperCase()}</span>
                        {form.type === 'free' && ' — Set price to 0. No purchase flow.'}
                        {form.type === 'paid' && ' — Set a sale price and optional list price for savings badge.'}
                        {form.type === 'affiliate' && ' — Enter partner name & URL. No PDF hosting needed.'}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label={form.type === 'free' ? 'Price (set 0)' : 'Sale Price ($)'}>
                          <input type="number" min={0} step={0.01} value={form.price} onChange={e => set('price', e.target.value)} style={inp} disabled={form.type === 'free'} />
                        </Field>
                        <Field label="Original List Price ($) (optional)">
                          <input type="number" min={0} step={0.01} value={form.list} onChange={e => set('list', e.target.value)} placeholder="e.g. 29.99" style={inp} disabled={form.type === 'free'} />
                        </Field>
                      </div>
                      {form.type === 'affiliate' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <Field label="Partner Name">
                            <input value={form.partner} onChange={e => set('partner', e.target.value)} placeholder="e.g. Gumroad" style={inp} />
                          </Field>
                          <Field label="Partner URL">
                            <input value={form.partnerUrl} onChange={e => set('partnerUrl', e.target.value)} placeholder="https://..." style={inp} />
                          </Field>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Star Rating (0–5)">
                          <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => set('rating', e.target.value)} style={inp} />
                        </Field>
                        <Field label="Number of Reviews">
                          <input type="number" min={0} value={form.reviews} onChange={e => set('reviews', e.target.value)} style={inp} />
                        </Field>
                      </div>
                      {/* Price Preview */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 14 }}>
                        <p style={{ fontSize: 12, color: '#065f46', margin: 0, fontWeight: 700 }}>💰 Price Preview on Book Page:</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 0' }}>
                          {form.type === 'free' ? <span style={{ color: '#059669' }}>Free</span> :
                            `$${parseFloat(form.price || '0').toFixed(2)}`}
                          {form.list && form.type !== 'free' && (
                            <span style={{ fontSize: 14, color: '#64748b', marginLeft: 10, textDecoration: 'line-through' }}>${parseFloat(form.list).toFixed(2)}</span>
                          )}
                          {form.list && form.type !== 'free' && parseFloat(form.list) > 0 && (
                            <span style={{ fontSize: 12, background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 4, marginLeft: 8 }}>
                              Save {Math.round((1 - parseFloat(form.price || '0') / parseFloat(form.list)) * 100)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── SECTION 3: COVER DESIGN ── */}
                  {activeSection === 'cover' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Cover Image Link */}
                      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <label style={{ fontSize: 12, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            🖼️ Custom Cover Image Link (URL)
                          </label>
                          {form.coverImage && (
                            <button
                              type="button"
                              onClick={() => set('coverImage', '')}
                              style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✕ Switch back to Canvas Cover
                            </button>
                          )}
                        </div>
                        <input
                          value={form.coverImage}
                          onChange={e => set('coverImage', e.target.value)}
                          placeholder="https://example.com/cover.jpg or Google Drive image link..."
                          style={{ ...inp, background: '#fff', borderColor: form.coverImage ? '#60a5fa' : '#cbd5e1' }}
                        />
                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                          If provided, this image will be rendered with realistic 3D book spine lighting across all catalog pages.
                        </span>
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', margin: '0 0 12px' }}>
                          🎨 Dynamic Canvas Cover Settings (used when no image link is provided):
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                          <Field label="Background Colour">
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={form.bg} onChange={e => set('bg', e.target.value)} style={{ width: 40, height: 34, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                              <input value={form.bg} onChange={e => set('bg', e.target.value)} style={{ ...inp, fontFamily: 'monospace', flex: 1 }} placeholder="#0f2a43" />
                            </div>
                          </Field>
                          <Field label="Foreground / Text">
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={form.fg} onChange={e => set('fg', e.target.value)} style={{ width: 40, height: 34, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                              <input value={form.fg} onChange={e => set('fg', e.target.value)} style={{ ...inp, fontFamily: 'monospace', flex: 1 }} placeholder="#ffffff" />
                            </div>
                          </Field>
                          <Field label="Accent Colour">
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="color" value={form.ac} onChange={e => set('ac', e.target.value)} style={{ width: 40, height: 34, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                              <input value={form.ac} onChange={e => set('ac', e.target.value)} style={{ ...inp, fontFamily: 'monospace', flex: 1 }} placeholder="#f59e0b" />
                            </div>
                          </Field>
                        </div>
                      </div>

                      <Field label="Cover Pattern">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {PATTERNS.map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => set('pat', p)}
                              style={{
                                padding: '8px 6px', borderRadius: 6, fontSize: 11.5, fontWeight: 700,
                                border: form.pat === p ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                                background: form.pat === p ? '#fffbeb' : '#f8fafc',
                                cursor: 'pointer', color: form.pat === p ? '#92400e' : '#475569',
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </Field>
                      {/* Colour Presets */}
                      <Field label="Colour Presets">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {[
                            { bg: '#0f2a43', fg: '#f5f1e8', ac: '#febd69', label: 'Navy' },
                            { bg: '#c92a2a', fg: '#fff5f5', ac: '#ffd814', label: 'Red' },
                            { bg: '#1e293b', fg: '#f8fafc', ac: '#38bdf8', label: 'Slate' },
                            { bg: '#064e3b', fg: '#ecfdf5', ac: '#34d399', label: 'Forest' },
                            { bg: '#5c940d', fg: '#f8ffe5', ac: '#232f3e', label: 'Lime' },
                            { bg: '#4c1d95', fg: '#f5f3ff', ac: '#fbbf24', label: 'Purple' },
                            { bg: '#0b7285', fg: '#e6fcf5', ac: '#ffd814', label: 'Teal' },
                            { bg: '#18181b', fg: '#fafafa', ac: '#f59e0b', label: 'Black' },
                          ].map(preset => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, bg: preset.bg, fg: preset.fg, ac: preset.ac }))}
                              style={{
                                width: 28, height: 28, borderRadius: '50%', background: preset.bg,
                                border: `3px solid ${preset.ac}`, cursor: 'pointer',
                                boxShadow: form.bg === preset.bg ? `0 0 0 2px ${preset.ac}` : 'none',
                              }}
                              title={preset.label}
                            />
                          ))}
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* ── SECTION 4: CONTENT ── */}
                  {activeSection === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Field label="Key Features / Bullet Points (one per line)">
                        <textarea
                          rows={6}
                          value={form.feat}
                          onChange={e => set('feat', e.target.value)}
                          placeholder={'Instant PDF download\nDRM-free for personal use\nThe 3-layer distraction audit\n21-day habit rebuild program'}
                          style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12.5 }}
                        />
                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'block' }}>Each line becomes one bullet point on the book page.</span>
                      </Field>
                      <Field label="Full Description (HTML supported)">
                        <textarea
                          rows={10}
                          value={form.desc}
                          onChange={e => set('desc', e.target.value)}
                          placeholder={'<p>Start your description here.</p>\n<p>Use <b>bold</b> and <i>italic</i> for emphasis.</p>'}
                          style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12.5 }}
                        />
                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'block' }}>Supports HTML: &lt;p&gt;, &lt;b&gt;, &lt;i&gt;, &lt;ul&gt;, &lt;li&gt;. This appears in the Overview tab on the book page.</span>
                      </Field>
                    </div>
                  )}

                </div>

                {/* Section nav arrows */}
                <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 22px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const sections: ('basic' | 'pricing' | 'cover' | 'content')[] = ['basic', 'pricing', 'cover', 'content'];
                      const cur = sections.indexOf(activeSection);
                      if (cur > 0) setActiveSection(sections[cur - 1]);
                    }}
                    disabled={activeSection === 'basic'}
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#0f172a', opacity: activeSection === 'basic' ? 0.3 : 1 }}
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sections: ('basic' | 'pricing' | 'cover' | 'content')[] = ['basic', 'pricing', 'cover', 'content'];
                      const cur = sections.indexOf(activeSection);
                      if (cur < 3) setActiveSection(sections[cur + 1]);
                    }}
                    disabled={activeSection === 'content'}
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#0f172a', opacity: activeSection === 'content' ? 0.3 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* ── Right: Live Cover Preview + Submit ── */}
              <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: '#f8fafc' }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em', margin: '0 0 8px', textAlign: 'center' }}>
                    {form.coverImage ? '🖼️ Custom Image Cover' : '🎨 Live Cover Preview'}
                  </p>
                  <MiniCover book={form} />
                </div>

                {/* Summary */}
                <div style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, fontSize: 11.5 }}>
                  <b style={{ color: '#0f172a', display: 'block', marginBottom: 6 }}>Book Summary</b>
                  <div style={{ color: '#475569', lineHeight: 1.7 }}>
                    <div>📂 {form.cat}</div>
                    <div>🏷 {form.type.toUpperCase()} · {form.type !== 'free' ? `$${form.price}` : 'Free'}</div>
                    <div>📄 {form.pages} pages</div>
                    <div>⭐ {form.rating} ({form.reviews} reviews)</div>
                    {form.coverImage && <div style={{ color: '#2563eb', fontWeight: 700 }}>🖼️ Cover image linked</div>}
                    {form.driveUrl && <div style={{ color: '#059669', fontWeight: 700 }}>✅ Drive link added</div>}
                    {!form.driveUrl && <div style={{ color: '#dc2626' }}>⚠️ No Drive link</div>}
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%',
                    background: saving ? '#94a3b8' : '#f59e0b',
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: 14,
                    padding: '12px 8px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 4px 14px rgba(245,158,11,0.35)',
                  }}
                >
                  {saving ? 'Saving…' : editingBook ? '✓ Update Book' : '⤓ Publish Book'}
                </button>
                <button type="button" onClick={closeModal} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const selStyle: React.CSSProperties = {
  padding: '7px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 12.5,
  background: '#fff',
  cursor: 'pointer',
};

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
