'use client';

import { useMemo, useState } from 'react';
import type { GalleryAlbum } from '../types';

type Props = {
  albums: GalleryAlbum[];
};

export function GalerieStats({ albums }: Props) {
  const [open, setOpen] = useState(false);

  const stats = useMemo(() => {
    const published = albums.filter((a) => a.published);
    const unpublished = albums.filter((a) => !a.published);

    const allPhotos = albums.flatMap((a) => a.gallery_photos);
    const allVideos = albums.flatMap((a) => a.gallery_videos);

    const withoutCover = albums.filter((a) => !a.cover_url);
    const empty = albums.filter((a) => a.gallery_photos.length === 0 && a.gallery_videos.length === 0);

    const byType: Record<string, number> = {};
    for (const a of albums) {
      const type = a.album_type ?? 'photos';
      byType[type] = (byType[type] ?? 0) + 1;
    }

    const richestAlbum = albums.reduce<GalleryAlbum | null>((best, a) => {
      const count = a.gallery_photos.length + a.gallery_videos.length;
      const bestCount = best ? best.gallery_photos.length + best.gallery_videos.length : -1;
      return count > bestCount ? a : best;
    }, null);

    return {
      total: albums.length,
      published: published.length,
      unpublished: unpublished.length,
      totalPhotos: allPhotos.length,
      totalVideos: allVideos.length,
      withoutCover: withoutCover.length,
      empty: empty.length,
      avgPhotos: albums.length > 0 ? (allPhotos.length / albums.length).toFixed(1) : '0',
      richestAlbum,
      richestCount: richestAlbum
        ? richestAlbum.gallery_photos.length + richestAlbum.gallery_videos.length
        : 0,
      byType,
    };
  }, [albums]);

  const warnings = [
    stats.empty > 0 && `${stats.empty} album${stats.empty > 1 ? 's' : ''} vide${stats.empty > 1 ? 's' : ''}`,
    stats.withoutCover > 0 && `${stats.withoutCover} sans couverture`,
    stats.unpublished > 0 && `${stats.unpublished} album${stats.unpublished > 1 ? 's' : ''} non publié${stats.unpublished > 1 ? 's' : ''}`,
  ].filter(Boolean) as string[];

  return (
    <div className="border border-border rounded-2xl bg-background-secondary overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
            Statistiques
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-foreground/60">
              {stats.total} album{stats.total !== 1 ? 's' : ''}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-foreground/60">
              {stats.totalPhotos} photo{stats.totalPhotos !== 1 ? 's' : ''}
            </span>
            {stats.totalVideos > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-foreground/60">
                {stats.totalVideos} vidéo{stats.totalVideos !== 1 ? 's' : ''}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700">
                {warnings.length} avertissement{warnings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <span className="text-foreground/30 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-5 border-t border-border">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <Kpi
              label="Albums publiés"
              value={`${stats.published} / ${stats.total}`}
              sub={stats.unpublished > 0 ? `${stats.unpublished} non publié${stats.unpublished > 1 ? 's' : ''}` : 'Tous publiés'}
              accent={stats.unpublished > 0 ? 'amber' : 'green'}
            />
            <Kpi
              label="Photos"
              value={stats.totalPhotos}
              sub={`moy. ${stats.avgPhotos} / album`}
            />
            {stats.totalVideos > 0 && (
              <Kpi
                label="Vidéos YouTube"
                value={stats.totalVideos}
                sub={`${stats.byType['videos'] ?? 0} album${(stats.byType['videos'] ?? 0) !== 1 ? 's' : ''} vidéo`}
              />
            )}
            {stats.richestAlbum && (
              <Kpi
                label="Album le plus riche"
                value={stats.richestCount}
                sub={stats.richestAlbum.title}
              />
            )}
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">À vérifier</p>
              <div className="flex flex-wrap gap-2">
                {warnings.map((w) => (
                  <span
                    key={w}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700"
                  >
                    ⚠ {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Répartition par type */}
          {Object.keys(stats.byType).length > 1 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest">Répartition</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <span key={type} className="text-xs px-3 py-1.5 rounded-lg bg-background border border-border text-foreground/60">
                    {TYPE_LABELS[type] ?? type} — {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  photos: 'Photos',
  videos: 'Vidéos YouTube',
};

function Kpi({
  label,
  value,
  sub,
  accent = 'neutral',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'neutral' | 'green' | 'amber' | 'red';
}) {
  const subColor = {
    neutral: 'text-foreground/40',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  }[accent];

  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-background rounded-xl border border-border">
      <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {sub && <span className={`text-xs ${subColor}`}>{sub}</span>}
    </div>
  );
}
