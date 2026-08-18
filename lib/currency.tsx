'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'BRL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Rate relative to 1 USD
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, name: 'USD — US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'EUR — Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'GBP — British Pound' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, name: 'INR — Indian Rupee' },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.36, name: 'CAD — Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'AU$', rate: 1.52, name: 'AUD — Australian Dollar' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.45, name: 'BRL — Brazilian Real' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceUSD: number) => string;
  currentCurrencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  useEffect(() => {
    const saved = localStorage.getItem('bookshelf_currency') as CurrencyCode;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('bookshelf_currency', c);
  };

  const currentCurrencyConfig = CURRENCIES[currency] || CURRENCIES.USD;

  const formatPrice = (priceUSD: number): string => {
    if (priceUSD === 0) return 'Free';
    const converted = priceUSD * currentCurrencyConfig.rate;
    if (currency === 'INR') {
      return `${currentCurrencyConfig.symbol}${Math.round(converted)}`;
    }
    return `${currentCurrencyConfig.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currentCurrencyConfig }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'USD' as CurrencyCode,
      setCurrency: () => {},
      formatPrice: (p: number) => (p === 0 ? 'Free' : `$${p.toFixed(2)}`),
      currentCurrencyConfig: CURRENCIES.USD,
    };
  }
  return ctx;
}
