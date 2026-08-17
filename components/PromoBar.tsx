'use client';

import Link from 'next/link';

export default function PromoBar() {
  return (
    <div className="promo">
      ⚡ Summer Reading Sale — up to 60% off best-selling PDFs · Ends Sunday
      <Link href="/library?preset=deals">Shop the deals →</Link>
    </div>
  );
}
