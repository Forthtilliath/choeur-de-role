import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function PollCardSkeleton() {
  return (
    <div className="border border-border rounded-2xl p-4 bg-background-secondary flex items-start gap-4">
      <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
    </div>
  );
}

export default function SondagesLoading() {
  return (
    <Main variant="choriste" title="Sondages">
      <div className="flex flex-col gap-6">
        {/* Open polls section */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-48" />
          {Array.from({ length: 2 }).map((_, i) => (
            <PollCardSkeleton key={i} />
          ))}
        </div>

        {/* Done polls section */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          <PollCardSkeleton />
        </div>
      </div>
    </Main>
  );
}
