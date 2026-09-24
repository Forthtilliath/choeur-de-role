'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { TaskTemplate } from '@/types/tasks';

import { updateTemplate } from '../templateActions';

const LABEL_CLASS = 'text-xs font-medium text-foreground/60 uppercase tracking-wide';
const INPUT_CLASS =
  'border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors';

export function TemplateMetaForm({ template }: { template: TaskTemplate }) {
  const router = useRouter();
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDesc, setTemplateDesc] = useState(template.description ?? '');
  const [savingMeta, setSavingMeta] = useState(false);

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName.trim()) return;
    setSavingMeta(true);
    await updateTemplate(template.id, {
      name: templateName.trim(),
      description: templateDesc.trim() || null,
    });
    setSavingMeta(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Informations du template</h2>
      <form onSubmit={handleSaveMeta} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="template-name" className={LABEL_CLASS}>
              Nom *
            </label>
            <input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="template-description" className={LABEL_CLASS}>
              Description
            </label>
            <input
              id="template-description"
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              placeholder="Description optionnelle"
              className={INPUT_CLASS}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!templateName.trim() || savingMeta}
            className="px-4 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {savingMeta ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </section>
  );
}
