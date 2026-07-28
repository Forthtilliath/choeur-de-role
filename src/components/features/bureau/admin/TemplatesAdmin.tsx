'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2, ChevronRight } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createTemplate, deleteTemplate } from '../templateActions';
import type { TaskTemplate } from '@/types/tasks';

export function TemplatesAdmin({ templates }: { templates: TaskTemplate[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<TaskTemplate | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    const result = await createTemplate({ name: name.trim(), description: description.trim() || undefined });
    if ('error' in result) {
      setError(result.error);
    } else {
      router.push(`/choristes/admin/bureau/templates/${result.id}`);
    }
    setCreating(false);
  }

  async function handleDelete() {
    if (!toDelete) return;
    await deleteTemplate(toDelete.id);
    setToDelete(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Création */}
      <section className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Nouveau template</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Concert standard"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {creating ? 'Création...' : 'Créer et éditer'}
            </button>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="flex flex-col gap-3">
        {templates.length === 0 && (
          <p className="text-sm text-foreground/40 italic text-center py-6">Aucun template.</p>
        )}
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground truncate block">{t.name}</span>
              <span className="text-xs text-foreground/40">
                {t.item_count} tâche{t.item_count !== 1 ? 's' : ''}
                {t.description ? ` · ${t.description}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/choristes/admin/bureau/templates/${t.id}`}
                className="flex items-center gap-1 text-xs text-foreground/50 hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Éditer <ChevronRight size={12} />
              </Link>
              <button
                onClick={() => setToDelete(t)}
                className="text-foreground/30 hover:text-red-500 transition-colors p-1.5"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {toDelete && (
        <ConfirmModal
          title="Supprimer le template"
          message="Toutes les tâches types de ce template seront supprimées. Les projets créés depuis ce template ne sont pas affectés."
          confirmLabel="Supprimer"
          danger
          details={{ label: toDelete.name }}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
