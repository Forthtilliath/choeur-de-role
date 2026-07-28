'use client';

import { useEffect, useRef, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { useDndSensors } from '@/hooks/useDndSensors';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  deletePartner,
  togglePartnerActive,
  updatePartnersOrder,
  uploadPartnerLogo,
  upsertPartner,
} from './clientQueries';
import { Partner } from './types';

const SIZE_LABELS: Record<NonNullable<Partner['size']>, string> = {
  current_large: 'En cours — Large',
  current_square: 'En cours — Carré',
  past_large: 'Passé — Large',
  past_square: 'Passé — Carré',
};

export function PartenairesAdminClient({
  initialPartners,
}: {
  initialPartners: Partner[];
}) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const confirm = useConfirm();

  const sensors = useDndSensors();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = partners.findIndex((p) => p.id === active.id);
    const newIndex = partners.findIndex((p) => p.id === over.id);
    const newPartners = arrayMove(partners, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order_index: i,
    }));
    setPartners(newPartners);
    await updatePartnersOrder(
      newPartners.map((p) => ({ id: p.id, order_index: p.order_index ?? 0 })),
    );
  }

  async function confirmDirty(): Promise<boolean> {
    if (!isDirty) return true;
    return confirm({ message: 'Vous avez des modifications non sauvegardées. Les abandonner ?' });
  }

  async function openNew() {
    if (!await confirmDirty()) return;
    setIsDirty(false);
    setEditingPartner(null);
    setShowForm(true);
  }

  async function openEdit(partner: Partner) {
    if (!await confirmDirty()) return;
    setIsDirty(false);
    setEditingPartner(partner);
    setShowForm(true);
  }

  async function closeForm() {
    if (!await confirmDirty()) return;
    setShowForm(false);
    setEditingPartner(null);
    setIsDirty(false);
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openNew}>+ Ajouter un sponsor</Button>
      </div>

      {showForm && (
        <PartnerForm
          key={editingPartner?.id ?? 'new'}
          partner={editingPartner}
          onClose={closeForm}
          onDirtyChange={setIsDirty}
          onSave={(partner) => {
            setPartners((prev) => {
              const exists = prev.find((p) => p.id === partner.id);
              return exists
                ? prev.map((p) => (p.id === partner.id ? partner : p))
                : [...prev, partner];
            });
            setShowForm(false);
            setEditingPartner(null);
            setIsDirty(false);
          }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {partners.map((partner) => (
              <SortablePartnerRow
                key={partner.id}
                partner={partner}
                onEdit={() => openEdit(partner)}
                onToggleActive={async () => {
                  const ok = await togglePartnerActive(partner.id, !partner.active);
                  if (ok) {
                    setPartners((prev) =>
                      prev.map((p) => (p.id === partner.id ? { ...p, active: !p.active } : p)),
                    );
                    toast.success(partner.active ? 'Sponsor désactivé' : 'Sponsor activé');
                  } else {
                    toast.error('Erreur lors de la mise à jour');
                  }
                }}
                onDelete={async () => {
                  if (!await confirm({
                    message: 'Supprimer ce partenaire ?',
                    danger: true,
                    details: { icon: '🤝', label: partner.name },
                  })) return;
                  const ok = await deletePartner(partner.id);
                  if (ok) {
                    setPartners((prev) => prev.filter((p) => p.id !== partner.id));
                    toast.success('Sponsor supprimé');
                  } else {
                    toast.error('Erreur lors de la suppression');
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {partners.length === 0 && (
        <p className="text-center text-foreground/50 py-12">Aucun sponsor pour le moment.</p>
      )}
    </div>
  );
}

function SortablePartnerRow({
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

function PartnerForm({
  partner,
  onClose,
  onSave,
  onDirtyChange,
}: {
  partner: Partner | null;
  onClose: () => void;
  onSave: (partner: Partner) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [name, setName] = useState(partner?.name ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(partner?.website_url ?? '');
  const [isCurrent, setIsCurrent] = useState(!partner?.size?.startsWith('past'));
  const [isLarge, setIsLarge] = useState(partner?.size?.endsWith('large') ?? true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(partner?.logo_url ?? '');
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const initial = useRef({
    name: partner?.name ?? '',
    websiteUrl: partner?.website_url ?? '',
    isCurrent: !partner?.size?.startsWith('past'),
    isLarge: partner?.size?.endsWith('large') ?? true,
  });

  useEffect(() => {
    if (!formRef.current) return;
    const top = formRef.current.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const dirty =
      name !== initial.current.name ||
      websiteUrl !== initial.current.websiteUrl ||
      isCurrent !== initial.current.isCurrent ||
      isLarge !== initial.current.isLarge ||
      logoFile !== null;
    onDirtyChange(dirty);
  }, [name, websiteUrl, isCurrent, isLarge, logoFile, onDirtyChange]);

  function getSize(): Partner['size'] {
    if (isCurrent && isLarge) return 'current_large';
    if (isCurrent && !isLarge) return 'current_square';
    if (!isCurrent && isLarge) return 'past_large';
    return 'past_square';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let logo_url = partner?.logo_url ?? '';
    if (logoFile) {
      const url = await uploadPartnerLogo(logoFile);
      if (url) logo_url = url;
      else toast.error("Erreur lors de l'upload du logo");
    }

    const saved = await upsertPartner(
      { name, website_url: websiteUrl || null, size: getSize(), logo_url },
      partner?.id,
    );
    if (saved) {
      onSave(saved);
      toast.success(partner ? 'Sponsor modifié' : 'Sponsor ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div
      ref={formRef}
      className="border border-border rounded-2xl p-6 mb-8 bg-background-secondary"
    >
      <h2 className="text-lg font-medium mb-6 text-foreground">
        {partner ? 'Modifier le sponsor' : 'Ajouter un sponsor'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Site web (optionnel)</label>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }}
            className="text-sm text-foreground/70"
          />
          {logoPreview && (
            <div className="relative w-full h-60 border border-border rounded-lg bg-white overflow-hidden">
              <Image
                src={logoPreview}
                alt="Preview"
                fill
                className="object-contain p-2"
                sizes="100vw"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Statut</label>
          <div className="flex gap-3">
            {[
              { value: true, label: 'En cours' },
              { value: false, label: 'Passé' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setIsCurrent(opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-all ${isCurrent === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Format d&apos;affichage</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsLarge(true)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${isLarge ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <div
                className={`w-full h-12 rounded-lg ${isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
              />
              <span
                className={`text-xs font-medium ${isLarge ? 'text-primary' : 'text-foreground/50'}`}
              >
                Large
              </span>
              <span className="text-xs text-foreground/40">
                {isCurrent ? 'Pleine largeur' : '2 par ligne'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsLarge(false)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${!isLarge ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <div className="flex gap-2">
                <div
                  className={`w-10 h-10 rounded-lg ${!isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
                />
                <div
                  className={`w-10 h-10 rounded-lg ${!isLarge ? 'bg-primary/20' : 'bg-foreground/10'}`}
                />
              </div>
              <span
                className={`text-xs font-medium ${!isLarge ? 'text-primary' : 'text-foreground/50'}`}
              >
                Carré
              </span>
              <span className="text-xs text-foreground/40">{isCurrent ? 2 : 3} par ligne</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : partner ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
