'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import type { PerformanceTitle } from '@/components/features/concerts';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { sortByOrderIndex } from '@/utils/arrayHelpers';
import type { GalleryAlbum, GalleryPhoto } from '../types';
import { PhotoGrid } from './PhotoGrid';
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
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<{ file: File; previewUrl: string }[]>([]);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(URL.createObjectURL(f));
    setPendingCoverFile(f);
  }

  function confirmCover() {
    if (!pendingCoverFile) return;
    onUploadCoverAction(pendingCoverFile);
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(null);
    setPendingCoverFile(null);
  }

  function cancelCoverPreview() {
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(null);
    setPendingCoverFile(null);
  }

  function handlePhotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos(
      Array.from(files).map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    );
    e.target.value = '';
  }

  function confirmPhotos() {
    if (pendingPhotos.length === 0) return;
    onUploadPhotosAction(pendingPhotos.map((p) => p.file));
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
  }

  function cancelPhotos() {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
  }

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
        {/* Cover */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background-tertiary shrink-0 group">
          {coverPreviewUrl ? (
            <>
              <Image src={coverPreviewUrl} alt="" fill className="object-cover" sizes="48px" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                <button onClick={confirmCover} aria-label="Valider la couverture" className="text-emerald-400 hover:text-emerald-300 text-xs">✓</button>
                <button onClick={cancelCoverPreview} aria-label="Annuler" className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
            </>
          ) : album.cover_url ? (
            <>
              <Image src={album.cover_url} alt="" fill className="object-cover" sizes="48px" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <label className="cursor-pointer text-white text-xs hover:underline">
                  ✏️
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
                </label>
                <button onClick={onRemoveCoverAction} aria-label="Supprimer la couverture" className="text-white text-xs hover:underline">
                  ✕
                </button>
              </div>
            </>
          ) : (
            <label className="w-full h-full flex items-center justify-center cursor-pointer text-foreground/30 hover:text-foreground/60 transition-colors">
              <span className="text-lg">📷</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
            </label>
          )}
        </div>

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
              <label className="text-xs text-foreground/50 mb-1 block">Description</label>
              <input
                defaultValue={album.description ?? ''}
                onBlur={(e) => onUpdateAlbumAction({ description: e.target.value })}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
                placeholder="Description de l'album..."
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Concert associé</label>
              <Select
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

          {/* Upload photos */}
          <div>
            <label className="text-xs text-foreground/50 mb-2 block">Ajouter des photos</label>
            {pendingPhotos.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  {pendingPhotos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-background-tertiary">
                      <Image src={p.previewUrl} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground/50">
                  {pendingPhotos.length} photo{pendingPhotos.length > 1 ? 's' : ''} sélectionnée{pendingPhotos.length > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" disabled={uploading} onClick={confirmPhotos}>
                    ✓ Valider l&apos;envoi
                  </Button>
                  <Button size="sm" variant="danger" disabled={uploading} onClick={cancelPhotos}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <label
                className={cn(
                  'cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-colors text-sm',
                  uploading
                    ? 'border-primary text-primary bg-primary/5 pointer-events-none'
                    : 'border-border text-foreground/50 hover:border-primary hover:bg-primary/5 hover:text-primary',
                )}
              >
                {uploading ? '⏳ Upload en cours...' : '📷 Choisir des photos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handlePhotosSelect}
                />
              </label>
            )}
          </div>

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
