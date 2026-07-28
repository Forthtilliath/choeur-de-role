'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/ping', { method: 'POST' }).catch(() => {});
  }, [pathname]);

  return null;
}
