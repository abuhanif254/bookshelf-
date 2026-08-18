import type { Metadata } from 'next';
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
import { WebSiteJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bookshelf.com'),
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
    url: 'https://bookshelf.com',
    siteName: 'Bookshelf',
    title: 'Bookshelf — Buy & Download Free PDF Books Instantly',
    description: 'Instant PDF delivery. Thousands of books on productivity, design, programming, finance and more. Free titles every Friday.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookshelf — Free PDF Books & Digital Library',
    description: 'Instant PDF delivery. Thousands of books on productivity, design, programming, finance and more.',
  },
};

import { CurrencyProvider } from '@/lib/currency';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://drive.google.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <WebSiteJsonLd />
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
