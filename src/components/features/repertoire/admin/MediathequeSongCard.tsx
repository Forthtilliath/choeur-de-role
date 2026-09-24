'use client';

import { ChevronDown, ChevronUp, FilePlus, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import type { FileType, Performance, Song, SongFile, VoicePart } from '../types';

import { FileManager } from './FileManager';

const FILE_TYPE_TABS: { type: FileType | null; label: string }[] = [
  { type: null, label: 'Tous' },
  { type: 'audio', label: '🎵 Audio' },
  { type: 'lyrics', label: '📝 Paroles' },
  { type: 'score', label: '📄 Partitions' },
];

type Props = {
  song: Song;
  voiceParts: VoicePart[];
  performances: Performance[];
  isOpen: boolean;
  onToggleOpenAction: () => void;
  activeFileType: FileType | null;
  onFileTypeChangeAction: (type: FileType | null) => void;
  triggerAddFile: boolean;
  onAddFileAction: () => void;
  onAddFileTriggeredAction: () => void;
  onEditAction: () => void;
  onDeleteAction: () => void;
  onUpdateFilesAction: (files: SongFile[]) => void;
};

// Carte d'un chant : en-tête avec actions, gestionnaire de fichiers dépliable
export function MediathequeSongCard({
  song,
  voiceParts,
  performances,
  isOpen,
  onToggleOpenAction,
  activeFileType,
  onFileTypeChangeAction,
  triggerAddFile,
  onAddFileAction,
  onAddFileTriggeredAction,
  onEditAction,
  onDeleteAction,
  onUpdateFilesAction,
}: Props) {
  const linkedPerfs = performances.filter((p) =>
    song.song_performance.some((sp) => sp.performance_id === p.id),
  );

  return (
    <div data-song-card className="border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4 bg-background-secondary">
        {/* Info cliquable pour ouvrir/fermer */}
        <button onClick={onToggleOpenAction} className="flex-1 min-w-0 text-left">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{song.title}</p>
            {song.composer && <p className="text-xs text-foreground/50">{song.composer}</p>}
            {song.label && <p className="text-xs text-foreground/40 italic">{song.label}</p>}
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
              onClick={onToggleOpenAction}
              className="p-1 rounded text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onAddFileAction}
              className="gap-1.5"
              title="Ajouter un fichier"
            >
              <FilePlus size={13} />
              <span className="hidden sm:inline">Fichier</span>
            </Button>
            <Button size="sm" variant="outline" onClick={onEditAction} className="gap-1.5">
              <Pencil size={13} />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
            <Button size="sm" variant="danger" onClick={onDeleteAction} className="gap-1.5">
              <Trash2 size={13} />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            {FILE_TYPE_TABS.map(({ type, label }) => (
              <button
                key={type ?? 'all'}
                onClick={() => onFileTypeChangeAction(type)}
                className={`px-3 py-1 rounded-lg text-xs border transition-all ${activeFileType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <FileManager
            song={song}
            voiceParts={voiceParts}
            activeFileType={activeFileType}
            onUpdateFilesAction={onUpdateFilesAction}
            triggerAddFile={triggerAddFile}
            onAddFileTriggeredAction={onAddFileTriggeredAction}
          />
        </div>
      )}
    </div>
  );
}
