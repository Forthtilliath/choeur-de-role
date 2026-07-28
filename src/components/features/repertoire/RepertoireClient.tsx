'use client';

import { useEffect, useRef, useState } from 'react';
import { RepertoireFileLink } from './RepertoireFileLink';
import { buildFileLabel } from './helpers';
import { formatDateShort } from '@/utils/dateHelpers';
import { PerformanceFilter, SongFile, Song, VoicePart } from './types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Props = {
  songs: Song[];
  voiceParts: VoicePart[];
  myVoicePartId: string | null;
  performances: PerformanceFilter[];
  initialOpenSongId?: string;
};

export function RepertoireClient({
  songs,
  voiceParts,
  myVoicePartId,
  performances,
  initialOpenSongId,
}: Props) {
  const [selectedVoicePartId, setSelectedVoicePartId] = useState<string | null>(myVoicePartId);
  const [selectedPerformanceId, setSelectedPerformanceId] = useLocalStorage<string | null>('repertoire:performanceId', null);
  const [search, setSearch] = useState('');
  const [downloadModal, setDownloadModal] = useState(false);
  const [showPastPerfs, setShowPastPerfs] = useState(false);
  const [mobileFilterPanel, setMobileFilterPanel] = useState<'pupitre' | 'representation' | null>(null);

  const now = new Date();
  const tuttiPart = voiceParts.find((vp) => vp.name === 'tutti');
  const regularParts = voiceParts;

  const upcomingPerfs = performances
    .filter((p) => !p.minDate || new Date(p.minDate) >= now)
    .sort((a, b) => {
      if (!a.minDate) return 1;
      if (!b.minDate) return -1;
      return new Date(a.minDate).getTime() - new Date(b.minDate).getTime();
    });

  const pastPerfs = performances
    .filter((p) => p.minDate && new Date(p.minDate) < now)
    .sort((a, b) => new Date(b.minDate!).getTime() - new Date(a.minDate!).getTime());

  // Past perf selected → always show its button inline; exclude it from the "+(N) passées" count
  const selectedPastPerf = pastPerfs.find((p) => p.id === selectedPerformanceId) ?? null;
  const otherPastPerfs = selectedPastPerf
    ? pastPerfs.filter((p) => p.id !== selectedPerformanceId)
    : pastPerfs;

  // Deep-link: if the target song is not in the stored performance, treat as Toutes
  const effectivePerformanceId = (() => {
    if (!initialOpenSongId || !selectedPerformanceId) return selectedPerformanceId;
    const perf = performances.find((p) => p.id === selectedPerformanceId);
    if (!perf || perf.songIds.includes(initialOpenSongId)) return selectedPerformanceId;
    return null;
  })();
  const selectedPerformance = performances.find((p) => p.id === effectivePerformanceId);

  const filteredSongs = songs.filter((song) => {
    // Always show the target song when deep-linking from palette
    if (initialOpenSongId && song.id === initialOpenSongId) return true;

    const matchSearch =
      search === '' ||
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      (song.composer ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (song.label ?? '').toLowerCase().includes(search.toLowerCase());

    const matchPerformance =
      !effectivePerformanceId || !selectedPerformance || selectedPerformance.songIds.includes(song.id);

    return matchSearch && matchPerformance;
  });

  const selectedVoicePartName = voiceParts.find((vp) => vp.id === selectedVoicePartId)?.name ?? 'Tous';
  const selectedPerfName = performances.find((p) => p.id === effectivePerformanceId)?.title ?? 'Toutes';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {/* Pupitre */}
        <div className="flex flex-col gap-1">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileFilterPanel((p) => (p === 'pupitre' ? null : 'pupitre'))}
            className="sm:hidden flex items-center justify-between w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground/60 bg-background"
          >
            <span>Pupitre — {selectedVoicePartName}</span>
            <span>{mobileFilterPanel === 'pupitre' ? '▲' : '▼'}</span>
          </button>
          <div className={`flex gap-2 flex-wrap items-center ${mobileFilterPanel === 'pupitre' ? '' : 'hidden sm:flex'}`}>
            <span className="text-xs text-foreground/50 hidden sm:inline">Pupitre :</span>
            <button
              onClick={() => setSelectedVoicePartId(null)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedVoicePartId === null ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
            >
              Tous
            </button>
            {regularParts.map((vp) => (
              <button
                key={vp.id}
                onClick={() => setSelectedVoicePartId(vp.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedVoicePartId === vp.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'} ${vp.id === myVoicePartId ? 'font-medium' : ''}`}
              >
                {vp.name}
                {vp.id === myVoicePartId && ' ★'}
              </button>
            ))}
          </div>
        </div>

        {/* Représentations */}
        {performances.length > 0 && (
          <div className="flex flex-col gap-2">
            {/* Mobile toggle */}
            <button
              onClick={() => setMobileFilterPanel((p) => (p === 'representation' ? null : 'representation'))}
              className="sm:hidden flex items-center justify-between w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground/60 bg-background"
            >
              <span>Représentation — {selectedPerfName}</span>
              <span>{mobileFilterPanel === 'representation' ? '▲' : '▼'}</span>
            </button>
            <div className={`flex flex-col gap-2 ${mobileFilterPanel === 'representation' ? '' : 'hidden sm:flex'}`}>
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs text-foreground/50 hidden sm:inline">Représentation :</span>
                <button
                  onClick={() => setSelectedPerformanceId(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${effectivePerformanceId === null ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
                >
                  Toutes
                </button>
                {upcomingPerfs.map((p) => {
                  const isActive = effectivePerformanceId === p.id;
                  const isStoredNotInSong = !!initialOpenSongId && selectedPerformanceId === p.id && !isActive;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPerformanceId(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : isStoredNotInSong
                            ? 'border-dashed border-primary/60 text-primary/60'
                            : 'border-border text-foreground/60'
                      }`}
                    >
                      {p.title}
                    </button>
                  );
                })}
                {/* Selected past perf: normal active if song is in it, discrete dashed if not */}
                {selectedPastPerf && (
                  <button
                    onClick={() => setSelectedPerformanceId(selectedPastPerf.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      effectivePerformanceId === selectedPastPerf.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-dashed border-primary/40 text-primary/50 hover:border-primary/60 hover:text-primary/70'
                    }`}
                  >
                    {selectedPastPerf.title}
                  </button>
                )}
                {otherPastPerfs.length > 0 && (
                  <button
                    onClick={() => setShowPastPerfs((v) => !v)}
                    className="px-3 py-1.5 rounded-lg text-sm border border-border text-foreground/40 hover:text-foreground/60 transition-all"
                  >
                    {showPastPerfs
                      ? 'Masquer passées'
                      : `+ ${otherPastPerfs.length} passée${otherPastPerfs.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
              {showPastPerfs && (
                <div className="flex gap-2 flex-wrap">
                  {otherPastPerfs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPerformanceId(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all opacity-60 ${effectivePerformanceId === p.id ? 'border-primary bg-primary/10 text-primary opacity-100' : 'border-border text-foreground/60'}`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes de la représentation sélectionnée */}
        {effectivePerformanceId && selectedPerformance?.notes && (
          <div
            className="rounded-xl border border-border bg-background-secondary px-4 py-3 mdx-content text-sm"
            dangerouslySetInnerHTML={{ __html: selectedPerformance.notes }}
          />
        )}

        {/* Documents partagés de la représentation sélectionnée */}
        {effectivePerformanceId && (selectedPerformance?.files?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-foreground/50 px-1">📂 Documents du concert</p>
            {selectedPerformance!.files.map((f) => (
              <RepertoireFileLink
                key={f.id}
                fileUrl={f.file_url}
                label={f.label}
                downloadName={f.label}
                type="score"
                date={null}
              />
            ))}
          </div>
        )}

        {/* Recherche + téléchargement */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un chant, compositeur..."
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background flex-1"
          />
          <button
            onClick={() => setDownloadModal(true)}
            className="px-4 py-2 rounded-lg text-sm border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all shrink-0"
          >
            ↓ Tout télécharger
          </button>
        </div>
      </div>

      {filteredSongs.length === 0 && (
        <p className="text-center text-foreground/50 py-8">Aucun chant trouvé.</p>
      )}

      <div className="flex flex-col gap-3">
        {filteredSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            voiceParts={voiceParts}
            selectedVoicePartId={selectedVoicePartId}
            myVoicePartId={myVoicePartId}
            tuttiPartId={tuttiPart?.id ?? null}
            performances={performances}
            initialOpen={song.id === initialOpenSongId}
          />
        ))}
      </div>

      {downloadModal && (
        <DownloadModal
          songs={filteredSongs}
          voiceParts={voiceParts}
          myVoicePartId={myVoicePartId}
          initialVoicePartId={selectedVoicePartId}
          onClose={() => setDownloadModal(false)}
        />
      )}
    </div>
  );
}

function SongCard({
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {audioFiles.length > 0 && <FileSection files={audioFiles} voiceParts={voiceParts} songTitle={song.title} />}
              {lyricsFiles.length > 0 && <FileSection files={lyricsFiles} voiceParts={voiceParts} songTitle={song.title} />}
              {scoreFiles.length > 0 && <FileSection files={scoreFiles} voiceParts={voiceParts} songTitle={song.title} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FileSection({ files, voiceParts, songTitle }: { files: SongFile[]; voiceParts: VoicePart[]; songTitle: string }) {
  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <FileRow key={file.id} file={file} voiceParts={voiceParts} songTitle={songTitle} />
      ))}
    </div>
  );
}

function FileRow({ file, voiceParts, songTitle }: { file: SongFile; voiceParts: VoicePart[]; songTitle: string }) {
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

function DownloadModal({
  songs,
  voiceParts,
  myVoicePartId,
  initialVoicePartId,
  onClose,
}: {
  songs: Song[];
  voiceParts: VoicePart[];
  myVoicePartId: string | null;
  initialVoicePartId: string | null;
  onClose: () => void;
}) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['audio']);
  const [selectedVoicePartId, setSelectedVoicePartId] = useState<string | null>(initialVoicePartId);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const allParts = voiceParts.filter((vp) => vp.name !== 'instrumental');

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleDownload() {
    setDownloading(true);
    setProgress(0);
    setStatus('Préparation...');

    const filesToDownload: { url: string; filename: string }[] = [];

    for (const song of songs) {
      for (const file of song.song_files) {
        if (!selectedTypes.includes(file.type ?? '')) continue;

        const parts = file.song_file_voice_part.map((p) => p.voice_part_id);
        if (selectedVoicePartId) {
          const isAllParts = parts.length === 0;
          const isMyPart = parts.includes(selectedVoicePartId);
          if (!isAllParts && !isMyPart) continue;
        }

        const label = buildFileLabel(file, voiceParts);
        const ext = file.file_url.split('.').pop() ?? 'bin';
        filesToDownload.push({
          url: file.file_url,
          filename: `${song.title} - ${label}.${ext}`,
        });
      }
    }

    if (filesToDownload.length === 0) {
      setDownloading(false);
      setStatus('Aucun fichier à télécharger.');
      return;
    }

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      let done = 0;

      for (const { url, filename } of filesToDownload) {
        setStatus(`Récupération de ${filename}...`);
        try {
          const res = await fetch(`/api/repertoire/signed-url?path=${encodeURIComponent(url)}`);
          const data = await res.json();
          if (data.url) {
            const fileRes = await fetch(data.url);
            const blob = await fileRes.blob();
            zip.file(filename, blob);
          }
        } catch {
          // ignore
        }
        done++;
        setProgress(Math.round((done / filesToDownload.length) * 90));
      }

      setStatus('Création du ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setProgress(100);

      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = 'repertoire.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }

    setDownloading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl border border-border w-full max-w-md shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">Téléchargement groupé</h2>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground text-lg">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Que souhaitez-vous télécharger ?
            </label>
            <div className="flex gap-2">
              {[
                { value: 'audio', label: '🎵 Audio' },
                { value: 'lyrics', label: '📝 Paroles' },
                { value: 'score', label: '📄 Partitions' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all ${selectedTypes.includes(type.value) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Pour quel pupitre ?</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedVoicePartId(null)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedVoicePartId === null ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
              >
                Tous
              </button>
              {allParts.map((vp) => (
                <button
                  key={vp.id}
                  onClick={() => setSelectedVoicePartId(vp.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedVoicePartId === vp.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'} ${vp.id === myVoicePartId ? 'font-medium' : ''}`}
                >
                  {vp.name}
                  {vp.id === myVoicePartId && ' ★'}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground/40">
              Sélectionnez &quot;Tous&quot; pour les fichiers communs à tous les pupitres.
            </p>
          </div>

          {downloading && (
            <div className="flex flex-col gap-2">
              <div className="w-full bg-border rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-foreground/50 text-center">{status}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2 rounded-lg text-sm border border-border text-foreground/60 hover:bg-muted disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || selectedTypes.length === 0}
            className="px-4 py-2 rounded-lg text-sm bg-primary text-white hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {downloading ? 'En cours...' : 'Télécharger (.zip)'}
          </button>
        </div>
      </div>
    </div>
  );
}
