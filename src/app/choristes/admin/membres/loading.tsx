import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function MemberRowSkeleton() {
  return (
    <tr className="border-b border-border/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-3.5 w-20" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-5 w-14 rounded-full" /></td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export default function AdminMembresLoading() {
  return (
    <Main variant="admin" size="lg" title="Gestion des membres">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-20" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-14" /></th>
              <th className="px-4 py-3 text-left hidden sm:table-cell"><Skeleton className="h-3 w-16" /></th>
              <th className="px-4 py-3 text-left hidden md:table-cell"><Skeleton className="h-3 w-10" /></th>
              <th className="px-4 py-3 text-left"><Skeleton className="h-3 w-14" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <MemberRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </Main>
  );
}
