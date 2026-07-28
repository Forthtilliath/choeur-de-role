'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { ChevronDown, ChevronUp, ExternalLink, FileText, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ButtonIcon } from '@/components/ui/ButtonIcon';
import { toLocalDatetimeInput } from '@/lib/utils';
import {
  insertSeason,
  updateSeasonLabel,
  toggleSeasonActive,
  deleteSeason,
  deletePerformance,
  upsertPerformance,
  replacePerformanceDates,
  uploadPerformanceImage,
} from '../clientQueries';
import { formatDateTimeShort } from '@/utils/dateHelpers';
import { PerformanceWithDates, SeasonWithPerformancesWithDates } from '../types';
import { RepresentationFileManager } from './RepresentationFileManager';

type Props = {
  initialSeasons: SeasonWithPerformancesWithDates[];
  initialOrphaned: PerformanceWithDates[];
  editPerformanceId?: PerformanceWithDates['id'] | null;
};

function findInitialEdit(
  seasons: SeasonWithPerformancesWithDates[],
  orphaned: PerformanceWithDates[],
  editId: PerformanceWithDates['id'] | null,
) {
  if (!editId) return null;
  for (const season of seasons) {
    const perf = season.performances.find((p) => p.id === editId);
    if (perf) return { seasonId: season.id, perf };
  }
  const perf = orphaned.find((p) => p.id === editId);
  if (perf) return { seasonId: 'orphaned', perf };
  return null;
}

export function ConcertsAdminClient({
  initialSeasons,
  initialOrphaned,
  editPerformanceId,
}: Props) {
  const [seasons, setSeasons] = useState<SeasonWithPerformancesWithDates[]>(initialSeasons);
  const [orphaned, setOrphaned] = useState<PerformanceWithDates[]>(initialOrphaned);

  const initialEdit = findInitialEdit(initialSeasons, initialOrphaned, editPerformanceId ?? null);

  const [openSeasonId, setOpenSeasonId] = useState<string | null>(
    initialEdit?.seasonId ??
      initialSeasons.find((s) => s.active)?.id ??
      initialSeasons[0]?.id ??
      null,
  );

  const [showPerformanceForm, setShowPerformanceForm] = useState(!!initialEdit);
  const [editingPerformance, setEditingPerformance] = useState<PerformanceWithDates | null>(
    initialEdit?.perf ?? null,
  );
  const [targetSeasonId, setTargetSeasonId] = useState<string | null>(
    initialEdit?.seasonId ?? null,
  );

  const [activeError, setActiveError] = useState('');
  const confirm = useConfirm();

  // Saison form
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [newSeasonLabel, setNewSeasonLabel] = useState('');
  const [savingSeason, setSavingSeason] = useState(false);

  // Renommage saison
  const [renamingSeasonId, setRenamingSeasonId] = useState<string | null>(null);
  const [renameLabel, setRenameLabel] = useState('');

  async function handleAddSeason() {
    if (!newSeasonLabel.trim()) return;
    setSavingSeason(true);
    const data = await insertSeason(newSeasonLabel.trim());
    if (data) {
      setSeasons((prev) => [{ ...data, performances: [] }, ...prev]);
      setNewSeasonLabel('');
      setShowSeasonForm(false);
    }
    setSavingSeason(false);
  }

  async function handleRenameSeason(id: string) {
    if (!renameLabel.trim()) return;
    const data = await updateSeasonLabel(id, renameLabel.trim());
    if (data) {
      setSeasons((prev) =>
        prev.map((s) => (s.id === id ? { ...s, label: renameLabel.trim() } : s)),
      );
      toast.success('Saison renommée');
    } else {
      toast.error('Erreur lors du renommage');
    }
    setRenamingSeasonId(null);
    setRenameLabel('');
  }

  async function handleToggleActive(season: SeasonWithPerformancesWithDates) {
    setActiveError('');
    const newActive = !season.active;
    if (newActive) {
      const activeCount = seasons.filter((s) => s.active).length;
      if (activeCount >= 2) {
        setActiveError('Maximum 2 saisons actives simultanément.');
        return;
      }
    }
    const ok = await toggleSeasonActive(season.id, newActive);
    if (ok) {
      setSeasons((prev) => prev.map((s) => (s.id === season.id ? { ...s, active: newActive } : s)));
      toast.success(newActive ? 'Saison activée' : 'Saison désactivée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDeleteSeason(season: SeasonWithPerformancesWithDates) {
    const message =
      season.performances.length > 0
        ? `Les ${season.performances.length} représentation(s) seront déplacées dans "Sans saison" et pourront être réaffectées.`
        : `Cette action est irréversible.`;
    if (
      !await confirm({
        title: `Supprimer la saison "${season.label}" ?`,
        message,
        confirmLabel: 'Supprimer',
        danger: true,
      })
    )
      return;

    const ok = await deleteSeason(season.id);
    if (ok) {
      // Les performances sont automatiquement passées à season_id = null (ON DELETE SET NULL)
      setOrphaned((prev) => [
        ...prev,
        ...season.performances.map((p) => ({ ...p, season_id: null })),
      ]);
      setSeasons((prev) => prev.filter((s) => s.id !== season.id));
      if (openSeasonId === season.id) setOpenSeasonId('orphaned');
      toast.success('Saison supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleAddPerformance(seasonId: string) {
    setTargetSeasonId(seasonId);
    setEditingPerformance(null);
    setShowPerformanceForm(true);
  }

  function handleEditPerformance(performance: PerformanceWithDates, seasonId: string) {
    setTargetSeasonId(seasonId);
    setEditingPerformance(performance);
    setShowPerformanceForm(true);
    setOpenSeasonId(seasonId);
  }

  function handleSavePerformance(performance: PerformanceWithDates) {
    const newSeasonId = performance.season_id;

    setSeasons((prev) =>
      prev.map((season) => {
        const withoutPerf = {
          ...season,
          performances: season.performances.filter((p) => p.id !== performance.id),
        };
        if (season.id === newSeasonId) {
          return { ...withoutPerf, performances: [...withoutPerf.performances, performance] };
        }
        return withoutPerf;
      }),
    );

    // Retirer des orphelins si réaffectée à une saison
    if (newSeasonId) {
      setOrphaned((prev) => prev.filter((p) => p.id !== performance.id));
    } else {
      // Ajouter aux orphelins si saison_id = null
      setOrphaned((prev) => {
        const exists = prev.find((p) => p.id === performance.id);
        if (exists) return prev.map((p) => (p.id === performance.id ? performance : p));
        return [...prev, performance];
      });
    }

    setShowPerformanceForm(false);
    setEditingPerformance(null);
  }

  async function handleDeletePerformance(id: string, fromSeasonId: string | null) {
    if (!await confirm({ message: 'Supprimer cette représentation et toutes ses dates ?', danger: true })) return;
    const ok = await deletePerformance(id);
    if (ok) {
      if (fromSeasonId === 'orphaned' || fromSeasonId === null) {
        setOrphaned((prev) => prev.filter((p) => p.id !== id));
      } else {
        setSeasons((prev) =>
          prev.map((season) =>
            season.id === fromSeasonId
              ? { ...season, performances: season.performances.filter((p) => p.id !== id) }
              : season,
          ),
        );
      }
      toast.success('Représentation supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  const allSeasonItems: (SeasonWithPerformancesWithDates & {
    isVirtual?: boolean;
  })[] = [
    ...seasons,
    ...(orphaned.length > 0
      ? [
          {
            id: 'orphaned',
            label: 'Sans saison',
            active: false,
            performances: orphaned,
            isVirtual: true,
            created_at: null,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {activeError && (
        <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
          {activeError}
        </p>
      )}

      {allSeasonItems.length === 0 && (
        <div className="text-center py-12 text-foreground/50">
          <p className="mb-4">Aucune saison. Créez-en une d&apos;abord.</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {showSeasonForm ? (
          <div className="flex items-center gap-2">
            <input
              value={newSeasonLabel}
              onChange={(e) => setNewSeasonLabel(e.target.value)}
              placeholder="2026-2027"
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSeason();
                if (e.key === 'Escape') setShowSeasonForm(false);
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAddSeason}
              disabled={savingSeason || !newSeasonLabel.trim()}
            >
              {savingSeason ? '...' : 'Ajouter'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSeasonForm(false)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowSeasonForm(true)}>
            + Nouvelle saison
          </Button>
        )}
      </div>

      {allSeasonItems.map((season) => (
        <div key={season.id} className="border border-border rounded-2xl overflow-hidden">
          {/* Header saison */}
          <div
            className={`flex items-center gap-2 px-3 md:px-4 py-3 bg-background-secondary ${season.isVirtual ? 'bg-orange-50 border-b border-orange-200' : ''}`}
          >
            {/* Gauche : nom + rep count (ou formulaire de renommage) */}
            {renamingSeasonId === season.id ? (
              <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  value={renameLabel}
                  onChange={(e) => setRenameLabel(e.target.value)}
                  className="border border-border rounded-lg px-3 py-1 text-sm bg-background flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSeason(season.id);
                    if (e.key === 'Escape') {
                      setRenamingSeasonId(null);
                      setRenameLabel('');
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleRenameSeason(season.id)}>
                  OK
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRenamingSeasonId(null);
                    setRenameLabel('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setOpenSeasonId(openSeasonId === season.id ? null : season.id)}
                className="flex-1 text-left min-w-0 hover:opacity-70 transition-opacity"
              >
                {/* Ligne 1 : nom + badge active */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-medium ${season.isVirtual ? 'text-orange-700' : 'text-foreground'}`}
                  >
                    {season.label}
                  </span>
                  {season.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Active
                    </span>
                  )}
                  {season.isVirtual && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      À réaffecter
                    </span>
                  )}
                </div>
                {/* Ligne 2 : nb représentations */}
                <p className="text-xs text-foreground/40 mt-0.5">
                  {season.performances.length} représentation
                  {season.performances.length > 1 ? 's' : ''}
                </p>
              </button>
            )}

            {/* Droite col 1 : actions (icônes Lucide) */}
            {!season.isVirtual && renamingSeasonId !== season.id && (
              <div
                className="flex items-center gap-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ButtonIcon
                  onClick={() => handleToggleActive(season)}
                  className={`p-1.5 rounded-lg transition-all ${
                    season.active
                      ? 'text-primary/80 hover:text-primary'
                      : 'text-foreground/30 hover:text-foreground/60'
                  }`}
                  title={season.active ? 'Désactiver' : 'Activer'}
                  variant="outline"
                >
                  {season.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </ButtonIcon>
                <ButtonIcon
                  onClick={() => {
                    setRenamingSeasonId(season.id);
                    setRenameLabel(season.label);
                  }}
                  title="Renommer"
                  variant="outline"
                >
                  <Pencil size={15} />
                </ButtonIcon>
                <ButtonIcon
                  onClick={() => handleDeleteSeason(season)}
                  title="Supprimer"
                  variant="danger"
                >
                  <Trash2 size={15} />
                </ButtonIcon>
              </div>
            )}

            {/* Droite col 2 : chevron ouvrir/fermer */}
            {renamingSeasonId !== season.id && (
              <button
                onClick={() => setOpenSeasonId(openSeasonId === season.id ? null : season.id)}
                className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-background transition-all shrink-0"
              >
                {openSeasonId === season.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            )}
          </div>

          {/* Contenu saison */}
          {openSeasonId === season.id && (
            <div className="p-6 flex flex-col gap-4">
              {season.isVirtual && (
                <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                  Ces représentations n&apos;ont plus de saison. Modifiez-les pour les réaffecter.
                </p>
              )}

              {showPerformanceForm && targetSeasonId === season.id && (
                <PerformanceForm
                  performance={editingPerformance}
                  seasonId={season.isVirtual ? null : season.id}
                  seasons={seasons}
                  onClose={() => {
                    setShowPerformanceForm(false);
                    setEditingPerformance(null);
                  }}
                  onSave={handleSavePerformance}
                />
              )}

              {season.performances.length === 0 && !showPerformanceForm && (
                <p className="text-sm text-foreground/50 text-center py-4">
                  Aucune représentation pour cette saison.
                </p>
              )}

              {[...season.performances]
                .sort((a, b) => {
                  const aDate = a.performance_dates[0]?.date ?? '';
                  const bDate = b.performance_dates[0]?.date ?? '';
                  return aDate > bDate ? -1 : 1;
                })
                .map((performance) => (
                  <PerformanceRow
                    key={performance.id}
                    performance={performance}
                    isLocked={!season.active && !season.isVirtual}
                    onEdit={() => handleEditPerformance(performance, season.id)}
                    onDelete={() =>
                      handleDeletePerformance(performance.id, season.isVirtual ? null : season.id)
                    }
                  />
                ))}

              {!(showPerformanceForm && targetSeasonId === season.id) &&
                !(!season.active && !season.isVirtual) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPerformance(season.id)}
                    className="self-start"
                  >
                    + Ajouter une représentation
                  </Button>
                )}

              {!season.active && !season.isVirtual && (
                <p className="text-xs text-foreground/40 italic">
                  Saison verrouillée — activez-la pour modifier les représentations.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PerformanceRow({
  performance,
  isLocked,
  onEdit,
  onDelete,
}: {
  performance: PerformanceWithDates;
  isLocked?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const dates = [...performance.performance_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Image portrait */}
        {performance.image_url ? (
          <Link
            href={`/api/r2/image-view?url=${encodeURIComponent(performance.image_url)}`}
            target="_blank"
            className="relative block w-10 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0"
            title="Voir l'affiche"
          >
            <Image
              src={performance.image_url}
              alt={performance.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </Link>
        ) : (
          <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-background-secondary shrink-0">
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-primary text-lg">🎵</span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{performance.title}</p>
          {performance.venue && (
            <p className="text-xs text-foreground/50 truncate">📍 {performance.venue}</p>
          )}
          <div className="flex flex-col gap-0.5 mt-1">
            {dates.slice(0, 2).map((d) => (
              <p key={d.id} className="text-xs text-foreground/40">
                📅 {formatDateTimeShort(d.date)}
              </p>
            ))}
            {dates.length > 2 && (
              <p className="text-xs text-foreground/40">+{dates.length - 2} autres dates</p>
            )}
          </div>
        </div>
      </div>

      {!isLocked && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            href={`/choristes/admin/concerts/${performance.slug}/programme`}
            className="gap-1.5"
            title="Voir le programme imprimable"
          >
            <FileText size={13} />
            <span className="hidden sm:inline">Programme</span>
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Pencil size={13} />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
            <Trash2 size={13} />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function PerformanceForm({
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
  const [dates, setDates] = useState<{ date: string }[]>(
    performance?.performance_dates.map((d) => ({
      date: toLocalDatetimeInput(d.date),
    })) ?? [{ date: '' }],
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
    setDates((prev) => [...prev, { date: '' }]);
  }

  function removeDate(index: number) {
    setDates((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDate(index: number, value: string) {
    setDates((prev) => prev.map((d, i) => (i === index ? { date: value } : d)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const image_url = imageFile
      ? ((await uploadPerformanceImage(imageFile)) ?? performance?.image_url ?? null)
      : (performance?.image_url ?? null);

    const seasonValue = selectedSeasonId || null;
    const isoDateStrings = dates
      .filter((d) => d.date)
      .map((d) => new Date(d.date).toISOString());

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
            <label className="text-sm font-medium text-foreground">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="CDR Show 2026"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Saison</label>
            <Select
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
            <label className="text-sm font-medium text-foreground">
              Lieu <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Salle Chabrol, Angers"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Lien billetterie <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              type="url"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="https://helloasso.com/..."
            />
          </div>
        </div>

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

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Notes choristes <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <RichEditor
            content={notes}
            onChangeAction={setNotes}
            placeholder="Infos, liens Drive, planning répétitions..."
          />
          <p className="text-xs text-foreground/40">
            Affiché dans le répertoire quand cette représentation est sélectionnée.
          </p>
        </div>

        {/* Image portrait — bouton stylé */}
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
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
              {!imagePreview.startsWith('blob:') && (
                <Link
                  href={`/api/r2/image-view?url=${encodeURIComponent(imagePreview)}`}
                  target="_blank"
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  title="Ouvrir en plein écran"
                >
                  <ExternalLink size={10} />
                </Link>
              )}
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
              <span className="text-foreground/20 text-2xl">🎵</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">Dates</label>
          {dates.map((date, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="datetime-local"
                value={date.date}
                onChange={(e) => updateDate(index, e.target.value)}
                required
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background flex-1"
              />
              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="text-red-400 hover:text-red-600 text-sm transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDate}
            className="text-sm text-primary hover:opacity-70 self-start transition-opacity"
          >
            + Ajouter une date
          </button>
        </div>

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
