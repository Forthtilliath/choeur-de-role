import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

function AlbumCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl overflow-hidden border border-border bg-background-secondary">
      <Skeleton className="w-full aspect-square" />
      <div className="px-4 pb-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function GalerieLoading() {
  return (
    <Main title="Galerie" subtitle="Retrouvez les photos de nos concerts et répétitions.">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <AlbumCardSkeleton key={i} />
        ))}
      </div>
    </Main>
  );
}
