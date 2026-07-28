import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border border-border rounded-xl bg-background-secondary">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="hidden sm:flex gap-1.5 shrink-0">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export default function RepertoireLoading() {
  return (
    <Main variant="choriste">
      <Skeleton className="h-8 w-40 mb-8 rounded" />
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Song list */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SongRowSkeleton key={i} />
        ))}
      </div>
    </Main>
  );
}
