'use client';

import { useMemo, useState } from 'react';
import { GalerieClient } from './GalerieClient';
import type { GalleryAlbum } from './types';

export function GalerieWithPerformanceFilter({
  albums,
  canEdit = false,
}: {
  albums: GalleryAlbum[];
  canEdit?: boolean;
}) {
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);

  // Build ordered unique list of performances from albums (preserves display order)
  const performances = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; title: string }[] = [];
    for (const album of albums) {
      if (album.performance_id && album.performances?.title && !seen.has(album.performance_id)) {
        seen.add(album.performance_id);
        list.push({ id: album.performance_id, title: album.performances.title });
      }
    }
    return list;
  }, [albums]);

  const filtered = useMemo(
    () =>
      selectedPerformanceId
        ? albums.filter((a) => a.performance_id === selectedPerformanceId)
        : albums,
    [albums, selectedPerformanceId],
  );

  return (
    <div>
      {performances.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-foreground/50 mr-1">Concert :</span>
          <button
            onClick={() => setSelectedPerformanceId(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !selectedPerformanceId
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
            }`}
          >
            Tous
          </button>
          {performances.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPerformanceId(selectedPerformanceId === p.id ? null : p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedPerformanceId === p.id
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}
      <GalerieClient albums={filtered} canEdit={canEdit} />
    </div>
  );
}
