import { Skeleton } from '@/components/ui/Skeleton';

const COLS = [
  { header: 'w-6', cell: 'h-5 w-5 rounded-sm' },          // CA
  { header: 'w-14', cell: 'h-5 w-20 rounded-full' },       // Pupitre
  { header: 'w-10', cell: 'h-8 w-8 rounded-full' },        // Photo
  { header: 'w-16', cell: 'h-4 w-24' },                    // Prénom
  { header: 'w-20', cell: 'h-4 w-28' },                    // Nom
  { header: 'w-24', cell: 'h-4 w-44', hidden: 'hidden sm:table-cell' }, // Adresse
  { header: 'w-20', cell: 'h-4 w-36', hidden: 'hidden md:table-cell' }, // Courriel
  { header: 'w-24', cell: 'h-4 w-28', hidden: 'hidden lg:table-cell' }, // Téléphone
];

export default function TrombinoscopeLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-6">
      {/* Titre */}
      <div className="text-center flex flex-col items-center gap-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Barre de contrôles */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1 min-w-0 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-28 rounded-lg shrink-0" />
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        </div>

        {/* Filtres pupitres */}
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-7 w-12 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-secondary border-b border-border">
                {COLS.map((col, i) => (
                  <th key={i} className={`px-4 py-2.5 ${col.hidden ?? ''}`}>
                    <Skeleton className={`h-3 ${col.header}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, row) => (
                <tr key={row} className="border-b border-border last:border-0">
                  {COLS.map((col, i) => (
                    <td key={i} className={`px-4 py-2 ${col.hidden ?? ''}`}>
                      <Skeleton className={col.cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
