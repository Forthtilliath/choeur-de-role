'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Eye, EyeOff, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sortByOrderIndex } from '@/utils/arrayHelpers';
import { deleteLink, toggleLinkActive, updateLinksOrder, upsertLink } from './clientQueries';
import { MemberLink, Visibility, VISIBILITY_BADGE, VISIBILITY_LABEL, VISIBILITY_OPTIONS } from './types';

export function LiensAdminClient({ initialLinks }: { initialLinks: MemberLink[] }) {
  const [links, setLinks] = useState<MemberLink[]>(sortByOrderIndex(initialLinks));
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<MemberLink | null>(null);
  const confirm = useConfirm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, order_index: i }));
    setLinks(reordered);
    await updateLinksOrder(reordered.map((l) => ({ id: l.id, order_index: l.order_index ?? 0 })));
  }

  function handleSave(link: MemberLink) {
    setLinks((prev) => {
      const exists = prev.find((l) => l.id === link.id);
      return exists ? prev.map((l) => (l.id === link.id ? link : l)) : [...prev, link];
    });
    setShowForm(false);
    setEditingLink(null);
  }

  async function handleToggleActive(link: MemberLink) {
    const ok = await toggleLinkActive(link.id, !link.active);
    if (ok) {
      setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, active: !l.active } : l));
      toast.success(link.active ? 'Lien désactivé' : 'Lien activé');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(link: MemberLink) {
    if (!await confirm({
      message: 'Supprimer ce lien ?',
      danger: true,
      details: { icon: '🔗', label: link.label, sublabel: link.url },
    })) return;
    const ok = await deleteLink(link.id);
    if (ok) {
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success('Lien supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingLink(null); setShowForm(true); }}>+ Ajouter un lien</Button>
      </div>

      {showForm && (
        <LinkForm
          key={editingLink?.id ?? 'new'}
          link={editingLink}
          onClose={() => { setShowForm(false); setEditingLink(null); }}
          onSave={handleSave}
        />
      )}

      {links.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucun lien pour le moment.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <SortableLink
                key={link.id}
                link={link}
                onEdit={() => { setEditingLink(link); setShowForm(true); }}
                onToggleActive={() => handleToggleActive(link)}
                onDelete={() => handleDelete(link)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableLink({
  link,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  link: MemberLink;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-shadow ${
        isDragging ? 'shadow-xl ring-1 ring-primary/30 z-50 opacity-80' : !link.active ? 'opacity-50' : ''
      }`}
    >
      {/* Info : handle + label + url */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag handle */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 shrink-0 transition-colors touch-none"
          title="Glisser pour réordonner"
        >
          <GripVertical size={18} />
        </div>

        {/* Label + url + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{link.label}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${VISIBILITY_BADGE[(link.visibility as Visibility) ?? 'member']}`}>
              {VISIBILITY_LABEL[(link.visibility as Visibility) ?? 'member']}
            </span>
          </div>
          <p className="text-xs text-foreground/50 truncate">{link.url}</p>
          {link.description && <p className="text-xs text-foreground/40 mt-0.5 truncate">{link.description}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil size={13} />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggleActive} className="gap-1.5">
          {link.active ? <EyeOff size={13} /> : <Eye size={13} />}
          <span className="hidden sm:inline">{link.active ? 'Désactiver' : 'Activer'}</span>
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
          <Trash2 size={13} />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      </div>
    </div>
  );
}

function LinkForm({
  link, onClose, onSave,
}: {
  link: MemberLink | null;
  onClose: () => void;
  onSave: (link: MemberLink) => void;
}) {
  const [label, setLabel] = useState(link?.label ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [description, setDescription] = useState(link?.description ?? '');
  const [visibility, setVisibility] = useState<Visibility>((link?.visibility as Visibility) ?? 'member');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await upsertLink(
      { label, url, description: description || null, visibility },
      link?.id,
    );
    if (saved) {
      onSave(saved);
      toast.success(link ? 'Lien modifié' : 'Lien ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-4 text-foreground">
        {link ? 'Modifier le lien' : 'Ajouter un lien'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Label</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Google Drive" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} required type="url"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="https://drive.google.com/..." />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Partitions et fichiers audio" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Visibilité</label>
          <div className="flex flex-col gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setVisibility(opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  visibility === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                }`}>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${VISIBILITY_BADGE[opt.value]}`}>
                  {VISIBILITY_LABEL[opt.value]}
                </span>
                <div>
                  <p className={`text-sm font-medium ${visibility === opt.value ? 'text-primary' : 'text-foreground'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-foreground/40">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : link ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
