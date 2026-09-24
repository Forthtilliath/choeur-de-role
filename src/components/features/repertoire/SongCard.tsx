'use client';

import { useEffect, useRef, useState } from 'react';

import { formatDateShort } from '@/utils/dateHelpers';

import { buildFileLabel } from './helpers';
import { RepertoireFileLink } from './RepertoireFileLink';
import type { PerformanceFilter, Song, SongFile, VoicePart } from './types';

export function SongCard({
  song,
  voiceParts,
  selectedVoicePartId,
  tuttiPartId,
  performances,
  initialOpen,
}: {
  song: Song;
  voiceParts: VoicePart[];
  selectedVoicePartId: string | null;
  myVoicePartId: string | null;
  tuttiPartId: string | null;
  performances: PerformanceFilter[];
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen ?? false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialOpen) return;
    // Delay lets Next.js finish its own scroll-to-top before we override it
    const timer = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    return () => clearTimeout(timer);
  }, [initialOpen]);

  const getFilesForVoicePart = (files: SongFile[]) => {
    if (selectedVoicePartId === null) return files;
    return files.filter((f) => {
      const parts = f.song_file_voice_part.map((p) => p.voice_part_id);
      return (
        parts.length === 0 ||
        (tuttiPartId && parts.includes(tuttiPartId)) ||
        parts.includes(selectedVoicePartId)
      );
    });
  };

  const audioFiles = getFilesForVoicePart(song.song_files.filter((f) => f.type === 'audio'));
  const scoreFiles = getFilesForVoicePart(song.song_files.filter((f) => f.type === 'score'));
  const lyricsFiles = getFilesForVoicePart(song.song_files.filter((f) => f.type === 'lyrics'));
  const totalFiles = audioFiles.length + scoreFiles.length + lyricsFiles.length;

  const songPerformances = performances.filter((p) => p.songIds.includes(song.id));

  return (
    <div ref={cardRef} className="border border-border rounded-2xl overflow-hidden bg-background">
      {/* Header accordion */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 bg-background-secondary flex items-center justify-between hover:bg-background-tertiary transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-sm font-medium text-foreground">{song.title}</h2>
            {song.composer && <p className="text-xs text-foreground/50">{song.composer}</p>}
            {song.label && <p className="text-xs text-foreground/40 italic">{song.label}</p>}
          </div>
          {songPerformances.length > 0 && (
            <p className="text-xs text-foreground/50 mt-0.5">
              {songPerformances
                .map((p) => p.title)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-foreground/40">
            {totalFiles} fichier{totalFiles > 1 ? 's' : ''}
          </span>
          <span className="text-foreground/40 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Contenu accordion */}
      {open && (
        <div className="border-t border-border">
          {totalFiles === 0 ? (
            <div className="px-6 py-4">
              <p className="text-sm text-foreground/40">
                Aucun fichier disponible pour ce pupitre.
              </p>
            </div>
          ) : (
            <div className="px-6 py-4 flex flex-col gap-4">
              {audioFiles.length > 0 && (
                <FileSection files={audioFiles} voiceParts={voiceParts} songTitle={song.title} />
              )}
              {lyricsFiles.length > 0 && (
                <FileSection files={lyricsFiles} voiceParts={voiceParts} songTitle={song.title} />
              )}
              {scoreFiles.length > 0 && (
                <FileSection files={scoreFiles} voiceParts={voiceParts} songTitle={song.title} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FileSection({
  files,
  voiceParts,
  songTitle,
}: {
  files: SongFile[];
  voiceParts: VoicePart[];
  songTitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <FileRow key={file.id} file={file} voiceParts={voiceParts} songTitle={songTitle} />
      ))}
    </div>
  );
}

function FileRow({
  file,
  voiceParts,
  songTitle,
}: {
  file: SongFile;
  voiceParts: VoicePart[];
  songTitle: string;
}) {
  const label = buildFileLabel(file, voiceParts);
  const ext = file.file_url.split('.').pop() ?? 'mp3';
  const downloadName = `${songTitle} - ${label}.${ext}`;
  const date = file.created_at ? formatDateShort(file.created_at) : null;

  return (
    <div className="flex flex-col gap-0.5">
      <RepertoireFileLink
        fileUrl={file.file_url}
        label={label}
        downloadName={downloadName}
        type={file.type ?? 'audio'}
        date={date}
        id={file.id}
      />
    </div>
  );
}
