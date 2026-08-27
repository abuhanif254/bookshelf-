import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'About Bookshelf | Free DRM-Free Digital PDF Books & Guides',
  description:
    'Discover the mission behind Bookshelf. We make high-impact programming, business, and productivity knowledge 100% free, DRM-free, and accessible to readers worldwide.',
  alternates: {
    canonical: 'https://www.pdf-bookshelf.com/about',
  },
  openGraph: {
    title: 'About Bookshelf | Our Mission & Open Knowledge Ecosystem',
    description:
      'Discover Bookshelf: Distilled, actionable, DRM-free PDF handbooks and cheat sheets supported by transparent advertising.',
    url: 'https://www.pdf-bookshelf.com/about',
    type: 'website',
    images: [
      {
        url: 'https://www.pdf-bookshelf.com/api/og?title=About+Bookshelf&sub=Our+Mission+%26+Free+Knowledge+Ecosystem',
        width: 1200,
        height: 630,
        alt: 'About Bookshelf',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Bookshelf | Free PDF Library',
    description: 'Learn about our mission to make high-impact knowledge free and accessible without paywalls.',
    images: ['https://www.pdf-bookshelf.com/api/og?title=About+Bookshelf&sub=Our+Mission+%26+Free+Knowledge+Ecosystem'],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Bookshelf',
    description:
      'Bookshelf is a digital curation platform and open educational index dedicated to providing free, DRM-free PDF books and practical guides.',
    url: 'https://www.pdf-bookshelf.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'Bookshelf Inc.',
      url: 'https://www.pdf-bookshelf.com',
      logo: 'https://www.pdf-bookshelf.com/manifest.webmanifest',
      foundingDate: '2026',
      description: 'Curating world-class free digital PDF books, cheat sheets, and practical manuals for lifelong learners.',
    },
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.pdf-bookshelf.com' },
    { name: 'About Us', url: 'https://www.pdf-bookshelf.com/about' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            <Link href="/" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            {' › '}
            <span style={{ color: '#64748b' }}>About Us</span>
          </div>

          {/* Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: 20,
              padding: '48px 36px',
              marginBottom: 32,
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--amber)',
                padding: '5px 14px',
                borderRadius: 20,
                display: 'inline-block',
                marginBottom: 16,
              }}
            >
              Our Mission &amp; Philosophy
            </span>
            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 900,
                margin: '0 0 16px',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                color: '#ffffff',
              }}
            >
              Making World-Class Knowledge <br />
              <span style={{ color: 'var(--amber)' }}>100% Free &amp; DRM-Free</span> for Everyone
            </h1>
            <p
              style={{
                fontSize: 16,
                color: '#cbd5e1',
                maxWidth: 680,
                margin: '0 auto 28px',
                lineHeight: 1.6,
              }}
            >
              We believe practical, life-changing skills—from software engineering and startup frameworks to deep focus and UI/UX design—should never be locked behind expensive paywalls or bloated subscriptions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/library"
                style={{
                  background: 'var(--amber)',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: 14.5,
                  padding: '12px 24px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                }}
              >
                📚 Browse Free Catalog →
              </Link>
              <Link
                href="/publish"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14.5,
                  padding: '12px 22px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                🚀 Creator Portal
              </Link>
            </div>
          </div>

          {/* 4 Key Statistics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 36,
            }}
          >
            {[
              { num: '100%', label: 'Free & DRM-Free', desc: 'Read offline on any device forever', icon: '🔓' },
              { num: '9+', label: 'Curated Categories', desc: 'From coding to personal finance', icon: '📚' },
              { num: '$0', label: 'Zero Hidden Paywalls', desc: 'No credit card or subscription needed', icon: '💳' },
              { num: '⚡ Instant', label: 'Direct Cloud Delivery', desc: 'High-speed Google Drive streams', icon: '🚀' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  padding: 22,
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)' }}>{stat.num}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginTop: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* The Story & Problem We Solve */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: '36px 32px',
              marginBottom: 32,
              lineHeight: 1.7,
              color: '#334155',
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 16 }}>
              📖 Why We Built Bookshelf
            </h2>
            <p>
              Most traditional non-fiction books are padded with 200 pages of fluff to justify a $30 price tag. Readers spend hours looking for the 10% of practical, actionable insight they can actually use in their daily work.
            </p>
            <p>
              <b>Bookshelf takes a different approach:</b> We curate and distribute high-density, beautifully typeset digital PDF handbooks, field manuals, and cheat sheets. Every publication is designed to be read in an afternoon and implemented the next morning.
            </p>
            <p>
              Whether you are a solo software engineer building a micro-SaaS, a designer crafting modular design systems, or a founder structuring your daily focus blocks, Bookshelf gives you direct, unconstrained access to battle-tested frameworks.
            </p>
          </div>

          {/* Our 4 Curation Standards */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 16, textAlign: 'center' }}>
              🎯 Our 4 Curation Standards
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                {
                  title: '1. Zero Fluff, High Actionability',
                  desc: 'Every PDF features copy-paste templates, checklists, and real-world case studies with quantifiable outcomes.',
                  icon: '⚡',
                },
                {
                  title: '2. Complete DRM-Free Freedom',
                  desc: 'No proprietary apps or locked formats. Store your PDFs on your phone, iPad, Kindle, or desktop forever.',
                  icon: '🌍',
                },
                {
                  title: '3. Dual-Format Typesetting',
                  desc: 'Carefully formatted for both screen reading and crisp physical printing (Letter and A4 dimensions).',
                  icon: '📱',
                },
                {
                  title: '4. Verified Author Contributions',
                  desc: 'Publications undergo rigorous editorial review to ensure ethical sourcing, accuracy, and clear attribution.',
                  icon: '✓',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    padding: 24,
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>{c.icon}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>{c.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Ad-Supported Model */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 16,
              border: '1px dashed #cbd5e1',
              padding: '32px',
              marginBottom: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>💰</span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', margin: 0 }}>
                How We Keep Books 100% Free
              </h2>
            </div>
            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>
              Running high-speed global downloads, AI study models, and cloud servers costs money. Instead of charging our readers subscriptions or locking books behind paywalls, Bookshelf uses a <b>transparent ad-supported and sponsor-backed model</b>:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>⏱️ Brief Sponsor Countdowns</b>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>A short 5–10 second sponsor screen covers hosting and direct-stream bandwidth costs.</p>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>🤝 Curated Partner Tools</b>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>We feature relevant development, design, and career tools that genuinely help our readers.</p>
              </div>
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>📬 Free Weekly PDF Drops</b>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>Sponsored newsletter editions allow us to commission new cheat sheets and guides every week.</p>
              </div>
            </div>
          </div>

          {/* Built-in Reader & AI Study Companion Technology */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: '36px 32px',
              marginBottom: 36,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 16 }}>
              ⚡ Modern Study Ecosystem Built for Focus
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>📖 Built-In Browser Reader</b>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Read high-res PDFs instantly in your browser without downloading heavy desktop software.</p>
              </div>
              <div style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>🤖 AI Study Companion</b>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Powered by Google Gemini to break down key chapters, generate mindmaps, and quiz your retention.</p>
              </div>
              <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>🎧 Focus Soundscapes</b>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Built-in binaural beats, coffee shop ambience, and rain sounds to help you stay locked in.</p>
              </div>
              <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>💾 Offline Device Library</b>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Save books directly to your device with one click—no account creation required.</p>
              </div>
            </div>
          </div>

          {/* Authors & Creators Callout */}
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: 16,
              padding: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1e40af', background: '#ffffff', padding: '3px 8px', borderRadius: 4 }}>
                For Indie Writers &amp; Educators
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e3a8a', margin: '8px 0 4px' }}>
                Are you an Author, Creator, or Educator?
              </h3>
              <p style={{ fontSize: 13.5, color: '#3b82f6', margin: 0, maxWidth: 540 }}>
                Distribute your free PDF book, developer cheat sheet, or startup guide to thousands of motivated global readers.
              </p>
            </div>
            <Link
              href="/publish"
              style={{
                background: '#1e40af',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              Submit Your PDF Book →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
