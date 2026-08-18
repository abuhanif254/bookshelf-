'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function ToastContainer() {
  const { state, dispatch } = useStore();
  return (
    <div className="toasts" id="toastBox">
      {state.toasts.map(t => (
        <div key={t.id} className={`toast${t.warn ? ' warn' : ''}`}>
          <span className="ic">{t.warn ? '!' : '✓'}</span>
          <div>
            <b>{t.title}</b>
            {t.sub && <span>{t.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
