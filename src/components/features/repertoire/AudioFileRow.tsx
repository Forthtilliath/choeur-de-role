'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

import { openSignedUrl } from '@/lib/downloadFile';

import { AudioProgressBar } from './AudioProgressBar';
import { fetchSignedUrl, getStoredVolume, triggerR2Download } from './repertoireFiles';
import { VolumeControl } from './VolumeControl';

type Props = {
  fileUrl: string;
  label: string;
  downloadName: string;
  date: string | null;
};

// Fichier audio : URL signée chargée au premier clic, lecteur dépliable (un seul joue à la fois)
export function AudioFileRow({ fileUrl, label, downloadName, date }: Props) {
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Listeners audio (déclenché quand audioUrl est chargée)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.volume = getStoredVolume();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onPlay = () => {
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audio) el.pause();
      });
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  async function handlePlayPause() {
    const audio = audioRef.current;

    if (!audioUrl) {
      setLoadingUrl(true);
      try {
        const url = await fetchSignedUrl(fileUrl);
        setAudioUrl(url);
        setPlayerOpen(true);
      } catch {
        try {
          await openSignedUrl(fileUrl);
        } catch {
          toast.error("Impossible de charger l'audio");
        }
      } finally {
        setLoadingUrl(false);
      }
      return;
    }

    if (audio) {
      if (isPlaying) audio.pause();
      else audio.play();
    }
  }

  async function handleDownload() {
    if (triggerR2Download(fileUrl, downloadName)) return;
    // Fichier legacy Supabase : ouvrir via URL signée
    try {
      await openSignedUrl(fileUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de télécharger');
    }
  }

  return (
    <div className="w-full">
      {/* Enregistrement audio d'un chant — pas de dialogue à sous-titrer. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div
        className={`rounded-xl border transition-colors ${playerOpen ? 'border-primary/30 bg-background-secondary' : 'border-border'}`}
      >
        {/* Ligne titre */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className="text-lg shrink-0">🎵</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-foreground">{label}</span>
            {date && <div className="text-xs text-foreground/30 mt-0.5">{date}</div>}
          </div>

          {/* Télécharger */}
          <button
            onClick={handleDownload}
            className="p-1 text-foreground hover:text-primary transition-colors shrink-0"
            aria-label="Télécharger"
          >
            <Download size={17} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            disabled={loadingUrl}
            className="w-8 h-8 rounded-full bg-primary/15 hover:bg-primary/25 flex items-center justify-center text-primary transition-colors shrink-0 disabled:opacity-50"
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {loadingUrl ? (
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" className="translate-x-px" />
            )}
          </button>
        </div>

        {/* Barre de progression dépliée */}
        {playerOpen && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <VolumeControl />
            <AudioProgressBar audioRef={audioRef} currentTime={currentTime} duration={duration} />

            {/* Fermer le lecteur */}
            <button
              onClick={() => setPlayerOpen(false)}
              className="text-foreground/30 hover:text-foreground transition-colors shrink-0 ml-1"
              aria-label="Fermer le lecteur"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
