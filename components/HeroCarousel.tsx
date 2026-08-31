'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { coverHTML } from '@/lib/helpers';
import { getClientBooks } from '@/lib/customBooks';
import { P } from '@/lib/products';

interface HeroCarouselProps {
  stacks: [number[], number[], number[], number[]];
}

export default function HeroCarousel({ stacks }: HeroCarouselProps) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = 4;

  const goTo = (i: number) => setIdx((i + total) % total);

  const startAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(prev => (prev + 1) % total), 5200);
  };

  useEffect(() => {
    startAuto();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slides = [
    {
      cls: 's1',
      kicker: 'Summer Reading Sale',
      h1: <>The books your<br/>career keeps asking for.</>,
      p: 'Best-selling PDFs on focus, money and craft — up to 60% off through Sunday. Delivered to your inbox in seconds.',
      cta: (
        <>
          <Link href="/library?preset=deals" className="btn-hero">Shop the sale</Link>
          <Link href="/library?preset=best" className="btn-ghost">See best sellers</Link>
        </>
      ),
      stack: stacks[0],
    },
    {
      cls: 's2',
      kicker: 'Every single Friday',
      h1: <>Free PDF Fridays.<br/>No card. No catch.</>,
      p: 'Twelve hand-picked titles go free every week — starter kits, cheat sheets and short reads worth paying for.',
      cta: <Link href="/library?preset=free" className="btn-hero">Browse free PDFs</Link>,
      stack: stacks[1],
    },
    {
      cls: 's3',
      kicker: 'Partner Spotlight',
      h1: <>CreatorOS Press —<br/>the 2026 drop is here.</>,
      p: 'Our partner publishers ship the internet\'s most-wanted playbooks. This month: the Creator Economy Report, only at CreatorOS.',
      cta: <Link href="/library?preset=partner" className="btn-hero">Explore partners</Link>,
      stack: stacks[2],
    },
    {
      cls: 's4',
      kicker: 'Just published',
      h1: <>The 2026 AI Handbook.<br/>512 pages. Zero fluff.</>,
      p: 'Every model, prompt pattern and workflow that matters this year — written by practitioners, updated quarterly, yours forever.',
      cta: (
        <>
          <Link href="/pdf/ai-handbook-2026" className="btn-hero">Read the details</Link>
          <Link href="/pdf/ai-handbook-2026" className="btn-ghost">Free sample chapter</Link>
        </>
      ),
      stack: stacks[3],
    },
  ];

  return (
    <div
      className="hero"
      id="hero"
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={startAuto}
    >
      <div className="htrack">
        {slides.map((s, i) => (
          <div key={i} className={`slide ${s.cls}${i === idx ? ' active' : ''}`}>
            <div className="wrap">
              <div>
                <span className="kicker">{s.kicker}</span>
                <h1>{s.h1}</h1>
                <p>{s.p}</p>
                <div className="cta">{s.cta}</div>
              </div>
              <div
                className="stack"
                dangerouslySetInnerHTML={{ __html: s.stack.map(id => coverHTML(getClientBooks().find(b => b.id === id)!)).join('') }}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="harrow prev" onClick={() => { goTo(idx - 1); startAuto(); }} aria-label="Previous slide">‹</button>
      <button className="harrow next" onClick={() => { goTo(idx + 1); startAuto(); }} aria-label="Next slide">›</button>

      <div className="hdots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === idx ? 'on' : ''}
            onClick={() => { goTo(i); startAuto(); }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
