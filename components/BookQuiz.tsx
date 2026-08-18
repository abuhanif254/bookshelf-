'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/products';
import { useStore } from '@/lib/store';

export default function BookQuiz({ book }: { book: Product }) {
  const { downloadFree } = useStore();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      q: `According to "${book.title}", what is the most effective approach to sustaining focus?`,
      options: [
        'Relying purely on brute willpower and caffeine',
        'Designing your environment to eliminate friction and distraction',
        'Multitasking between 4 different projects at once',
        'Working 16 hours continuously without breaks',
      ],
      correct: 1,
      explanation: 'Cognitive science shows that environmental architecture beats raw willpower every single time.',
    },
    {
      q: 'What is the optimal length of an intense deep work sprint based on ultradian rhythms?',
      options: [
        '15 minutes',
        '90 minutes',
        '4 hours',
        '8 hours',
      ],
      correct: 1,
      explanation: 'Ultradian biological cycles peak across 90-minute intervals followed by a necessary physiological reset.',
    },
    {
      q: 'When scaling output in high-leverage domains, what should be prioritized first?',
      options: [
        'Adding more complex software tools',
        'Proactively subtracting low-impact commitments and non-essential meetings',
        'Saying yes to every new opportunity that appears',
        'Working through the weekend without sleep',
      ],
      correct: 1,
      explanation: 'Ruthless subtraction of low-leverage tasks frees up the mental bandwidth necessary for world-class deep work.',
    },
  ];

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score++;
    });
    return score;
  };

  const allAnswered = Object.keys(selectedAnswers).length === questions.length;
  const score = calculateScore();

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, margin: '20px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--amber)', letterSpacing: '0.1em' }}>
          📝 Knowledge Mastery Check
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', margin: '4px 0' }}>
          3-Minute Comprehension Quiz: {book.title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          Test your understanding of the core principles before downloading the full PDF.
        </p>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((item, qIdx) => {
          const isAnswered = selectedAnswers[qIdx] !== undefined;
          return (
            <div key={qIdx} style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <b style={{ fontSize: 14, color: 'var(--ink)', display: 'block', marginBottom: 12 }}>
                {qIdx + 1}. {item.q}
              </b>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  let optStyle = {
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                  };

                  if (submitted) {
                    if (optIdx === item.correct) {
                      optStyle = { background: '#ecfdf5', border: '1.5px solid #059669', color: '#065f46' };
                    } else if (isSelected && optIdx !== item.correct) {
                      optStyle = { background: '#fee2e2', border: '1.5px solid #dc2626', color: '#991b1b' };
                    }
                  } else if (isSelected) {
                    optStyle = { background: '#0f172a', border: '1.5px solid #0f172a', color: '#ffffff' };
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: submitted ? 'default' : 'pointer',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all 0.15s ease',
                        ...optStyle,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#475569', background: '#ffffff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  💡 <b>Lesson:</b> {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Grading */}
      <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 18, textAlign: 'center' }}>
        {!submitted ? (
          <button
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            style={{
              background: allAnswered ? 'var(--amber)' : '#cbd5e1',
              color: '#0f172a',
              fontSize: 14,
              fontWeight: 800,
              padding: '12px 28px',
              borderRadius: 999,
              border: 'none',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            {allAnswered ? 'Submit & Grade Quiz 🎯' : 'Answer all 3 questions to grade'}
          </button>
        ) : (
          <div style={{ background: '#ecfdf5', padding: 20, borderRadius: 12, border: '1px solid #86efac' }}>
            <span style={{ fontSize: 32 }}>🏆</span>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#065f46', margin: '6px 0 2px' }}>
              Mastery Score: {score} / {questions.length} Correct!
            </h3>
            <p style={{ fontSize: 13.5, color: '#15803d', margin: '0 0 16px' }}>
              You have successfully verified your foundational understanding of &ldquo;{book.title}&rdquo;.
            </p>
            <button
              onClick={() => downloadFree(book.id)}
              style={{
                background: '#059669',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 800,
                padding: '12px 26px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(5, 150, 105, 0.3)',
              }}
            >
              ⤓ Download Full {book.pages}p PDF Now (Unlocked)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
