'use client';

import { useEffect, useRef } from 'react';

export default function BackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = () => {
      btnRef.current?.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <button
      ref={btnRef}
      className="backtop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
