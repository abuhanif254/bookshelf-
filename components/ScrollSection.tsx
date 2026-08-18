'use client';

import { useRef } from 'react';

interface ScrollSectionProps {
  id: string;
  html: string;
  onAction?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  noArrows?: boolean;
}

export default function ScrollSection({ id, html, onAction, style, noArrows }: ScrollSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollerRef.current?.scrollBy({ left: dir * (scrollerRef.current.clientWidth * 0.8), behavior: 'smooth' });
  };

  if (noArrows) {
    return (
      <div
        className="scroller"
        id={id}
        style={{ display: 'flex', ...style }}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={onAction}
      />
    );
  }

  return (
    <div className="scrow">
      <button className="sarrow prev" aria-label="Scroll left" onClick={() => scroll(-1)}>‹</button>
      <div
        ref={scrollerRef}
        className="scroller"
        id={id}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={onAction}
      />
      <button className="sarrow next" aria-label="Scroll right" onClick={() => scroll(1)}>›</button>
    </div>
  );
}
