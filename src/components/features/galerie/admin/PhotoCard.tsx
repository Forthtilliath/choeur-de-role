'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import type { GalleryPhoto } from '../types';

type Props = {
  photo: GalleryPhoto;
  index: number;
  total: number;
  onDeleteAction: () => void;
  onMoveAction: (dir: 'left' | 'right') => void;
  onUpdateCaptionAction: (caption: string) => void;
};

export function PhotoCard({ photo, index, total, onDeleteAction, onMoveAction, onUpdateCaptionAction }: Props) {
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [showActions, setShowActions] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1.5">
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-background-secondary group"
        onClick={() => setShowActions(s => !s)}
      >
        <Image
          src={photo.url}
          alt={photo.caption ?? ''}
          fill
          className="object-cover"
          sizes="25vw"
        />

        {/* Poignée drag — desktop uniquement */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded bg-black/50 text-white text-xs hidden md:flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none z-10"
          title="Glisser pour réordonner"
        >
          ⠿
        </button>

        {/* Actions */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity flex flex-col items-center justify-center gap-2 ${showActions ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-1">
            <button
              onClick={() => { onMoveAction('left'); setShowActions(false); }}
              disabled={index === 0}
              className="px-3 py-2 rounded bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={() => { onMoveAction('right'); setShowActions(false); }}
              disabled={index === total - 1}
              className="px-3 py-2 rounded bg-white/20 hover:bg-white/40 text-white text-xs disabled:opacity-30"
            >
              →
            </button>
          </div>
          <button
            onClick={() => { onDeleteAction(); setShowActions(false); }}
            className="px-3 py-2 rounded bg-red-500/70 hover:bg-red-500 text-white text-xs"
          >
            Supprimer
          </button>
        </div>
      </div>

      {editingCaption ? (
        <input
          autoFocus
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => {
            onUpdateCaptionAction(caption);
            setEditingCaption(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onUpdateCaptionAction(caption);
              setEditingCaption(false);
            }
          }}
          className="text-xs bg-background border border-primary rounded px-2 py-1 outline-none w-full"
        />
      ) : (
        <button
          onClick={() => setEditingCaption(true)}
          className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors text-left truncate"
        >
          {caption || '+ Légende'}
        </button>
      )}
    </div>
  );
}
