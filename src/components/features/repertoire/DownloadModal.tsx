'use client';

import { useState } from 'react';

import { buildFileLabel } from './helpers';
import type { Song, VoicePart } from './types';

export function DownloadModal({
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
    // Backdrop click-to-dismiss — Escape n'est pas géré ici, la croix suffit comme équivalent clavier.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contient le clic pour éviter la fermeture au clic dans la modale */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
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
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-foreground">
              Que souhaitez-vous télécharger ?
            </legend>
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
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-foreground">Pour quel pupitre ?</legend>
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
          </fieldset>

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
