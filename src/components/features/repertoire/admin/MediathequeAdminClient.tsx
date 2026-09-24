'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useNow } from '@/hooks/useNow';

import { deleteSong } from '../clientQueries';
import type { FileType, Performance, Song, SongFile, VoicePart } from '../types';

import { MediathequeSongCard } from './MediathequeSongCard';
import { PerformancePanel } from './PerformancePanel';
import { SongForm } from './SongForm';

type Props = {
  initialSongs: Song[];
  voiceParts: VoicePart[];
  performances: Performance[];
};

export function MediathequeAdminClient({
  initialSongs,
  voiceParts,
  performances: initialPerformances,
}: Props) {
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

  const now = new Date(useNow());
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
    if (
      !(await confirm({
        message: 'Supprimer ce chant et tous ses fichiers ?',
        danger: true,
        details: item ? { icon: '🎵', label: item.title } : undefined,
      }))
    )
      return;
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
                onClick={() =>
                  setSelectedPerformanceId(selectedPerformanceId === p.id ? null : p.id)
                }
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
        {filteredSongs.map((song) => (
          <MediathequeSongCard
            key={song.id}
            song={song}
            voiceParts={voiceParts}
            performances={performances}
            isOpen={openSongId === song.id}
            onToggleOpenAction={() => setOpenSongId(openSongId === song.id ? null : song.id)}
            activeFileType={activeFileType}
            onFileTypeChangeAction={setActiveFileType}
            triggerAddFile={addingFileForSong === song.id}
            onAddFileAction={() => {
              setAddingFileForSong(song.id);
              setOpenSongId(song.id);
            }}
            onAddFileTriggeredAction={() => setAddingFileForSong(null)}
            onEditAction={() => {
              setEditingSong(song);
              setShowForm(true);
            }}
            onDeleteAction={() => handleDelete(song.id)}
            onUpdateFilesAction={(files) => handleUpdateFiles(song.id, files)}
          />
        ))}
      </div>
    </div>
  );
}
