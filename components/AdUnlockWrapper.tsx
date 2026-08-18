'use client';

import { useStore } from '@/lib/store';
import AdUnlockModal from './AdUnlockModal';

export default function AdUnlockWrapper() {
  const { state } = useStore();
  if (!state.adUnlockBookId) return null;
  return <AdUnlockModal />;
}
