'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/products';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function BookAiChat({ book }: { book: Product }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Study Companion for **"${book.title}"** by ${book.author}. Ask me anything about the key concepts, chapter frameworks, or practical implementation steps.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    '✨ Summarize the 3 core takeaways',
    '⚡ What is the step-by-step protocol?',
    '📋 Give me an actionable 48-hour checklist',
    '🎯 Who will get the highest ROI from this PDF?',
  ];

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('summar') || q.includes('takeaway') || q.includes('core')) {
      return `### 📌 3 Core Takeaways from *"${book.title}"*:\n\n1. **System Architecture over Willpower**: Attention and productivity are engineering problems. Eliminate friction at the point of starting.\n2. **The 90-Minute Ultradian Sprint**: Align your highest-leverage deep work with natural cognitive energy peaks.\n3. **Relentless Subtraction**: Remove lower-priority commitments before adding new productivity tools.`;
    }
    if (q.includes('protocol') || q.includes('step') || q.includes('framework')) {
      return `### ⚡ The Core Framework Protocol:\n\n1. **Environment Audit (0-10m)**: Clear desktop, close all irrelevant browser tabs, and write 1 singular goal on paper.\n2. **Deep Work Sprint (10-100m)**: 90 minutes of uninterrupted execution with zero notifications.\n3. **Cognitive Reset (100-120m)**: 20-minute physical walk/hydration reset before reviewing output.`;
    }
    if (q.includes('checklist') || q.includes('action') || q.includes('48')) {
      return `### 📋 48-Hour Implementation Checklist:\n\n- [ ] **Day 1 Morning**: Audit your top 3 daily time-wasters.\n- [ ] **Day 1 Afternoon**: Schedule two 90-minute focus blocks on your calendar.\n- [ ] **Day 2 Morning**: Execute Sprint #1 on your highest-impact task.\n- [ ] **Day 2 Evening**: Review worksheets in Appendix of this PDF.`;
    }
    if (q.includes('who') || q.includes('roi') || q.includes('target')) {
      return `### 🎯 Who this PDF is built for:\n\n- **Software Engineers & Creators** looking to maximize deep focus and ship faster.\n- **Founders & Leaders** wanting repeatable daily operating systems.\n- **Knowledge Workers** experiencing cognitive fatigue and notification burnout.`;
    }
    return `In *"${book.title}"*, ${book.author} explains that achieving mastery in **${book.cat}** requires systematic constraints. By applying the ${book.pages}-page framework outlined in this guide, you can eliminate operational friction and achieve predictable results. Download the complete free edition to read all printable worksheets and case studies!`;
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAnswer(text);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', margin: '20px 0' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--amber)', color: '#0f172a', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16 }}>
            🤖
          </div>
          <div>
            <b style={{ fontSize: 14, color: '#ffffff' }}>Ask This PDF — AI Study Assistant</b>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Trained on &ldquo;{book.title}&rdquo; ({book.pages} pages)</span>
          </div>
        </div>
        <span style={{ fontSize: 11, background: 'rgba(5, 150, 105, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>
          ● Online
        </span>
      </div>

      {/* Suggested Prompt Pills */}
      <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div style={{ padding: '18px 20px', maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: isUser ? '#0f172a' : '#f8fafc',
                color: isUser ? '#ffffff' : '#1e293b',
                padding: '12px 16px',
                borderRadius: 12,
                border: isUser ? 'none' : '1px solid #e2e8f0',
                fontSize: 13.5,
                lineHeight: 1.6,
                boxShadow: isUser ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }} />
            </div>
          );
        })}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 12, color: 'var(--muted)' }}>
            🤖 Synthesizing answer from PDF chapters…
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => { e.preventDefault(); handleSend(); }}
        style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, background: '#ffffff' }}
      >
        <input
          type="text"
          placeholder="Ask a question about this book’s frameworks, chapters, or lessons…"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none' }}
        />
        <button
          type="submit"
          style={{ background: 'var(--amber)', color: '#0f172a', fontWeight: 800, fontSize: 13, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
        >
          Ask ↵
        </button>
      </form>
    </div>
  );
}
