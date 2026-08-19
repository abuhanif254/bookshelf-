import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Terms of Service & Licensing Policy | Bookshelf Free PDFs',
  description:
    'Official Terms of Service, DMCA copyright policy, licensing guidelines, and advertising disclosures for Bookshelf free digital PDF library.',
  alternates: {
    canonical: 'https://bookshelf.com/terms',
  },
  openGraph: {
    title: 'Terms of Service & Licensing Policy | Bookshelf',
    description:
      'Official Terms of Service, DMCA copyright compliance, and advertising disclosures for Bookshelf free PDF library.',
    url: 'https://bookshelf.com/terms',
    type: 'website',
    images: [
      {
        url: 'https://bookshelf.com/api/og?title=Terms+of+Service&sub=Legal+Policies+%26+Copyright+Compliance',
        width: 1200,
        height: 630,
        alt: 'Bookshelf Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Bookshelf',
    description: 'Official Terms of Service, DMCA copyright policy, and advertising disclosures.',
    images: ['https://bookshelf.com/api/og?title=Terms+of+Service&sub=Legal+Policies+%26+Copyright+Compliance'],
  },
};

export default function TermsPage() {
  const lastUpdated = 'January 1, 2026';

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service & Licensing Policy',
    description: 'Official Terms of Service, DMCA copyright compliance, and monetization disclosures for Bookshelf.',
    url: 'https://bookshelf.com/terms',
    dateModified: '2026-01-01',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Bookshelf Inc.',
      url: 'https://bookshelf.com',
    },
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://bookshelf.com' },
    { name: 'Terms of Service', url: 'https://bookshelf.com/terms' },
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
            <span style={{ color: '#64748b' }}>Terms of Service</span>
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
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              Legal &amp; Compliance
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '12px 0 8px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Terms of Service &amp; Licensing Policy
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Last Updated: <b>{lastUpdated}</b> · Effective across all Bookshelf services and digital downloads.
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
              <a href="#1-acceptance" style={{ color: 'var(--link)', textDecoration: 'none' }}>1. Acceptance of Terms</a>
              <a href="#2-business-model" style={{ color: 'var(--link)', textDecoration: 'none' }}>2. Free Ad-Supported Model</a>
              <a href="#3-copyright-licensing" style={{ color: 'var(--link)', textDecoration: 'none' }}>3. Copyright &amp; Fair Use</a>
              <a href="#4-dmca-takedown" style={{ color: 'var(--link)', textDecoration: 'none' }}>4. DMCA Takedown Notice</a>
              <a href="#5-user-conduct" style={{ color: 'var(--link)', textDecoration: 'none' }}>5. Acceptable Use Policy</a>
              <a href="#6-ads-affiliate" style={{ color: 'var(--link)', textDecoration: 'none' }}>6. Advertising &amp; Affiliate Disclosure</a>
              <a href="#7-ai-assistant" style={{ color: 'var(--link)', textDecoration: 'none' }}>7. AI Study Assistant Disclaimer</a>
              <a href="#8-warranties" style={{ color: 'var(--link)', textDecoration: 'none' }}>8. Limitation of Liability</a>
              <a href="#9-contact" style={{ color: 'var(--link)', textDecoration: 'none' }}>9. Legal Contact Information</a>
            </div>
          </div>

          {/* Content Sections */}
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
            <section id="1-acceptance" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                1. Acceptance of Terms &amp; Purpose of Service
              </h2>
              <p>
                Welcome to <b>Bookshelf</b> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing or using our website, digital PDF catalog, reader tools, AI companions, or downloading any digital documents, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our services.
              </p>
              <p>
                Bookshelf is a digital curation platform and open educational discovery index dedicated to providing readers worldwide with instant, high-speed access to free educational PDFs, programming cheat sheets, productivity frameworks, and public domain literature.
              </p>
            </section>

            {/* Section 2 */}
            <section id="2-business-model" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                2. Transparent Ad-Supported Free Download Model
              </h2>
              <p>
                To ensure that high-quality knowledge remains <b>100% free and accessible to everyone without paywalls or mandatory subscriptions</b>, Bookshelf operates on an ethical ad-supported monetization model:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                <li><b>No Forced Subscriptions:</b> You are never required to enter a credit card or pay a fee to download free PDF materials.</li>
                <li><b>Sponsored Countdown Timers:</b> Downloading a free PDF may display a brief promotional sponsor card or countdown screen (3 to 15 seconds) which covers server hosting and bandwidth costs.</li>
                <li><b>Partner Links:</b> We may display curated recommendations for software tools, certifications, or developer resources that support our free library.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="3-copyright-licensing" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                3. Copyright, Public Domain &amp; DRM-Free Licensing
              </h2>
              <p>
                Bookshelf respects the intellectual property rights of creators and rigorously sources content under the following transparent categories:
              </p>
              <ol style={{ paddingLeft: 20, marginBottom: 14 }}>
                <li><b>Public Domain Literature:</b> Classic literary works, historical treatises, and open documents whose copyright terms have legally expired.</li>
                <li><b>Creative Commons &amp; Open Educational Resources (OER):</b> Handbooks, cheat sheets, and documentation published under Creative Commons licenses (e.g. CC0 Public Domain, CC-BY Attribution, CC-BY-SA).</li>
                <li><b>Author-Submitted Works:</b> PDF publications, frameworks, and summaries uploaded directly by indie creators, educators, and authors via our Creator Portal.</li>
              </ol>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, borderLeft: '4px solid var(--amber)', fontSize: 14 }}>
                <b>📌 Personal Reading License:</b> All downloaded free PDFs are provided DRM-free for your personal, educational, non-commercial reading and research. You may not repackage, re-sell, or commercially distribute these files without the explicit copyright owner&apos;s permission.
              </div>
            </section>

            {/* Section 4 */}
            <section id="4-dmca-takedown" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                4. DMCA Safe Harbor &amp; Copyright Infringement Notice Protocol
              </h2>
              <p>
                Bookshelf complies strictly with the Digital Millennium Copyright Act (17 U.S.C. § 512). It is our policy to respond expeditiously to clear, valid notices of alleged copyright infringement.
              </p>
              <p>
                If you are a copyright owner or authorized representative and believe that any PDF or content indexed on Bookshelf infringes your copyright, please submit a written DMCA takedown notification containing the following details:
              </p>
              <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The exact URL or link to the infringing material on Bookshelf.</li>
                <li>Your contact details (Full Legal Name, Email Address, Physical Address, and Phone Number).</li>
                <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement made under penalty of perjury that the information in your notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
                <li>Your physical or electronic signature.</li>
              </ul>
              <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 8, border: '1px solid #a7f3d0', color: '#065f46', fontSize: 14 }}>
                <b>🛡️ Designated DMCA Agent Email:</b> <a href="mailto:support@bookshelf.com" style={{ color: '#065f46', fontWeight: 800 }}>support@bookshelf.com</a><br />
                <i>Our team processes all verified DMCA takedown requests within 24 to 48 business hours.</i>
              </div>
            </section>

            {/* Section 5 */}
            <section id="5-user-conduct" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                5. Acceptable Use Policy &amp; Prohibited Conduct
              </h2>
              <p>When using Bookshelf, you agree not to:</p>
              <ul style={{ paddingLeft: 20 }}>
                <li>Use automated bots, web scrapers, or scripts to aggressively harvest or flood download bandwidth.</li>
                <li>Attempt to bypass, disable, or tamper with security measures, rate limiters, or server APIs.</li>
                <li>Submit abusive, fraudulent, or defamatory reviews or creator applications.</li>
                <li>Upload materials containing malware, harmful scripts, or unauthorized copyrighted files.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="6-ads-affiliate" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                6. Third-Party Advertising &amp; FTC Affiliate Disclosure
              </h2>
              <p>
                In accordance with the Federal Trade Commission (FTC) guidelines, please note:
              </p>
              <p>
                Bookshelf features advertisements served by reputable third-party advertising networks (including Monetag, Adsterra, Google AdSense, and direct sponsors). When you click on external sponsor banners, download unlock cards, or partner links, you may be directed to a third-party website with its own independent privacy practices and terms of service.
              </p>
              <p>
                Certain featured tools, books, and courses contain affiliate tracking links. If you choose to make a purchase through these links, Bookshelf may receive an affiliate commission at <b>no extra cost to you</b>. We only recommend products and resources we believe provide genuine educational or professional value.
              </p>
            </section>

            {/* Section 7 */}
            <section id="7-ai-assistant" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                7. AI Study Assistant &amp; Educational Disclaimers
              </h2>
              <p>
                Our interactive <b>AI Study Companion</b> utilizes generative artificial intelligence models (including Google Gemini and OpenAI technologies) to synthesize chapter summaries, mindmaps, quizzes, and study protocols from indexed book descriptions.
              </p>
              <p>
                AI-generated outputs are provided for educational and exploration purposes only. While we strive for accuracy, AI responses may occasionally contain omissions or approximations. Bookshelf does not provide certified financial, medical, legal, or investment advice.
              </p>
            </section>

            {/* Section 8 */}
            <section id="8-warranties" style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                8. Disclaimers of Warranties &amp; Limitation of Liability
              </h2>
              <p>
                Bookshelf and all digital PDF downloads, AI study tools, and services are provided on an <b>&ldquo;AS IS&rdquo;</b> and <b>&ldquo;AS AVAILABLE&rdquo;</b> basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted, error-free server operation or total file compatibility across every third-party e-reader device.
              </p>
              <p>
                To the maximum extent permitted by applicable law, Bookshelf Inc. shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of or inability to use our services or downloaded materials.
              </p>
            </section>

            {/* Section 9 */}
            <section id="9-contact">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', borderBottom: '2px solid #f1f5f9', paddingBottom: 8, marginBottom: 14 }}>
                9. Modifications &amp; Legal Contact Information
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Any changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; timestamp. Continued use of Bookshelf constitutes your acceptance of the modified terms.
              </p>
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 16 }}>
                <b style={{ color: 'var(--ink)', fontSize: 15, display: 'block', marginBottom: 4 }}>Have questions or legal inquiries?</b>
                <span style={{ fontSize: 14, color: '#475569' }}>
                  Please direct all compliance, DMCA takedown requests, and licensing inquiries to our legal team at:{' '}
                  <a href="mailto:support@bookshelf.com" style={{ color: 'var(--link)', fontWeight: 700 }}>
                    support@bookshelf.com
                  </a>
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
