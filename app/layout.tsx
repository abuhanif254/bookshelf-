import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import PromoBar from '@/components/PromoBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import BackToTop from '@/components/BackToTop';
import QuickViewWrapper from '@/components/QuickViewWrapper';
import AdUnlockWrapper from '@/components/AdUnlockWrapper';
import SpotlightSearch from '@/components/SpotlightSearch';
import { PdfReaderProvider } from '@/components/PdfReaderWrapper';
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/JsonLd';
import { CurrencyProvider } from '@/lib/currency';

import { getBaseUrl } from '@/lib/url';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  verification: {
    google: 'nN8IJOM1mcSO_25aJu4zkY0xAQRNLtLN-RFNXCcuwys',
  },
  title: {
    default: 'Bookshelf — Download & Read Free PDF Books Instantly',
    template: '%s | Bookshelf',
  },
  description: 'Download thousands of high-quality free PDF books, cheat sheets, and toolkits on productivity, coding, design, finance, and business. 100% free with instant download.',
  keywords: [
    'free pdf books',
    'download pdf books',
    'free ebook downloads',
    'programming cheat sheets pdf',
    'productivity books pdf',
    'business playbooks pdf',
    'free pdf fridays',
    'online book library pdf',
  ],
  authors: [{ name: 'Bookshelf Editorial Team' }],
  creator: 'Bookshelf Inc.',
  publisher: 'Bookshelf Inc.',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: baseUrl,
    types: {
      'application/rss+xml': `${baseUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Bookshelf',
    title: 'Bookshelf — Download & Read Free PDF Books Instantly',
    description: 'Instant PDF delivery. Thousands of free books on productivity, design, programming, finance and more. Free titles every Friday.',
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Bookshelf — Free PDF Books Library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookshelf — Free PDF Books & Digital Library',
    description: 'Instant PDF delivery. Thousands of free books on productivity, design, programming, finance and more.',
    images: [`${baseUrl}/api/og`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://drive.google.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Bookshelf Free PDF Drops RSS Feed"
          href="/feed.xml"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <WebSiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body>
        <StoreProvider>
          <CurrencyProvider>
            <PdfReaderProvider>
              <PromoBar />
              <Header />
              <main>{children}</main>
              <Footer />
              <ToastContainer />
              <BackToTop />
              <QuickViewWrapper />
              <AdUnlockWrapper />
              <SpotlightSearch />
            </PdfReaderProvider>
          </CurrencyProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
