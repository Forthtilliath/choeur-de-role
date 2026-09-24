'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

import { replaceEventDates, uploadEventImage, upsertEvent } from '../clientQueries';
import type { ExternalEvent } from '../types';

import type { DateEntry } from './eventDates';
import { dateEntryFromRecord, dateEntryToPayload, emptyEntry } from './eventDates';
import { EventDatesField } from './EventDatesField';
import { EventFilesSection } from './EventFilesSection';
export function EventForm({
  event,
  onCloseAction,
  onSaveAction,
}: {
  event: ExternalEvent | null;
  onCloseAction: () => void;
  onSaveAction: (event: ExternalEvent) => void;
}) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [externalUrl, setExternalUrl] = useState(event?.external_url ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(event?.image_url ?? '');
  const [dates, setDates] = useState<DateEntry[]>(
    () => event?.external_event_dates.map(dateEntryFromRecord) ?? [emptyEntry()],
  );
  const [files, setFiles] = useState(event?.external_event_files ?? []);
  const [saving, setSaving] = useState(false);
  const formRef = useFormShortcuts(onCloseAction);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let image_url = event?.image_url ?? null;
    if (imageFile) {
      image_url = (await uploadEventImage(imageFile)) ?? image_url;
    }

    const saved = await upsertEvent(
      {
        title,
        location: location || null,
        description: description || null,
        external_url: externalUrl || null,
        image_url,
      },
      event?.id,
    );

    if (!saved) {
      toast.error('Erreur lors de la sauvegarde');
      setSaving(false);
      return;
    }

    const validDates = dates.filter((d) => d.startDate);
    const newDates = await replaceEventDates(saved.id, validDates.map(dateEntryToPayload));

    onSaveAction({ ...saved, external_event_dates: newDates, external_event_files: files });
    toast.success(event ? 'Évènement modifié' : 'Évènement ajouté');
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-5 text-foreground">
        {event ? "Modifier l'évènement" : 'Ajouter un évènement'}
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Titre + Lieu */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="event-title" className="text-sm font-medium text-foreground">
              Titre
            </label>
            <input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Concert de printemps"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="event-location" className="text-sm font-medium text-foreground">
              Lieu <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Salle des fêtes, Angers"
            />
          </div>
        </div>

        <EventDatesField dates={dates} onChangeAction={setDates} />

        {/* Description RichEditor */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </span>
          <div className="rounded-xl overflow-hidden border border-border">
            <RichEditor
              content={description}
              onChangeAction={setDescription}
              placeholder="Informations sur l'évènement..."
            />
          </div>
        </div>

        {/* Lien externe */}
        <div className="flex flex-col gap-1">
          <label htmlFor="event-external-url" className="text-sm font-medium text-foreground">
            Lien externe <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            id="event-external-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            type="url"
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="https://..."
          />
        </div>

        {/* Affiche */}
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-sm font-medium text-foreground">
              Affiche <span className="text-foreground/40 font-normal">(portrait recommandé)</span>
            </span>
            <label aria-label="Ajouter une affiche" className="cursor-pointer self-start">
              <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all bg-background">
                <span>📷</span>
                <span>{imagePreview ? "Changer l'affiche" : 'Ajouter une affiche'}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageFile(f);
                  setImagePreview(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>
          {imagePreview ? (
            <div className="relative shrink-0 w-16 h-24 border border-border rounded-lg overflow-hidden bg-background">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={imagePreview.startsWith('blob:')}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="shrink-0 w-16 h-24 border border-dashed border-border rounded-lg bg-background-secondary flex items-center justify-center">
              <span className="text-foreground/20 text-2xl">🎭</span>
            </div>
          )}
        </div>

        {/* Fichiers — uniquement en modification */}
        {event && (
          <EventFilesSection eventId={event.id} files={files} onFilesChangeAction={setFiles} />
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : event ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
