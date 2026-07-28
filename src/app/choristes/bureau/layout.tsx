import { isCa } from '@/lib/auth';
import { handlePageAccess } from '@/lib/auth';

export default async function BureauLayout({ children }: { children: React.ReactNode }) {
  await handlePageAccess(isCa);
  return <>{children}</>;
}
