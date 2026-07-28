'use client';

import dynamic from 'next/dynamic';

export const RichEditor = dynamic(() => import('./RichEditor').then(m => m.RichEditor), {
  ssr: false,
  loading: () => (
    <div className="border border-border rounded-xl bg-background-secondary animate-pulse h-48" />
  ),
});

