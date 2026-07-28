import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function NewsCardSkeleton({ pinned = false }: { pinned?: boolean }) {
  return (
    <div className={`border border-border rounded-2xl p-5 bg-background-secondary flex flex-col gap-3 ${pinned ? 'ring-1 ring-primary/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
        {pinned && <Skeleton className="h-5 w-14 rounded-full shrink-0" />}
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export default function ActualitesLoading() {
  return (
    <Main variant="choriste" title="Actualités">
      {/* Intro block */}
      <div className="mb-4 md:mb-8 p-6 rounded-2xl border border-border bg-background-secondary flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Pinned news */}
      <div className="flex flex-col gap-4 mb-4 md:mb-8">
        <NewsCardSkeleton pinned />
      </div>

      {/* Regular news */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </Main>
  );
}
