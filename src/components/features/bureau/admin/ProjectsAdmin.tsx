'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Select } from '@/components/ui/Select';
import { createProject, deleteProject, toggleProjectActive } from '../projectActions';
import type { TaskProject, TaskTemplate } from '@/types/tasks';

type Props = {
  projects: TaskProject[];
  templates: TaskTemplate[];
};

export function ProjectsAdmin({ projects, templates }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<TaskProject | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    const result = await createProject({
      name: name.trim(),
      description: description.trim() || undefined,
      template_id: templateId || undefined,
    });
    if ('error' in result) {
      setError(result.error);
    } else {
      setName('');
      setDescription('');
      setTemplateId('');
      router.refresh();
    }
    setCreating(false);
  }

  async function handleToggle(project: TaskProject) {
    await toggleProjectActive(project.id, !project.is_active);
    router.refresh();
  }

  async function handleDelete() {
    if (!toDelete) return;
    await deleteProject(toDelete.id);
    setToDelete(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Création */}
      <section className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Nouveau projet</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Concert 2026"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Template (optionnel)</label>
              <Select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <option value="">— Aucun template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.item_count} tâche{t.item_count !== 1 ? 's' : ''})
                  </option>
                ))}
              </Select>
            </div>
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
              {creating ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </section>

      {/* Liste */}
      <section className="flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="text-sm text-foreground/40 italic text-center py-6">Aucun projet.</p>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${project.is_active ? 'bg-green-500' : 'bg-foreground/20'}`} />
                <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
                <span className="text-xs text-foreground/40">
                  {project.task_count} tâche{project.task_count !== 1 ? 's' : ''}
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-foreground/40 mt-0.5 pl-4 truncate">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/choristes/bureau/taches/${project.id}`}
                className="text-xs text-foreground/50 hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Voir
              </Link>
              <button
                onClick={() => handleToggle(project)}
                className={`text-xs font-medium rounded-lg px-2.5 py-1.5 border transition-colors ${
                  project.is_active
                    ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30'
                    : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30'
                }`}
              >
                {project.is_active ? 'Archiver' : 'Réactiver'}
              </button>
              <button
                onClick={() => setToDelete(project)}
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
          title="Supprimer le projet"
          message="Toutes les tâches associées seront définitivement supprimées."
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
