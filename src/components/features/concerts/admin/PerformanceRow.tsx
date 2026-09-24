import { FileText, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { formatDateTimeShort } from '@/utils/dateHelpers';

import type { PerformanceWithDates } from '../types';

export function PerformanceRow({
  performance,
  isLocked,
  onEdit,
  onDelete,
}: {
  performance: PerformanceWithDates;
  isLocked?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dates = [...performance.performance_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Image portrait */}
        {performance.image_url ? (
          <Link
            href={`/api/r2/image-view?url=${encodeURIComponent(performance.image_url)}`}
            target="_blank"
            className="relative block w-10 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0"
            title="Voir l'affiche"
          >
            <Image
              src={performance.image_url}
              alt={performance.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </Link>
        ) : (
          <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0">
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-primary text-lg">🎵</span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{performance.title}</p>
          {performance.venue && (
            <p className="text-xs text-foreground/50 truncate">📍 {performance.venue}</p>
          )}
          <div className="flex flex-col gap-0.5 mt-1">
            {dates.slice(0, 2).map((d) => (
              <p key={d.id} className="text-xs text-foreground/40">
                📅 {formatDateTimeShort(d.date)}
              </p>
            ))}
            {dates.length > 2 && (
              <p className="text-xs text-foreground/40">+{dates.length - 2} autres dates</p>
            )}
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            href={`/choristes/admin/concerts/${performance.slug}/programme`}
            className="gap-1.5"
            title="Voir le programme imprimable"
          >
            <FileText size={13} />
            <span className="hidden sm:inline">Programme</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Pencil size={13} />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
            <Trash2 size={13} />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      )}
    </div>
  );
}
