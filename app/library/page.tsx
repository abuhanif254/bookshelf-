import { Suspense } from 'react';
import LibraryClient from './LibraryClient';

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: '60px 0' }}>Loading…</div>}>
      <LibraryClient />
    </Suspense>
  );
}
