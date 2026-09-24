'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

import { upsertLink } from './clientQueries';
import type { MemberLink, Visibility } from './types';
import { VISIBILITY_BADGE, VISIBILITY_LABEL, VISIBILITY_OPTIONS } from './types';

export function LinkForm({
  link,
  onClose,
  onSave,
}: {
  link: MemberLink | null;
  onClose: () => void;
  onSave: (link: MemberLink) => void;
}) {
  const [label, setLabel] = useState(link?.label ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [description, setDescription] = useState(link?.description ?? '');
  const [visibility, setVisibility] = useState<Visibility>(
    (link?.visibility as Visibility) ?? 'member',
  );
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
            <label htmlFor="link-label" className="text-sm font-medium text-foreground">
              Label
            </label>
            <input
              id="link-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Google Drive"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="link-url" className="text-sm font-medium text-foreground">
              URL
            </label>
            <input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              type="url"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="link-description" className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            id="link-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Partitions et fichiers audio"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Visibilité</legend>
          <div className="flex flex-col gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  visibility === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${VISIBILITY_BADGE[opt.value]}`}
                >
                  {VISIBILITY_LABEL[opt.value]}
                </span>
                <div>
                  <p
                    className={`text-sm font-medium ${visibility === opt.value ? 'text-primary' : 'text-foreground'}`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-foreground/40">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : link ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
