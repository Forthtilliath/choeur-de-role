'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';

import type { Partner } from './types';

const SIZE_LABELS: Record<NonNullable<Partner['size']>, string> = {
  current_large: 'En cours — Large',
  current_square: 'En cours — Carré',
  past_large: 'Passé — Large',
  past_square: 'Passé — Carré',
};

export function SortablePartnerRow({
  partner,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  partner: Partner;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: partner.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-foreground/30 hover:text-foreground/60 cursor-grab active:cursor-grabbing text-lg"
      >
        ⠿
      </button>
      <div className="relative w-16 h-10 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
        {partner.logo_url ? (
          <Image
            src={partner.logo_url}
            alt={partner.name}
            className="object-contain p-1 w-auto h-10"
            width={64}
            height={40}
          />
        ) : (
          <span className="text-foreground/30 text-xs">📷</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{partner.name}</p>
        <p className="text-xs text-foreground/50">
          {partner.size ? SIZE_LABELS[partner.size] : ''}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${partner.active ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground/40'}`}
      >
        {partner.active ? 'Actif' : 'Inactif'}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Modifier
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggleActive}>
          {partner.active ? 'Désactiver' : 'Activer'}
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
