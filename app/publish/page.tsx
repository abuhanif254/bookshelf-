import { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import PublishClient from './PublishClient';

export const metadata: Metadata = {
  title: 'Publish Your PDF Book | Bookshelf Creator Program',
  description: 'Distribute your PDF book, playbook, or cheat sheet to 40,000+ active readers. 100% free submission with instant author distribution.',
};

export default function PublishPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Creator Publishing', url: 'https://bookshelf.com/publish' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="wrap" style={{ padding: '20px 20px 80px' }}>
        <div className="crumb">
          <Link href="/">Home</Link> › <span>Creator Publishing Portal</span>
        </div>

        {/* Hero Header */}
        <div style={{ textAlign: 'center', margin: '20px 0 36px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--amber)', background: '#fef3c7', padding: '4px 12px', borderRadius: 20 }}>
            🚀 Bookshelf Creator Distribution
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: 'var(--ink)', margin: '10px 0 8px' }}>
            Publish &amp; Distribute Your PDF Book to 40,000+ Readers
          </h1>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            Reach engineers, founders, and creators worldwide. Upload your Google Drive link and get featured in our catalog.
          </p>
        </div>

        <PublishClient />
      </div>
    </>
  );
}
