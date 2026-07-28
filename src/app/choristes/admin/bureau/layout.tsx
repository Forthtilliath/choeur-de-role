import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminBureauLayout({ children }: { children: React.ReactNode }) {
  await handlePageAccess(isAdmin);
  return <>{children}</>;
}
