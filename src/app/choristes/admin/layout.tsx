import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PageTransition } from '@/components/ui/PageTransition';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-60">
      <AdminSidebar />
      <PageTransition skipForAdmin={false}>{children}</PageTransition>
    </div>
  );
}
