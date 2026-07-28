'use client';

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDndSensors } from '@/hooks/useDndSensors';
import { updatePhotosOrder } from '../clientQueries';
import type { GalleryPhoto } from '../types';
import { PhotoCard } from './PhotoCard';

type Props = {
  albumId: string;
  photos: GalleryPhoto[];
  onReorderAction: (photos: GalleryPhoto[]) => void;
  onDeleteAction: (photoId: string) => void;
  onUpdateCaptionAction: (photoId: string, caption: string) => void;
};

export function PhotoGrid({ photos, onReorderAction, onDeleteAction, onUpdateCaptionAction }: Props) {
  const sensors = useDndSensors();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order_index: i,
    }));

    onReorderAction(reordered);
    await updatePhotosOrder(reordered.map((p) => ({ id: p.id, order_index: p.order_index })));
  }

  async function handleMove(photoId: string, dir: 'left' | 'right') {
    const idx = photos.findIndex((p) => p.id === photoId);
    if (dir === 'left' && idx === 0) return;
    if (dir === 'right' && idx === photos.length - 1) return;

    const swapIdx = dir === 'left' ? idx - 1 : idx + 1;
    const reordered = [...photos];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    const updated = reordered.map((p, i) => ({ ...p, order_index: i }));

    onReorderAction(updated);
    await updatePhotosOrder(updated.map((p) => ({ id: p.id, order_index: p.order_index })));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={idx}
              total={photos.length}
              onDeleteAction={() => onDeleteAction(photo.id)}
              onMoveAction={(dir) => handleMove(photo.id, dir)}
              onUpdateCaptionAction={(caption) => onUpdateCaptionAction(photo.id, caption)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
