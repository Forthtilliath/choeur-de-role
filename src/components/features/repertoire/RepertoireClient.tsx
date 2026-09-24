'use client';
import { useState } from 'react';

import { SafeHtml } from '@/components/ui/SafeHtml';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNow } from '@/hooks/useNow';

import { DownloadModal } from './DownloadModal';
import { PerformanceFilterPanel } from './PerformanceFilterPanel';
import { RepertoireFileLink } from './RepertoireFileLink';
import { SongCard } from './SongCard';
import type { PerformanceFilter, Song, VoicePart } from './types';

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
  const [selectedPerformanceId, setSelectedPerformanceId] = useLocalStorage<string | null>(
    'repertoire:performanceId',
    null,
  );
  const [search, setSearch] = useState('');
  const [downloadModal, setDownloadModal] = useState(false);
  const [mobileFilterPanel, setMobileFilterPanel] = useState<'pupitre' | 'representation' | null>(
    null,
  );

  const now = new Date(useNow());
  const tuttiPart = voiceParts.find((vp) => vp.name === 'tutti');
  const regularParts = voiceParts;

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
      !effectivePerformanceId ||
      !selectedPerformance ||
      selectedPerformance.songIds.includes(song.id);

    return matchSearch && matchPerformance;
  });

  const selectedVoicePartName =
    voiceParts.find((vp) => vp.id === selectedVoicePartId)?.name ?? 'Tous';

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
          <div
            className={`flex gap-2 flex-wrap items-center ${mobileFilterPanel === 'pupitre' ? '' : 'hidden sm:flex'}`}
          >
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
          <PerformanceFilterPanel
            performances={performances}
            now={now}
            selectedPerformanceId={selectedPerformanceId}
            effectivePerformanceId={effectivePerformanceId}
            initialOpenSongId={initialOpenSongId}
            onSelectAction={setSelectedPerformanceId}
            mobileOpen={mobileFilterPanel === 'representation'}
            onToggleMobileAction={() =>
              setMobileFilterPanel((p) => (p === 'representation' ? null : 'representation'))
            }
          />
        )}

        {/* Notes de la représentation sélectionnée */}
        {effectivePerformanceId && selectedPerformance?.notes && (
          <SafeHtml
            className="rounded-xl border border-border bg-background-secondary px-4 py-3 mdx-content text-sm"
            html={selectedPerformance.notes}
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
