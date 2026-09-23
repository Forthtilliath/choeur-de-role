'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/ping', { method: 'POST', signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [pathname]);

  return null;
}
