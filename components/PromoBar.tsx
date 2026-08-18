'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PromoBar() {
  const [config, setConfig] = useState({
    enabled: true,
    pillText: '⚡ FREE PDF FRIDAYS',
    mainText: 'Download 10 new handpicked productivity & coding PDFs — 100% free this week only',
    codeText: 'NO CODE NEEDED',
    linkText: 'Claim Free PDFs ↗',
    linkUrl: '/library?preset=free',
  });

  useEffect(() => {
    fetch('/api/admin/sections')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.promoBar) {
          setConfig(data.promoBar);
        }
      })
      .catch(() => {});
  }, []);

  if (!config.enabled) return null;

  return (
    <div className="promo">
      <span style={{ fontWeight: 800, color: 'var(--amber)', marginRight: 6 }}>{config.pillText}</span>
      {config.mainText}
      <Link href={config.linkUrl} style={{ marginLeft: 8, fontWeight: 700 }}>{config.linkText}</Link>
    </div>
  );
}
