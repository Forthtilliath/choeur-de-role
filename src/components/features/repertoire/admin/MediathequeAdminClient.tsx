'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { ChevronDown, ChevronUp, FilePlus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { RepresentationFileManager } from '@/components/features/concerts/admin/RepresentationFileManager';
import { updatePerformanceNotes } from '@/components/features/concerts/clientQueries';
import { deleteSong } from '../clientQueries';
import { FileType, Performance, Song, SongFile, VoicePart } from '../types';
import { FileManager } from './FileManager';
import { SongForm } from './SongForm';

type Props = {
  initialSongs: Song[];
  voiceParts: VoicePart[];
  performances: Performance[];
};

export function MediathequeAdminClient({ initialSongs, voiceParts, performances: initialPerformances }: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [performances, setPerformances] = useState<Performance[]>(initialPerformances);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [openSongId, setOpenSongId] = useState<string | null>(null);
  const [activeFileType, setActiveFileType] = useState<FileType | null>(null);
  const [search, setSearch] = useState('');
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null);
  const [addingFileForSong, setAddingFileForSong] = useState<string | null>(null);
  const confirm = useConfirm();

  const now = new Date();
  const upcomingPerfs = performances
    .filter((p) => p.performance_dates?.some((d) => new Date(d.date) >= now))
    .sort((a, b) => {
      const aDate = a.performance_dates?.find((d) => new Date(d.date) >= now)?.date ?? '';
      const bDate = b.performance_dates?.find((d) => new Date(d.date) >= now)?.date ?? '';
      return aDate.localeCompare(bDate);
    });

  const selectedPerformance = performances.find((p) => p.id === selectedPerformanceId) ?? null;

  const filteredSongs = songs.filter((song) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      song.title.toLowerCase().includes(q) ||
      (song.composer ?? '').toLowerCase().includes(q) ||
      (song.label ?? '').toLowerCase().includes(q);
    const matchPerf =
      !selectedPerformanceId ||
      song.song_performance.some((sp) => sp.performance_id === selectedPerformanceId);
    return matchSearch && matchPerf;
  });

  async function handleDelete(id: string) {
    const item = songs.find((s) => s.id === id);
    if (!await confirm({
      message: 'Supprimer ce chant et tous ses fichiers ?',
      danger: true,
      details: item ? { icon: '🎵', label: item.title } : undefined,
    })) return;
    const ok = await deleteSong(id);
    if (ok) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
      toast.success('Chant supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSave(song: Song) {
    setSongs((prev) => {
      const exists = prev.find((s) => s.id === song.id);
      return exists ? prev.map((s) => (s.id === song.id ? song : s)) : [...prev, song];
    });
    setShowForm(false);
    setEditingSong(null);
  }

  function handleUpdateFiles(songId: string, files: SongFile[]) {
    setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, song_files: files } : s)));
  }

  function handleNotesUpdated(id: string, notes: string) {
    setPerformances((prev) => prev.map((p) => (p.id === id ? { ...p, notes } : p)));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtre par représentation */}
      {performances.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground/50">Représentation :</span>
            <button
              onClick={() => setSelectedPerformanceId(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                !selectedPerformanceId
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              Toutes
            </button>
            {upcomingPerfs.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPerformanceId(selectedPerformanceId === p.id ? null : p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedPerformanceId === p.id
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPerformance && (
        <PerformancePanel
          key={selectedPerformance.id}
          performance={selectedPerformance}
          onNotesUpdatedAction={(notes) => handleNotesUpdated(selectedPerformance.id, notes)}
        />
      )}

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un chant, compositeur..."
          className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-background"
        />
        <Button
          onClick={() => {
            setEditingSong(null);
            setShowForm(true);
          }}
          size="md"
        >
          + Ajouter un chant
        </Button>
      </div>

      {showForm && (
        <SongForm
          key={editingSong?.id ?? 'new'}
          song={editingSong}
          performances={performances}
          onCloseAction={() => {
            setShowForm(false);
            setEditingSong(null);
          }}
          onSaveAction={handleSave}
        />
      )}

      {filteredSongs.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">
          {search ? 'Aucun chant trouvé.' : 'Aucun chant pour le moment.'}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {filteredSongs.map((song) => {
          const linkedPerfs = performances.filter((p) =>
            song.song_performance.some((sp) => sp.performance_id === p.id),
          );
          return (
            <div key={song.id} data-song-card className="border border-border rounded-2xl overflow-hidden">
              <div className="flex items-start gap-3 px-4 py-4 bg-background-secondary">
                {/* Info cliquable pour ouvrir/fermer */}
                <button
                  onClick={() => setOpenSongId(openSongId === song.id ? null : song.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{song.title}</p>
                    {song.composer && (
                      <p className="text-xs text-foreground/50">{song.composer}</p>
                    )}
                    {song.label && (
                      <p className="text-xs text-foreground/40 italic">{song.label}</p>
                    )}
                  </div>
                  {linkedPerfs.length > 0 && (
                    <p className="text-xs text-foreground/30 mt-0.5">
                      {linkedPerfs.map((p) => p.title).join(', ')}
                    </p>
                  )}
                </button>

                {/* Droite : fichiers + chevron + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-foreground/40">
                      {song.song_files.length} fichier{song.song_files.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setOpenSongId(openSongId === song.id ? null : song.id)}
                      className="p-1 rounded text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {openSongId === song.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddingFileForSong(song.id);
                        setOpenSongId(song.id);
                      }}
                      className="gap-1.5"
                      title="Ajouter un fichier"
                    >
                      <FilePlus size={13} />
                      <span className="hidden sm:inline">Fichier</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditingSong(song); setShowForm(true); }}
                      className="gap-1.5"
                    >
                      <Pencil size={13} />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(song.id)} className="gap-1.5">
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </div>

              {openSongId === song.id && (
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    {([null, 'audio', 'lyrics', 'score'] as (FileType | null)[]).map((type) => (
                      <button
                        key={type ?? 'all'}
                        onClick={() => setActiveFileType(type)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-all ${activeFileType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
                      >
                        {type === null
                          ? 'Tous'
                          : type === 'audio'
                            ? '🎵 Audio'
                            : type === 'score'
                              ? '📄 Partitions'
                              : '📝 Paroles'}
                      </button>
                    ))}
                  </div>
                  <FileManager
                    song={song}
                    voiceParts={voiceParts}
                    activeFileType={activeFileType}
                    onUpdateFilesAction={(files) => handleUpdateFiles(song.id, files)}
                    triggerAddFile={addingFileForSong === song.id}
                    onAddFileTriggeredAction={() => setAddingFileForSong(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerformancePanel({
  performance,
  onNotesUpdatedAction,
}: {
  performance: Performance;
  onNotesUpdatedAction: (notes: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [notes, setNotes] = useState(performance.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSaveNotes() {
    setSaving(true);
    const ok = await updatePerformanceNotes(performance.id, notes || null);
    setSaving(false);
    if (ok) {
      onNotesUpdatedAction(notes);
      toast.success('Notes mises à jour');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      {/* Notes */}
      <button
        onClick={() => setNotesOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          📝 Notes pour les choristes
          {performance.notes && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Notes existantes" />
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-foreground/40 transition-transform ${notesOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {notesOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-border flex flex-col gap-3">
          <RichEditor
            content={notes}
            onChangeAction={setNotes}
            placeholder="Notes visibles par les choristes sur la page répertoire…"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveNotes} disabled={saving} loading={saving}>
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="border-t border-border">
        <button
          onClick={() => setDocsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
        >
          <span className="font-medium text-foreground">📂 Documents partagés</span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-foreground/40 transition-transform ${docsOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {docsOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-border">
            <RepresentationFileManager performanceId={performance.id} />
          </div>
        )}
      </div>
    </div>
  );
}
