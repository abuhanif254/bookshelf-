'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/products';

export default function BookMindmap({ book }: { book: Product }) {
  const [selectedNode, setSelectedNode] = useState<string>('c1');

  const nodes = [
    {
      id: 'c1',
      title: '1. Foundation Architecture',
      tag: 'Mindset & Systems',
      desc: 'Willpower is an unreliable foundation. Focus is engineered by designing environments that make distraction physically difficult and deep work effortless.',
      points: [
        'Physical workspace boundary separation',
        'Notification blackholes during prime hours',
        'Singular daily focus metric',
      ],
    },
    {
      id: 'c2',
      title: '2. The 90-Minute Sprint Engine',
      tag: 'Execution Protocol',
      desc: 'Human biological stamina operates in ultradian cycles. Structuring intellectual work in strict 90-minute blocks creates peak cognitive intensity.',
      points: [
        '0-5m: Define clear definition of done',
        '5-85m: Zero tab switching execution',
        '85-90m: Retrospective & output archive',
      ],
    },
    {
      id: 'c3',
      title: '3. Strategic Friction & Elimination',
      tag: 'Defensive Habits',
      desc: 'Every commitment is a silent debt. Proactively subtracting low-leverage obligations creates space for monumental creative output.',
      points: [
        'Weekly distraction and subscription audits',
        'Batch communication to fixed afternoon windows',
        'Defaulting to "No" for non-essential meetings',
      ],
    },
    {
      id: 'c4',
      title: '4. Scaling & Long-Term Compounding',
      tag: 'Review & Growth',
      desc: 'High output without recovery causes burnout. Sustainable craft requires physical resets, circadian alignment, and weekly retrospectives.',
      points: [
        'Sleep optimization and digital shutdowns',
        'Weekly retrospective metrics logging',
        'Quarterly playbook revisions',
      ],
    },
  ];

  const activeNode = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, margin: '20px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '0.1em' }}>
          🗺️ Visual Knowledge Map
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '4px 0' }}>
          Concept Architecture: {book.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Click on any concept branch to inspect the underlying chapter framework and execution tactics.
        </p>
      </div>

      {/* Mindmap Nodes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {nodes.map(n => {
          const isSelected = n.id === selectedNode;
          return (
            <div
              key={n.id}
              onClick={() => setSelectedNode(n.id)}
              style={{
                background: isSelected ? '#0f172a' : '#f8fafc',
                color: isSelected ? '#ffffff' : 'var(--ink)',
                border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 10px 25px -5px rgba(15, 23, 42, 0.25)' : 'none',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: isSelected ? 'var(--amber)' : 'var(--muted)', display: 'block', marginBottom: 4 }}>
                {n.tag}
              </span>
              <b style={{ fontSize: 13.5, display: 'block', lineHeight: 1.3 }}>{n.title}</b>
            </div>
          );
        })}
      </div>

      {/* Active Node Detail Card */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)' }}></span>
          <b style={{ fontSize: 15, color: 'var(--ink)' }}>{activeNode.title}</b>
        </div>
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '0 0 14px' }}>
          {activeNode.desc}
        </p>
        <div style={{ background: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <b style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: 6 }}>
            ⚡ Core Action Points:
          </b>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: '#1e293b', lineHeight: 1.6 }}>
            {activeNode.points.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
