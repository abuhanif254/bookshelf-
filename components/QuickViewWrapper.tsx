'use client';

import { useStore } from '@/lib/store';
import QuickViewModal from './QuickViewModal';

export default function QuickViewWrapper() {
  const { state } = useStore();
  if (!state.quickViewId) return null;
  return <QuickViewModal />;
}
