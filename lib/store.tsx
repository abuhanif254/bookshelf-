'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Product, byId } from './products';

export interface LibraryItem {
  id: number;
  kind: 'free' | 'paid';
  date: string;
}

interface StoreState {
  cart: Record<number, number>;
  wishlist: Set<number>;
  library: LibraryItem[];
  toasts: Toast[];
  quickViewId: number | null;
}

export interface Toast {
  id: string;
  title: string;
  sub: string;
  warn: boolean;
}

type Action =
  | { type: 'ADD_TO_CART'; id: number; qty?: number }
  | { type: 'REMOVE_FROM_CART'; id: number }
  | { type: 'UPDATE_QTY'; id: number; delta: number }
  | { type: 'TOGGLE_WISHLIST'; id: number }
  | { type: 'DOWNLOAD_FREE'; id: number }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'SET_QUICK_VIEW'; id: number | null };

const initialState: StoreState = {
  cart: {},
  wishlist: new Set(),
  library: [
    { id: 5, kind: 'free', date: 'Jul 25, 2026' },
    { id: 18, kind: 'free', date: 'Jul 18, 2026' },
  ],
  toasts: [],
  quickViewId: null,
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const qty = action.qty ?? 1;
      return { ...state, cart: { ...state.cart, [action.id]: (state.cart[action.id] || 0) + qty } };
    }
    case 'REMOVE_FROM_CART': {
      const next = { ...state.cart };
      delete next[action.id];
      return { ...state, cart: next };
    }
    case 'UPDATE_QTY': {
      const current = state.cart[action.id] || 1;
      const next = Math.max(1, Math.min(9, current + action.delta));
      return { ...state, cart: { ...state.cart, [action.id]: next } };
    }
    case 'TOGGLE_WISHLIST': {
      const next = new Set(state.wishlist);
      next.has(action.id) ? next.delete(action.id) : next.add(action.id);
      return { ...state, wishlist: next };
    }
    case 'DOWNLOAD_FREE': {
      const already = state.library.find(l => l.id === action.id);
      if (already) return state;
      return { ...state, library: [{ id: action.id, kind: 'free', date: 'Jul 30, 2026' }, ...state.library] };
    }
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'SET_QUICK_VIEW':
      return { ...state, quickViewId: action.id };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  cartQty: () => number;
  addToCart: (id: number, qty?: number, silent?: boolean) => void;
  downloadFree: (id: number) => void;
  openPartner: (id: number) => void;
  toast: (title: string, sub?: string, warn?: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toast = useCallback((title: string, sub: string = '', warn: boolean = false) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'ADD_TOAST', toast: { id, title, sub, warn } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3200);
  }, []);

  const cartQty = useCallback(() => Object.values(state.cart).reduce((a, b) => a + b, 0), [state.cart]);

  const addToCart = useCallback((id: number, qty: number = 1, silent: boolean = false) => {
    const p = byId(id);
    if (!p) return;
    dispatch({ type: 'ADD_TO_CART', id, qty });
    if (!silent) toast('Added to Cart', `${p.title} · ${p.type === 'free' ? 'Free' : '$' + p.price.toFixed(2)}`);
  }, [toast]);

  const downloadFree = useCallback((id: number) => {
    const p = byId(id);
    if (!p) return;
    dispatch({ type: 'DOWNLOAD_FREE', id });
    toast('Download started ⤓', `${p.title}.pdf — check your inbox too`);
  }, [toast]);

  const openPartner = useCallback((id: number) => {
    const p = byId(id);
    if (!p) return;
    toast(`Opening ${p.partner}…`, "You'll complete purchase on the partner site", true);
  }, [toast]);

  return (
    <StoreContext.Provider value={{ state, dispatch, cartQty, addToCart, downloadFree, openPartner, toast }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
