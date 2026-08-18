'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/products';
import { cardHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';

interface TopicClientProps {
  books: Product[];
  topicTitle: string;
}

export default function TopicClient({ books, topicTitle }: TopicClientProps) {
  const { state, dispatch, addToCart, downloadFree, openPartner, toast } = useStore();
  const router = useRouter();

  const handleAction = (e: React.MouseEvent<HTMLElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-add],[data-free],[data-ext],[data-qv],[data-open],[data-wish]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.add) addToCart(+btn.dataset.add);
    if (btn.dataset.free) downloadFree(+btn.dataset.free);
    if (btn.dataset.ext) openPartner(+btn.dataset.ext);
    if (btn.dataset.qv) dispatch({ type: 'SET_QUICK_VIEW', id: +btn.dataset.qv });
    if (btn.dataset.open) router.push(`/pdf/${btn.dataset.open}`);
    if (btn.dataset.wish) {
      const id = +btn.dataset.wish;
      dispatch({ type: 'TOGGLE_WISHLIST', id });
      toast(state.wishlist.has(id) ? 'Removed from Wishlist' : 'Added to Wishlist ♡');
    }
  };

  return (
    <div onClick={handleAction}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>
        Featured Guides in this Topic
      </h2>
      <div className="grid">
        {books.map(b => (
          <div key={b.id} dangerouslySetInnerHTML={{ __html: cardHTML(b, null, false, state.wishlist) }} />
        ))}
      </div>
    </div>
  );
}
