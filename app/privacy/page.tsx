import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Disclosures | Bookshelf Free PDFs',
  description:
    'Official Privacy Policy and Cookie Disclosures for Bookshelf. Learn how we protect reader data, manage ad network cookies, and respect GDPR and CCPA privacy rights.',
  alternates: {
    canonical: 'https://www.pdf-bookshelf.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Cookie Disclosures | Bookshelf',
    description:
      'Learn how Bookshelf protects your privacy, manages advertising cookies, and complies with GDPR and CCPA data rights.',
    url: 'https://www.pdf-bookshelf.com/privacy',
    type: 'website',
    images: [
      {
        url: 'https://www.pdf-bookshelf.com/api/og?title=Privacy+Policy&sub=Data+Protection+%26+Cookie+Disclosures',
        width: 1200,
        height: 630,
        alt: 'Bookshelf Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Bookshelf',
    description: 'Official Privacy Policy, cookie disclosures, and data protection guidelines.',
    images: ['https://www.pdf-bookshelf.com/api/og?title=Privacy+Policy&sub=Data+Protection+%26+Cookie+Disclosures'],
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2026';

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy & Cookie Disclosures',
    description: 'Official Privacy Policy, cookie usage, and data rights for Bookshelf.',
    url: 'https://www.pdf-bookshelf.com/privacy',
    dateModified: '2026-01-01',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Bookshelf Inc.',
      url: 'https://www.pdf-bookshelf.com',
    },
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.pdf-bookshelf.com' },
    { name: 'Privacy Policy', url: 'https://www.pdf-bookshelf.com/privacy' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {/* Breadcrumb Navigation */}
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            <Link href="/" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            {' › '}
            <span style={{ color: '#64748b' }}>Privacy Policy</span>
          </div>

          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: 16,
              padding: '36px 32px',
              marginBottom: 32,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              Privacy &amp; Data Protection
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '12px 0 8px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Privacy Policy &amp; Cookie Disclosures
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Last Updated: <b>{lastUpdated}</b> · Full compliance with Google AdSense policies, GDPR (EU/UK), and CCPA/CPRA.
            </p>
          </div>

          {/* Quick Jump Table of Contents */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              marginBottom: 32,
            }}
          >
            <b style={{ fontSize: 14, color: 'var(--ink)', display: 'block', marginBottom: 10 }}>
              📑 Table of Contents
            </b>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8, fontSize: 13 }}>
              <a href="#1-overview" style={{ color: 'var(--link)', textDecoration: 'none' }}>1. Privacy Commitment</a>
              <a href="#2-info-collected" style={{ color: 'var(--link)', textDecoration: 'none' }}>2. Information We Collect</a>
              <a href="#3-cookies-ads" style={{ color: 'var(--link)', textDecoration: 'none' }}>3. Ad Networks &amp; Cookies</a>
              <a href="#4-opt-out" style={{ color: 'var(--link)', textDecoration: 'none' }}>4. Cookie Control &amp; Opt-Out</a>
              <a href="#5-ai-companion" style={{ color: 'var(--link)', textDecoration: 'none' }}>5. AI Study Assistant Privacy</a>
              <a href="#6-data-use" style={{ color: 'var(--link)', textDecoration: 'none' }}>6. How We Use Data</a>
              <a href="#7-gdpr" style={{ color: 'var(--link)', textDecoration: 'none' }}>7. GDPR (EU/UK) Rights</a>
              <a href="#8-ccpa" style={{ color: 'var(--link)', textDecoration: 'none' }}>8. CCPA (California) Rights</a>
              <a href="#9-security" style={{ color: 'var(--link)', textDecoration: 'none' }}>9. Security &amp; Retention</a>
              <a href="#10-children" style={{ color: 'var(--link)', textDecoration: 'none' }}>10. Children&apos;s Privacy</a>
              <a href="#11-contact" style={{ color: 'var(--link)', textDecoration: 'none' }}>11. Privacy Contact Details</a>
            </div>
          </div>

          {/* Content Container */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: '40px 36px',
              color: '#334155',
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            {/* Section 1 */}
            <section id="1-overview" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                1. Privacy Commitment &amp; Overview
              </h2>
              <p>
                At <b>Bookshelf</b> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), we believe that knowledge should be free, open, and accessible while respecting your digital privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website, download free digital PDF books, interact with our AI study companion, or use our reader tools.
              </p>
              <p>
                We do not sell your personal identifying information to data brokers. We operate on a transparent, ad-supported model to ensure all digital PDF downloads remain <b>100% free for everyone</b>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="2-info-collected" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                2. Information We Collect
              </h2>
              <p>Depending on how you use Bookshelf, we may collect the following categories of information:</p>
              <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
                <li>
                  <b>Directly Provided Information:</b> When you subscribe to our <i>Free PDF Friday</i> newsletter, submit a book review, or apply through our Creator Portal, we collect the email address, name, or comments you voluntarily provide.
                </li>
                <li>
                  <b>Automatically Collected Technical Data:</b> Our web servers automatically log standard network metadata, including your IP address (anonymized/hashed for rate limiting), browser user-agent, operating system, referring URLs, and timestamps. This data is used solely for bandwidth monitoring, anti-DDoS protection, and rate-limiting abuse prevention.
                </li>
                <li>
                  <b>Client-Side LocalStorage:</b> Your saved offline library books, audio soundscape volume preferences, reading progress, and dark/light mode preferences are stored locally on your device in your browser&apos;s <code>localStorage</code>. This data never leaves your device.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="3-cookies-ads" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                3. Third-Party Advertising Networks &amp; Cookies
              </h2>
              <p>
                To provide free PDF downloads without charging reader fees, Bookshelf partners with reputable third-party advertising networks (such as Google AdSense, Monetag, and Adsterra).
              </p>
              <p>
                These third-party vendors use cookies, web beacons, and similar tracking technologies to serve ads based on a user&apos;s prior visits to our website or other websites on the Internet:
              </p>
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, borderLeft: '4px solid #3b82f6', marginBottom: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 14 }}>📌 Google AdSense &amp; DoubleClick DART Cookies:</b>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#475569' }}>
                  Google, as a third-party vendor, uses cookies to serve ads on Bookshelf. Google&apos;s use of advertising cookies enables it and its partners to serve personalized ads to our users based on their visits to Bookshelf and other sites on the Internet.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="4-opt-out" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                4. Cookie Management &amp; Direct Opt-Out Links
              </h2>
              <p>
                You have the full right to control, manage, and opt out of personalized third-party advertising cookies at any time:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 12 }}>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <b style={{ color: 'var(--ink)', fontSize: 13.5 }}>Google Ads Settings</b>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 8px' }}>Opt out of personalized Google advertising across the web.</p>
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 700, fontSize: 12.5 }}>
                    Manage Google Ads Settings ↗
                  </a>
                </div>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <b style={{ color: 'var(--ink)', fontSize: 13.5 }}>Digital Advertising Alliance (DAA)</b>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 8px' }}>Opt out of targeted interest-based advertising networks.</p>
                  <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 700, fontSize: 12.5 }}>
                    AboutAds Consumer Opt-Out ↗
                  </a>
                </div>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <b style={{ color: 'var(--ink)', fontSize: 13.5 }}>Your Online Choices (EU/UK)</b>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 8px' }}>European Interactive Digital Advertising Alliance opt-out portal.</p>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 700, fontSize: 12.5 }}>
                    Your Online Choices Portal ↗
                  </a>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="5-ai-companion" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                5. AI Study Assistant &amp; API Data Practices
              </h2>
              <p>
                When you ask questions in our built-in <b>AI Study Companion</b>, your questions and the corresponding book metadata are transmitted via secure HTTPS to third-party artificial intelligence API providers (Google Gemini / OpenAI) to generate real-time study responses.
              </p>
              <p>
                We do not sell, store, or profile your private AI chat conversations. Please do not submit confidential, sensitive, or personally identifiable information into the AI study chat.
              </p>
            </section>

            {/* Section 6 */}
            <section id="6-data-use" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                6. How We Use Collected Information
              </h2>
              <p>We use collected data strictly for legitimate operational purposes:</p>
              <ul style={{ paddingLeft: 20 }}>
                <li>To deliver high-speed Google Drive PDF stream downloads to your device.</li>
                <li>To send weekly free PDF drop newsletters to verified subscribers (with instant 1-click unsubscribe).</li>
                <li>To protect our server infrastructure from automated spam bots, DDoS attacks, and API scraping.</li>
                <li>To analyze aggregate traffic trends and popular book categories to improve our free catalog.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="7-gdpr" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                7. GDPR &amp; UK Data Protection Rights (EEA/UK Readers)
              </h2>
              <p>
                If you reside in the European Economic Area (EEA) or the United Kingdom, you are entitled to specific statutory data protection rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                <li><b>Right of Access:</b> You have the right to request copies of your personal data.</li>
                <li><b>Right to Rectification:</b> You have the right to request correction of inaccurate data.</li>
                <li><b>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</b> You may request the permanent deletion of your email from our newsletter database.</li>
                <li><b>Right to Restrict or Object to Processing:</b> You have the right to object to certain types of processing.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at <a href="mailto:support@pdf-bookshelf.com" style={{ color: 'var(--link)', fontWeight: 700 }}>support@pdf-bookshelf.com</a>. We respond to all verified requests within 30 days free of charge.
              </p>
            </section>

            {/* Section 8 */}
            <section id="8-ccpa" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                8. California Privacy Rights (CCPA / CPRA)
              </h2>
              <p>
                Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), California residents have the right to:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                <li>Know what personal information is collected, disclosed, or shared.</li>
                <li>Request deletion of personal information collected by Bookshelf.</li>
                <li>Opt out of the sale or sharing of personal information for cross-context behavioral advertising.</li>
                <li>Non-discrimination for exercising CCPA privacy rights.</li>
              </ul>
              <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 8, border: '1px solid #a7f3d0', color: '#065f46', fontSize: 14 }}>
                <b>🛡️ &ldquo;Do Not Sell My Personal Information&rdquo;:</b> Bookshelf does not sell your personal identifying information for monetary consideration. To manage third-party advertising cookies, use the opt-out links listed in Section 4.
              </div>
            </section>

            {/* Section 9 */}
            <section id="9-security" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                9. Data Security &amp; Retention Safeguards
              </h2>
              <p>
                We implement industry-standard technical safeguards to protect your information, including TLS/HTTPS 256-bit encryption in transit, strict Origin/Host CSRF verification, rate-limited server endpoints, and secure HTTP-only administrative cookies.
              </p>
              <p>
                We retain newsletter subscriber emails only for as long as you maintain an active subscription. If you click &ldquo;Unsubscribe&rdquo;, your email is promptly removed from our active distribution lists.
              </p>
            </section>

            {/* Section 10 */}
            <section id="10-children" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                10. Children&apos;s Online Privacy (COPPA Compliance)
              </h2>
              <p>
                Bookshelf is designed for general adult audiences, professionals, and students. We do not knowingly collect or solicit personal information from children under the age of 13 (or under 16 in the European Union). If we discover that personal data from a child has been collected without parental consent, we will delete that data immediately.
              </p>
            </section>

            {/* Section 11 */}
            <section id="11-contact">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                11. Privacy Contact &amp; Data Protection Officer
              </h2>
              <p>
                If you have questions, comments, or concerns about this Privacy Policy, our cookie practices, or wish to exercise your data protection rights, please contact our dedicated Data Protection team:
              </p>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 14 }}>
                <b style={{ color: 'var(--ink)', fontSize: 15, display: 'block', marginBottom: 4 }}>Bookshelf Privacy &amp; Compliance Officer</b>
                <span style={{ fontSize: 14, color: '#475569', display: 'block' }}>
                  Email:{' '}
                  <a href="mailto:support@pdf-bookshelf.com" style={{ color: 'var(--link)', fontWeight: 700 }}>
                    support@pdf-bookshelf.com
                  </a>
                </span>
                <span style={{ fontSize: 12.5, color: '#94a3b8', display: 'block', marginTop: 4 }}>
                  Inquiries are answered within 24 to 48 business hours.
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
