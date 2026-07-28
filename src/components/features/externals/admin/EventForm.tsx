'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import {
  upsertEvent,
  uploadEventImage,
  replaceEventDates,
  uploadEventFile,
  deleteEventFile,
} from '../clientQueries';
import { ExternalEvent, ExternalEventDate } from '../types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (d: Date) =>
  d.getHours() === 0 && d.getMinutes() === 0 ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

type DateEntry = {
  startDate: string;  // "YYYY-MM-DD"
  startTime: string;  // "HH:MM" or ""
  endTime: string;    // "HH:MM" or "" — heure de fin le même jour
  endDate: string;    // "YYYY-MM-DD" or "" — jour de fin différent
};

function dateEntryFromRecord(d: ExternalEventDate): DateEntry {
  const start = new Date(d.date);
  const end = d.end_date ? new Date(d.end_date) : null;
  const sameDayEnd = end && isSameDay(start, end);
  return {
    startDate: fmtDate(start),
    startTime: fmtTime(start),
    endTime: sameDayEnd ? fmtTime(end!) : '',
    endDate: end && !sameDayEnd ? fmtDate(end) : '',
  };
}

function dateEntryToPayload(e: DateEntry): { date: string; end_date: string | null } {
  const date = new Date(`${e.startDate}T${e.startTime || '00:00'}`).toISOString();
  let end_date: string | null = null;
  if (e.endDate) {
    end_date = new Date(`${e.endDate}T${e.endTime || '00:00'}`).toISOString();
  } else if (e.endTime) {
    end_date = new Date(`${e.startDate}T${e.endTime}`).toISOString();
  }
  return { date, end_date };
}

const emptyEntry = (): DateEntry => ({ startDate: '', startTime: '', endTime: '', endDate: '' });

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
    event?.external_event_dates.map(dateEntryFromRecord) ?? [emptyEntry()],
  );
  const [newFileLabel, setNewFileLabel] = useState('');
  const [newFileInput, setNewFileInput] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [files, setFiles] = useState(event?.external_event_files ?? []);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
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

  async function handleAddFile() {
    if (!event?.id || !newFileInput || !newFileLabel.trim()) return;
    setUploadingFile(true);
    const file = await uploadEventFile(event.id, newFileInput, newFileLabel.trim(), files.length);
    if (file) {
      setFiles((prev) => [...prev, file]);
      toast.success('Fichier ajouté');
    } else {
      toast.error("Erreur lors de l'upload du fichier");
    }
    setNewFileLabel('');
    setNewFileInput(null);
    setUploadingFile(false);
  }

  async function handleDeleteFile(id: string, label: string) {
    if (!await confirm({ message: `Supprimer "${label}" ?`, danger: true })) return;
    const ok = await deleteEventFile(id);
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
        {event ? "Modifier l'évènement" : 'Ajouter un évènement'}
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Titre + Lieu */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Concert de printemps"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Lieu <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Salle des fêtes, Angers"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Dates</label>
          <div className="flex flex-col gap-3">
            {dates.map((entry, idx) => {
              const update = (patch: Partial<DateEntry>) =>
                setDates((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
              return (
                <div key={idx} className="flex flex-col gap-1.5 p-3 border border-border rounded-xl bg-background">
                  {/* Ligne 1 : date début + heures */}
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      type="date"
                      value={entry.startDate}
                      onChange={(e) => update({ startDate: e.target.value })}
                      required={idx === 0}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                    />
                    <span className="text-xs text-foreground/40">de</span>
                    <input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => update({ startTime: e.target.value })}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background w-28"
                      placeholder="--:--"
                    />
                    <span className="text-xs text-foreground/40">à</span>
                    <input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => update({ endTime: e.target.value })}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background w-28"
                      placeholder="--:--"
                    />
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDates((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-auto text-foreground/30 hover:text-red-500 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {/* Ligne 2 : date de fin (stage multi-jours) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/40">jusqu&apos;au</span>
                    <input
                      type="date"
                      value={entry.endDate}
                      onChange={(e) => update({ endDate: e.target.value })}
                      min={entry.startDate || undefined}
                      className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                    />
                    {entry.endDate && (
                      <button
                        type="button"
                        onClick={() => update({ endDate: '', endTime: '' })}
                        className="text-foreground/30 hover:text-red-500 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    )}
                    {!entry.endDate && (
                      <span className="text-xs text-foreground/30 italic">laisser vide si même journée</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setDates((prev) => [...prev, emptyEntry()])}
            className="self-start text-xs text-primary hover:opacity-70 transition-opacity"
          >
            + Ajouter une occurrence
          </button>
        </div>

        {/* Description RichEditor */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
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
          <label className="text-sm font-medium text-foreground">
            Lien externe <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
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
            <label className="text-sm font-medium text-foreground">
              Affiche <span className="text-foreground/40 font-normal">(portrait recommandé)</span>
            </label>
            <label className="cursor-pointer self-start">
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
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">Fichiers joints</label>

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <span className="flex-1 truncate text-foreground/70">📎 {f.label}</span>
                    <a
                      href={f.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:opacity-70"
                    >
                      Voir
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.id, f.label)}
                      className="text-foreground/30 hover:text-red-500 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <input
                value={newFileLabel}
                onChange={(e) => setNewFileLabel(e.target.value)}
                placeholder="Label du fichier..."
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
              />
              <label className="cursor-pointer shrink-0">
                <div className="px-3 py-2 border border-border rounded-lg text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all bg-background">
                  {newFileInput ? '✓ Fichier sélectionné' : '📎 Choisir'}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setNewFileInput(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!newFileInput || !newFileLabel.trim() || uploadingFile}
                onClick={handleAddFile}
              >
                {uploadingFile ? '...' : 'Ajouter'}
              </Button>
            </div>
            <p className="text-xs text-foreground/30">
              Les fichiers sont disponibles sur la page publique de l&apos;évènement.
            </p>
          </div>
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
