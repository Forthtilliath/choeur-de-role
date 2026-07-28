'use client';

import { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useConfirm } from '@/context/ConfirmContext';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import type { PerformanceTitle } from '@/components/features/concerts';
import { useDndSensors } from '@/hooks/useDndSensors';
import { Button } from '@/components/ui/Button';
import { AddAlbumForm } from './admin/AddAlbumForm';
import { AlbumCard } from './admin/AlbumCard';
import { GalerieStats } from './admin/GalerieStats';
import {
  addAlbum,
  updateAlbumFields,
  toggleAlbumPublished,
  deleteAlbum,
  updateAlbumsOrder,
  uploadAlbumCover,
  removeAlbumCover,
  uploadPhotos,
  deletePhoto,
  updatePhotoCaption,
} from './clientQueries';
import type { GalleryAlbum, GalleryPhoto } from './types';

type Props = {
  initialAlbums: GalleryAlbum[];
  performances: PerformanceTitle[];
};

export function GalerieAdminClient({ initialAlbums, performances }: Props) {
  const searchParams = useSearchParams();
  const albumParam = searchParams.get('album');
  const [albums, setAlbums] = useState<GalleryAlbum[]>(initialAlbums);
  const [expandedId, setExpandedId] = useState<string | null>(albumParam ?? null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingAlbumId, setUploadingAlbumId] = useState<string | null>(null);
  const confirm = useConfirm();
  const sensors = useDndSensors();

  function updateAlbum(id: string, patch: Partial<GalleryAlbum>) {
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = albums.findIndex((a) => a.id === active.id);
    const newIndex = albums.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(albums, oldIndex, newIndex).map((a, i) => ({
      ...a,
      order_index: i,
    }));
    setAlbums(reordered);
    await updateAlbumsOrder(reordered.map((a) => ({ id: a.id, order_index: a.order_index })));
  }

  async function handleAddAlbum(title: string) {
    const created = await addAlbum(title, albums.length);
    if (created) {
      setAlbums((prev) => [...prev, created]);
      toast.success('Album créé');
    } else {
      toast.error("Erreur lors de la création de l'album");
    }
    setShowAddForm(false);
  }

  async function handleUploadPhotos(albumId: string, files: File[]) {
    setUploadingAlbumId(albumId);
    const uploaded = await uploadPhotos(albumId, files);
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === albumId ? { ...a, gallery_photos: [...a.gallery_photos, ...uploaded] } : a,
      ),
    );
    setUploadingAlbumId(null);
    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} ajoutée${uploaded.length > 1 ? 's' : ''}`);
    } else {
      toast.error("Erreur lors de l'upload des photos");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <GalerieStats albums={albums} />

      <div className="pb-4 border-b border-border text-center">
        {showAddForm ? (
          <AddAlbumForm
            onSaveAction={handleAddAlbum}
            onCancelAction={() => setShowAddForm(false)}
          />
        ) : (
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            + Nouvel album
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={albums.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          expanded={expandedId === album.id}
          performances={performances}
          uploading={uploadingAlbumId === album.id}
          onToggleExpandAction={() => setExpandedId(expandedId === album.id ? null : album.id)}
          onTogglePublishAction={async () => {
            const ok = await toggleAlbumPublished(album.id, !album.published);
            if (ok) {
              updateAlbum(album.id, { published: !album.published });
              toast.success(album.published ? 'Album dépublié' : 'Album publié');
            } else {
              toast.error('Erreur lors de la mise à jour');
            }
          }}
          onDeleteAction={async () => {
            if (!await confirm({
              message: 'Supprimer cet album et toutes ses photos ?',
              danger: true,
              details: { icon: '🖼️', label: album.title },
            })) return;
            const ok = await deleteAlbum(album.id);
            if (ok) {
              setAlbums((prev) => prev.filter((a) => a.id !== album.id));
              toast.success('Album supprimé');
            } else {
              toast.error("Erreur lors de la suppression de l'album");
            }
          }}
          onUpdateAlbumAction={async (fields) => {
            const ok = await updateAlbumFields(album.id, fields);
            if (ok) {
              updateAlbum(album.id, fields);
              toast.success('Album mis à jour');
            } else {
              toast.error("Erreur lors de la mise à jour de l'album");
            }
          }}
          onUploadCoverAction={async (file) => {
            const url = await uploadAlbumCover(album.id, file);
            if (url) {
              updateAlbum(album.id, { cover_url: url });
              toast.success('Couverture mise à jour');
            } else {
              toast.error("Erreur lors de l'upload de la couverture");
            }
          }}
          onRemoveCoverAction={async () => {
            const ok = await removeAlbumCover(album.id);
            if (ok) {
              updateAlbum(album.id, { cover_url: null });
              toast.success('Couverture supprimée');
            } else {
              toast.error('Erreur lors de la suppression de la couverture');
            }
          }}
          onUploadPhotosAction={(files) => handleUploadPhotos(album.id, files)}
          onDeletePhotoAction={async (photoId) => {
            if (!await confirm({ message: 'Supprimer cette photo ?', danger: true })) return;
            const ok = await deletePhoto(photoId);
            if (ok) {
              updateAlbum(album.id, {
                gallery_photos: album.gallery_photos.filter((p) => p.id !== photoId),
              });
              toast.success('Photo supprimée');
            } else {
              toast.error('Erreur lors de la suppression de la photo');
            }
          }}
          onReorderPhotosAction={(photos: GalleryPhoto[]) =>
            updateAlbum(album.id, { gallery_photos: photos })
          }
          onUpdateCaptionAction={async (photoId, caption) => {
            await updatePhotoCaption(photoId, caption);
            updateAlbum(album.id, {
              gallery_photos: album.gallery_photos.map((p) =>
                p.id === photoId ? { ...p, caption } : p,
              ),
            });
          }}
        />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
