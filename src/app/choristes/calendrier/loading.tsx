import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendrierLoading() {
  return (
    <Main variant="choriste" title="Calendrier">
      {/* View toggle + month navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              <Skeleton className="h-3 w-6 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Rows of days */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-border last:border-0">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="min-h-[80px] p-1.5 border-r border-border/50 last:border-0">
                <Skeleton className="h-5 w-5 rounded mb-1" />
                {/* Occasional event blobs */}
                {(row * 7 + col) % 4 === 0 && (
                  <Skeleton className="h-5 w-full rounded-md" />
                )}
                {(row * 7 + col) % 7 === 2 && (
                  <Skeleton className="h-5 w-full rounded-md mt-1" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Main>
  );
}
