import type { Metadata } from 'next';
import { Archivo, Source_Sans_3 } from 'next/font/google';
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
import InstallPwaPrompt from '@/components/InstallPwaPrompt';
import FreePdfFridaysModal from '@/components/FreePdfFridaysModal';

import { getBaseUrl } from '@/lib/url';

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  referrer: 'no-referrer',
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

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-source-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${sourceSans3.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://wsrv.nl" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://wsrv.nl" />
        <link rel="dns-prefetch" href="https://drive.google.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Bookshelf Free PDF Drops RSS Feed"
          href="/feed.xml"
        />
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bookshelf" />
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
              <InstallPwaPrompt />
              <FreePdfFridaysModal />
            </PdfReaderProvider>
          </CurrencyProvider>
        </StoreProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
