'use client';

import { useRef, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { CalendarClock, Eye, EyeOff, GripVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { sortByOrderIndex } from '@/utils/arrayHelpers';
import { formatDate, formatDateTimeShort } from '@/utils/dateHelpers';
import { toLocalDatetimeInput } from '@/lib/utils';
import { useDndSensors } from '@/hooks/useDndSensors';
import {
  deleteNews,
  deleteNewsFile,
  toggleNewsPublished,
  toggleNewsPinned,
  updateNewsOrder,
  uploadNewsFile,
  upsertNews,
} from './clientQueries';
import { News, NewsFile } from './types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

function isScheduledFuture(item: News): boolean {
  return !!item.scheduled_at && new Date(item.scheduled_at) > new Date();
}

export function ActualitesAdminClient({ initialNews }: { initialNews: News[] }) {
  const [news, setNews] = useState<News[]>(sortByOrderIndex(initialNews));
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const confirm = useConfirm();
  const sensors = useDndSensors();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = news.findIndex((n) => n.id === active.id);
    const newIndex = news.findIndex((n) => n.id === over.id);
    const reordered = arrayMove(news, oldIndex, newIndex).map((n, i) => ({ ...n, order_index: i }));
    setNews(reordered);
    await updateNewsOrder(reordered.map((n) => ({ id: n.id, order_index: n.order_index ?? 0 })));
  }

  async function handleTogglePublish(item: News) {
    const isPublishing = !item.published;
    const ok = await toggleNewsPublished(item.id, isPublishing);
    if (ok) {
      setNews((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? { ...n, published: isPublishing, scheduled_at: isPublishing ? null : n.scheduled_at }
            : n,
        ),
      );
      toast.success(isPublishing ? 'Actualité publiée' : 'Actualité dépubliée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleTogglePin(item: News) {
    const ok = await toggleNewsPinned(item.id, !item.pinned);
    if (ok) {
      setNews((prev) => prev.map((n) => (n.id === item.id ? { ...n, pinned: !n.pinned } : n)));
      toast.success(item.pinned ? 'Actualité désépinglée' : 'Actualité épinglée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(id: string) {
    const item = news.find((n) => n.id === id);
    if (!await confirm({
      message: 'Supprimer cette actualité ?',
      danger: true,
      details: item ? { icon: '📰', label: item.title } : undefined,
    })) return;
    const ok = await deleteNews(id);
    if (ok) {
      setNews((prev) => prev.filter((n) => n.id !== id));
      toast.success('Actualité supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSave(item: News) {
    const isCreation = !editingNews;
    setNews((prev) => {
      const exists = prev.find((n) => n.id === item.id);
      return exists
        ? prev.map((n) => (n.id === item.id ? item : n))
        : [...prev, { ...item, order_index: prev.length }];
    });
    if (isCreation) {
      setEditingNews(item);
    } else {
      setShowForm(false);
      setEditingNews(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingNews(null);
            setShowForm(true);
          }}
        >
          + Ajouter une actualité
        </Button>
      </div>

      {showForm && (
        <NewsForm
          key={editingNews?.id ?? 'new'}
          news={editingNews}
          totalNews={news.length}
          onClose={() => {
            setShowForm(false);
            setEditingNews(null);
          }}
          onSave={handleSave}
        />
      )}

      {news.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucune actualité pour le moment.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={news.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {news.map((item) => (
              <SortableNewsItem
                key={item.id}
                item={item}
                onEdit={() => { setEditingNews(item); setShowForm(true); }}
                onTogglePin={() => handleTogglePin(item)}
                onTogglePublish={() => handleTogglePublish(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableNewsItem({
  item,
  onEdit,
  onTogglePin,
  onTogglePublish,
  onDelete,
}: {
  item: News;
  onEdit: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const scheduled = isScheduledFuture(item);

  const badge = !item.published
    ? { label: 'Brouillon', className: 'bg-foreground/10 text-foreground/40' }
    : scheduled
      ? { label: '🗓 Programmée', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
      : { label: 'Publié', className: 'bg-primary/10 text-primary' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${item.pinned ? 'border-primary' : 'border-border'} ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Handle + titre + badges */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="text-foreground/30 hover:text-foreground/70 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none"
          title="Glisser pour réordonner"
        >
          <GripVertical size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.pinned && <Pin size={13} className="text-primary shrink-0" />}
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
              {badge.label}
            </span>
            {item.news_files.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/50 shrink-0">
                📎 {item.news_files.length}
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/50 mt-0.5">
            {scheduled && item.scheduled_at
              ? `Publication le ${formatDateTimeShort(item.scheduled_at)}`
              : formatDate(item.created_at ?? '')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil size={13} />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onTogglePin} className="gap-1.5">
          {item.pinned ? <PinOff size={13} /> : <Pin size={13} />}
          <span className="hidden sm:inline">{item.pinned ? 'Désépingler' : 'Épingler'}</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onTogglePublish} className="gap-1.5">
          {item.published ? <EyeOff size={13} /> : <Eye size={13} />}
          <span className="hidden sm:inline">
            {scheduled ? 'Annuler' : item.published ? 'Dépublier' : 'Publier'}
          </span>
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
          <Trash2 size={13} />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      </div>
    </div>
  );
}

function NewsForm({
  news,
  totalNews,
  onClose,
  onSave,
}: {
  news: News | null;
  totalNews: number;
  onClose: () => void;
  onSave: (news: News) => void;
}) {
  const [title, setTitle] = useState(news?.title ?? '');
  const [content, setContent] = useState(news?.content ?? '');
  const [scheduledAt, setScheduledAt] = useState(
    news?.scheduled_at ? toLocalDatetimeInput(news.scheduled_at) : '',
  );
  const [files, setFiles] = useState<NewsFile[]>(news?.news_files ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFileLabel, setNewFileLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useFormShortcuts(onClose);
  const confirm = useConfirm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const scheduledAtIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const isSchedulingFuture = !!scheduledAtIso && new Date(scheduledAtIso) > new Date();

    const saved = await upsertNews(
      {
        title,
        content,
        scheduled_at: scheduledAtIso,
        // programmer pour le futur → publié automatiquement (visible dès la date)
        ...(isSchedulingFuture ? { published: true } : {}),
      },
      news?.id,
      totalNews,
    );

    if (saved) {
      onSave({ ...saved, news_files: files });
      if (isSchedulingFuture) {
        toast.success(`Actualité programmée pour le ${formatDateTimeShort(scheduledAtIso)}`);
      } else {
        toast.success(news ? 'Actualité modifiée' : 'Actualité créée — vous pouvez maintenant ajouter des fichiers');
      }
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!news) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const label = newFileLabel.trim() || file.name;
    setUploading(true);
    const uploaded = await uploadNewsFile(news.id, file, label);
    if (uploaded) {
      setFiles((prev) => [...prev, uploaded]);
      setNewFileLabel('');
      toast.success('Fichier ajouté');
    } else {
      toast.error("Erreur lors de l'upload du fichier");
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleDeleteFile(id: string) {
    if (!await confirm({ message: 'Supprimer ce fichier ?', danger: true })) return;
    const ok = await deleteNewsFile(id);
    if (ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('Fichier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-5 text-foreground">
        {news ? "Modifier l'actualité" : 'Nouvelle actualité'}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Répétition annulée le 15 mars"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Contenu</label>
          <RichEditor
            content={content}
            onChangeAction={setContent}
            placeholder="Contenu de l'actualité..."
          />
        </div>

        {/* Programmation */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <CalendarClock size={14} className="text-foreground/50" />
            Publication programmée
            <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={toLocalDatetimeInput(new Date().toISOString())}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          />
          {scheduledAt && new Date(scheduledAt) > new Date() && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              L&apos;actualité sera visible automatiquement le {formatDateTimeShort(new Date(scheduledAt).toISOString())}.
            </p>
          )}
        </div>

        {/* Section fichiers — disponible uniquement en mode édition */}
        {news ? (
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            <label className="text-sm font-medium text-foreground">Documents joints</label>

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background"
                  >
                    <span className="text-sm text-foreground flex-1 truncate">📎 {f.label}</span>
                    <a
                      href={f.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-md border border-border text-foreground/60 hover:text-primary hover:border-primary transition-colors no-underline shrink-0"
                    >
                      Voir
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.id)}
                      className="text-xs px-2.5 py-1 rounded-md border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newFileLabel}
                onChange={(e) => setNewFileLabel(e.target.value)}
                placeholder="Libellé (ex : Convocation AG 2025)"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  uploading
                    ? 'border-border text-foreground/40 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary/5 cursor-pointer'
                }`}
              >
                {uploading ? 'Upload…' : '+ Fichier'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleUploadFile}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <p className="text-xs text-foreground/40">
              Saisissez un libellé puis cliquez sur &ldquo;+ Fichier&rdquo;. Sans libellé, le nom du fichier est utilisé.
            </p>
          </div>
        ) : (
          <p className="text-xs text-foreground/50 bg-background rounded-lg px-3 py-2.5 border border-border">
            💡 Les documents pourront être ajoutés après la création de l&apos;actualité.
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde…' : news ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
