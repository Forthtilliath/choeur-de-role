'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { PerformanceTitle } from '@/components/features/concerts';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { sortByOrderIndex } from '@/utils/arrayHelpers';

import type { GalleryAlbum, GalleryPhoto } from '../types';

import { AlbumCover } from './AlbumCover';
import { PhotoGrid } from './PhotoGrid';
import { PhotoUploader } from './PhotoUploader';
import { YoutubePlaylistSync } from './YoutubePlaylistSync';

type Props = {
  album: GalleryAlbum;
  expanded: boolean;
  performances: PerformanceTitle[];
  uploading: boolean;
  onToggleExpandAction: () => void;
  onTogglePublishAction: () => void;
  onDeleteAction: () => void;
  onUpdateAlbumAction: (
    fields: Partial<Pick<GalleryAlbum, 'title' | 'description' | 'performance_id'>>,
  ) => void;
  onUploadCoverAction: (file: File) => void;
  onRemoveCoverAction: () => void;
  onUploadPhotosAction: (files: File[]) => void;
  onDeletePhotoAction: (photoId: string) => void;
  onReorderPhotosAction: (photos: GalleryPhoto[]) => void;
  onUpdateCaptionAction: (photoId: string, caption: string) => void;
};

export function AlbumCard({
  album,
  expanded,
  performances,
  uploading,
  onToggleExpandAction,
  onTogglePublishAction,
  onDeleteAction,
  onUpdateAlbumAction,
  onUploadCoverAction,
  onRemoveCoverAction,
  onUploadPhotosAction,
  onDeletePhotoAction,
  onReorderPhotosAction,
  onUpdateCaptionAction,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(album.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: album.id,
  });

  const sortedPhotos = sortByOrderIndex(album.gallery_photos);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : !album.published ? 0.6 : 1,
      }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-background-secondary">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-3 text-foreground/30 hover:text-foreground/60 cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label="Réordonner l'album"
        >
          ⠿
        </button>
        <AlbumCover
          coverUrl={album.cover_url}
          onUploadAction={onUploadCoverAction}
          onRemoveAction={onRemoveCoverAction}
        />

        {/* Titre + actions dans une colonne */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Titre éditable */}
          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => {
                onUpdateAlbumAction({ title: titleValue });
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateAlbumAction({ title: titleValue });
                  setEditingTitle(false);
                }
              }}
              className="w-full text-sm font-medium bg-background border border-primary rounded px-2 py-0.5 outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left truncate w-full"
            >
              {album.title}
            </button>
          )}

          {/* Ligne 2 : count + actions */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-foreground/40 shrink-0">
              {sortedPhotos.length} photo{sortedPhotos.length > 1 ? 's' : ''}
              {!album.published && ' · Masqué'}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={onTogglePublishAction}>
                <span className="sm:hidden">{album.published ? '🙈' : '👁️'}</span>
                <span className="hidden sm:inline">{album.published ? 'Masquer' : 'Publier'}</span>
              </Button>
              <Button size="sm" variant="danger" onClick={onDeleteAction}>
                <span className="sm:hidden">🗑</span>
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
              <Button size="sm" variant="outline" onClick={onToggleExpandAction}>
                {expanded ? '▲' : '▼'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu expandé */}
      {expanded && (
        <div className="p-4 flex flex-col gap-6">
          {/* Métadonnées */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="album-description" className="text-xs text-foreground/50 mb-1 block">
                Description
              </label>
              <input
                id="album-description"
                defaultValue={album.description ?? ''}
                onBlur={(e) => onUpdateAlbumAction({ description: e.target.value })}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
                placeholder="Description de l'album..."
              />
            </div>
            <div>
              <label htmlFor="album-performance" className="text-xs text-foreground/50 mb-1 block">
                Concert associé
              </label>
              <Select
                id="album-performance"
                value={album.performance_id ?? ''}
                onChange={(e) => onUpdateAlbumAction({ performance_id: e.target.value || null })}
                wrapperClassName="w-full"
              >
                <option value="">— Aucun —</option>
                {performances.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <YoutubePlaylistSync
            albumId={album.id}
            currentUrl={album.youtube_playlist_url ?? ''}
            videoCount={album.gallery_videos?.length ?? 0}
            onSyncAction={() => window.location.reload()}
          />

          <PhotoUploader uploading={uploading} onUploadAction={onUploadPhotosAction} />

          {/* Grille photos avec DnD */}
          {sortedPhotos.length > 0 && (
            <>
              <p className="text-xs text-foreground/40 -mb-4">
                ⠿ Glissez les photos pour les réordonner
              </p>
              <PhotoGrid
                albumId={album.id}
                photos={sortedPhotos}
                onReorderAction={onReorderPhotosAction}
                onDeleteAction={onDeletePhotoAction}
                onUpdateCaptionAction={onUpdateCaptionAction}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
