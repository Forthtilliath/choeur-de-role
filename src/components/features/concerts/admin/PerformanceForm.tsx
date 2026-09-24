'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { randomId } from '@forthtilliath/ts-kit';

import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toLocalDatetimeInput } from '@/lib/utils';

import {
  replacePerformanceDates,
  uploadPerformanceImage,
  upsertPerformance,
} from '../clientQueries';
import type { PerformanceWithDates, SeasonWithPerformancesWithDates } from '../types';

import type { PerformanceDateInput } from './PerformanceDatesField';
import { PerformanceDatesField } from './PerformanceDatesField';
import { PerformancePosterField } from './PerformancePosterField';
import { RepresentationFileManager } from './RepresentationFileManager';

export function PerformanceForm({
  performance,
  seasonId,
  seasons,
  onClose,
  onSave,
}: {
  performance: PerformanceWithDates | null;
  seasonId: string | null;
  seasons: SeasonWithPerformancesWithDates[];
  onClose: () => void;
  onSave: (performance: PerformanceWithDates) => void;
}) {
  const [title, setTitle] = useState(performance?.title ?? '');
  const [venue, setVenue] = useState(performance?.venue ?? '');
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    performance?.season_id ?? seasonId ?? seasons[0]?.id ?? '',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(performance?.image_url ?? '');
  const [dates, setDates] = useState<PerformanceDateInput[]>(
    () =>
      performance?.performance_dates.map((d) => ({
        key: randomId(),
        date: toLocalDatetimeInput(d.date),
      })) ?? [{ key: randomId(), date: '' }],
  );
  const [ticketUrl, setTicketUrl] = useState(performance?.ticket_url ?? '');
  const [externalUrl, setExternalUrl] = useState(performance?.external_url ?? '');
  const [notes, setNotes] = useState(performance?.notes ?? '');
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addDate() {
    setDates((prev) => [...prev, { key: randomId(), date: '' }]);
  }

  function removeDate(index: number) {
    setDates((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDate(index: number, value: string) {
    setDates((prev) => prev.map((d, i) => (i === index ? { ...d, date: value } : d)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const image_url = imageFile
      ? ((await uploadPerformanceImage(imageFile)) ?? performance?.image_url ?? null)
      : (performance?.image_url ?? null);

    const seasonValue = selectedSeasonId || null;
    const isoDateStrings = dates.filter((d) => d.date).map((d) => new Date(d.date).toISOString());

    const payload = {
      title,
      image_url,
      venue: venue || null,
      ticket_url: ticketUrl || null,
      external_url: externalUrl || null,
      season_id: seasonValue,
      notes: notes || null,
    };

    const data = await upsertPerformance(payload, performance?.id);
    if (data) {
      const newDates = await replacePerformanceDates(data.id, isoDateStrings);
      onSave({ ...data, performance_dates: newDates });
      toast.success(performance ? 'Représentation modifiée' : 'Représentation ajoutée');
    } else {
      toast.error(performance ? 'Erreur lors de la modification' : "Erreur lors de l'ajout");
    }

    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h3 className="text-base font-medium mb-5 text-foreground">
        {performance ? 'Modifier la représentation' : 'Ajouter une représentation'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="performance-title" className="text-sm font-medium text-foreground">
              Titre
            </label>
            <input
              id="performance-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="CDR Show 2026"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="performance-season" className="text-sm font-medium text-foreground">
              Saison
            </label>
            <Select
              id="performance-season"
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="px-4"
            >
              <option value="">Sans saison</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="performance-venue" className="text-sm font-medium text-foreground">
              Lieu <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              id="performance-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Salle Chabrol, Angers"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="performance-ticket-url" className="text-sm font-medium text-foreground">
              Lien billetterie <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              id="performance-ticket-url"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              type="url"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="https://helloasso.com/..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="performance-external-url" className="text-sm font-medium text-foreground">
            Lien externe <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            id="performance-external-url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            type="url"
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            Notes choristes <span className="text-foreground/40 font-normal">(optionnel)</span>
          </span>
          <RichEditor
            content={notes}
            onChangeAction={setNotes}
            placeholder="Infos, liens Drive, planning répétitions..."
          />
          <p className="text-xs text-foreground/40">
            Affiché dans le répertoire quand cette représentation est sélectionnée.
          </p>
        </div>

        <PerformancePosterField
          preview={imagePreview}
          onFileChangeAction={handleFileChange}
          onRemoveAction={() => {
            setImageFile(null);
            setImagePreview('');
          }}
        />

        <PerformanceDatesField
          dates={dates}
          onUpdateAction={updateDate}
          onRemoveAction={removeDate}
          onAddAction={addDate}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : performance ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>

      {performance && (
        <div className="mt-6 pt-6 border-t border-border">
          <RepresentationFileManager performanceId={performance.id} />
        </div>
      )}
    </div>
  );
}
