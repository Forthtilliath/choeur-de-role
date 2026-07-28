import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function ConcertCardSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div className={`border border-border rounded-2xl bg-background-secondary overflow-hidden flex ${large ? 'flex-col sm:flex-row' : 'flex-col'}`}>
      {large && <Skeleton className="w-full sm:w-48 h-48 shrink-0" />}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default function ConcertsLoading() {
  return (
    <Main title="Nos concerts">
      {/* Upcoming section */}
      <div className="mb-12">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <ConcertCardSkeleton key={i} large />
          ))}
        </div>
      </div>

      {/* Past section */}
      <div>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ConcertCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </Main>
  );
}
