'use client';

import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/lib/products';
import PdfReaderModal from './PdfReaderModal';

interface PdfReaderContextValue {
  openReader: (book: Product) => void;
  closeReader: () => void;
}

const PdfReaderContext = createContext<PdfReaderContextValue | null>(null);

export function PdfReaderProvider({ children }: { children: React.ReactNode }) {
  const [activeBook, setActiveBook] = useState<Product | null>(null);

  const openReader = (book: Product) => setActiveBook(book);
  const closeReader = () => setActiveBook(null);

  return (
    <PdfReaderContext.Provider value={{ openReader, closeReader }}>
      {children}
      {activeBook && <PdfReaderModal book={activeBook} onClose={closeReader} />}
    </PdfReaderContext.Provider>
  );
}

export function usePdfReader() {
  const ctx = useContext(PdfReaderContext);
  if (!ctx) throw new Error('usePdfReader must be used within PdfReaderProvider');
  return ctx;
}
