'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/products';

interface NoteItem {
  id: string;
  chapter: string;
  quote: string;
  note: string;
  createdAt: string;
}

export default function ReaderNotes({ book }: { book: Product }) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [chapter, setChapter] = useState('Chapter 1');
  const [quote, setQuote] = useState('');
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const storageKey = `bookshelf_notes_${book.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note && !quote) return;
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      chapter,
      quote,
      note,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    saveNotes([newNote, ...notes]);
    setQuote('');
    setNote('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const handleExportMarkdown = () => {
    const mdContent = `# Reading Notes & Highlights: ${book.title}
*by ${book.author} — Exported from Bookshelf Digital Library*
*Date: ${new Date().toLocaleDateString()}*

---

## 📌 Executive Summary
${book.blurb}

---

## 📝 Personal Notes & Highlights (${notes.length})

${notes.map(n => `### ${n.chapter} · *${n.createdAt}*
${n.quote ? `> "${n.quote}"\n\n` : ''}${n.note ? `**My Takeaways:**\n${n.note}\n` : ''}
---
`).join('\n')}

*Exported via Bookshelf (https://bookshelf.com/pdf/${book.slug})*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.slug}-reading-notes.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, margin: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '0.1em' }}>
            📝 Personal Study Workspace
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '4px 0 0' }}>
            My Reading Notes &amp; Marginalia ({notes.length})
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              background: 'var(--amber)',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: 12.5,
              padding: '7px 14px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isAdding ? 'Cancel' : '➕ Add Note / Quote'}
          </button>
          {notes.length > 0 && (
            <button
              onClick={handleExportMarkdown}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12.5,
                padding: '7px 14px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              📥 Export to Notion / Markdown
            </button>
          )}
        </div>
      </div>

      {/* Add Note Box */}
      {isAdding && (
        <form onSubmit={handleAddNote} style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Chapter / Section</label>
            <input
              type="text"
              placeholder="e.g. Chapter 1: The 90-Minute Sprint"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Book Quote / Passage (Optional)</label>
            <textarea
              rows={2}
              placeholder="Paste a memorable quote or framework here…"
              value={quote}
              onChange={e => setQuote(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Your Reflection &amp; Action Item *</label>
            <textarea
              rows={3}
              required
              placeholder="How will you apply this lesson in your daily workflow?"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            />
          </div>
          <button
            type="submit"
            style={{ background: '#059669', color: '#fff', fontWeight: 800, fontSize: 13, padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
          >
            ✓ Save Note
          </button>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 && !isAdding ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>📖</span>
          <b style={{ color: 'var(--ink)', fontSize: 14 }}>No notes saved yet</b>
          <p style={{ fontSize: 12.5, color: '#64748b', maxWidth: 400, margin: '4px auto 14px' }}>
            Capture high-leverage insights, quotes, and action checklists as you read. You can export everything to Notion or Obsidian anytime.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}
          >
            Create Your First Note ✍️
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notes.map(n => (
            <div key={n.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <b style={{ fontSize: 13, color: '#0f172a' }}>{n.chapter}</b>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.createdAt}</span>
              </div>
              {n.quote && (
                <blockquote style={{ borderLeft: '3px solid var(--amber)', paddingLeft: 12, margin: '6px 0 10px', fontStyle: 'italic', fontSize: 13, color: '#475569' }}>
                  &ldquo;{n.quote}&rdquo;
                </blockquote>
              )}
              <p style={{ fontSize: 13.5, color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                {n.note}
              </p>
              <button
                onClick={() => handleDelete(n.id)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
                title="Delete note"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
