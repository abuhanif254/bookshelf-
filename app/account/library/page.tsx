'use client';

import { useState } from 'react';
import { byId } from '@/lib/products';
import { coverHTML } from '@/lib/helpers';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LibraryItem } from '@/lib/store';

export default function MyLibraryPage() {
  const { state, downloadFree } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'paid' | 'free'>('all');

  const list: LibraryItem[] = state.library.filter(l => tab === 'all' || l.kind === tab);

  return (
    <>
      <div className="libhead">
        <div className="wrap">
          <h1>My Library</h1>
          <p>Every PDF you&apos;ve downloaded or purchased — re-download anytime, forever.</p>
          <div className="libtabs">
            {(['all', 'paid', 'free'] as const).map(t => (
              <button
                key={t}
                className={tab === t ? 'on' : ''}
                onClick={() => setTab(t)}
              >
                {t === 'all' ? 'All items' : t === 'paid' ? 'Purchased' : 'Free downloads'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 60 }}>
        {list.length ? list.map(l => {
          const p = byId(l.id);
          if (!p) return null;
          return (
            <div key={l.id} className="librow">
              <div dangerouslySetInnerHTML={{ __html: coverHTML(p, 'sm') }} />
              <div>
                <h3><a style={{ color: '#0f1111', cursor: 'pointer' }} onClick={() => router.push(`/pdf/${p.slug}`)}>{p.title}</a></h3>
                <div className="m">{p.author} · {p.pages} pages · {(p.pages * 0.09).toFixed(1)} MB · Added {l.date}</div>
              </div>
              <span className={`kind ${l.kind}`}>{l.kind === 'free' ? 'FREE DOWNLOAD' : 'PURCHASED'}</span>
              <button className="dl-btn" onClick={() => downloadFree(p.id)}>⤓ Download PDF</button>
            </div>
          );
        }) : (
          <div className="empty" style={{ background: '#fff', borderRadius: 8 }}>
            <h3>Nothing here yet</h3>
            <p>Download a free PDF or make a purchase and it&apos;ll live here forever.</p>
          </div>
        )}
      </div>
    </>
  );
}
