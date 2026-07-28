'use client';

import { usePathname } from 'next/navigation';

export function PageTransition({
  children,
  skipForAdmin = true,
}: {
  children: React.ReactNode;
  skipForAdmin?: boolean;
}) {
  const pathname = usePathname();
  if (skipForAdmin && pathname.startsWith('/choristes/admin')) return <>{children}</>;
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
