'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Download, ExternalLink, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { openSignedUrl } from '@/lib/downloadFile';

type Props = {
  fileUrl: string;
  label: string;
  downloadName: string;
  type: string;
  date: string | null;
  id?: string;
};

// ── Cache URL signée ────────────────────────────────────────────

const CACHE_TTL = 3000; // 50 min en secondes
const VOLUME_KEY = 'audio_global_volume';

function getCachedUrl(fileUrl: string): string | null {
  try {
    const raw = sessionStorage.getItem(`r2_url:${fileUrl}`);
    if (!raw) return null;
    const { url, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(`r2_url:${fileUrl}`); return null; }
    return url;
  } catch { return null; }
}

function setCachedUrl(fileUrl: string, url: string): void {
  try {
    sessionStorage.setItem(`r2_url:${fileUrl}`, JSON.stringify({ url, expiresAt: Date.now() + CACHE_TTL * 1000 }));
  } catch {}
}

async function fetchSignedUrl(fileUrl: string): Promise<string> {
  const cached = getCachedUrl(fileUrl);
  if (cached) return cached;
  const res = await fetch(`/api/repertoire/signed-url?path=${encodeURIComponent(fileUrl)}`);
  if (!res.ok) throw new Error(`Signed URL error: ${res.status}`);
  const data = await res.json();
  if (!data.url) throw new Error('URL non disponible');
  setCachedUrl(fileUrl, data.url);
  return data.url;
}

// ── Volume global ───────────────────────────────────────────────

function getStoredVolume(): number {
  try {
    const v = localStorage.getItem(VOLUME_KEY);
    return v ? Math.min(1, Math.max(0, parseFloat(v))) : 0.5;
  } catch { return 0.5; }
}

function broadcastVolume(v: number): void {
  try { localStorage.setItem(VOLUME_KEY, String(v)); } catch {}
  document.querySelectorAll('audio').forEach((el) => { (el as HTMLAudioElement).volume = v; });
  window.dispatchEvent(new CustomEvent('audio-volume-change', { detail: v }));
}

// ── Helpers ─────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// ── Composant principal ─────────────────────────────────────────

export function RepertoireFileLink({ fileUrl, label, downloadName, type, date, id }: Props) {
  if (type === 'audio') {
    return <AudioFileRow fileUrl={fileUrl} label={label} downloadName={downloadName} date={date} />;
  }
  return <NonAudioFileRow fileUrl={fileUrl} label={label} downloadName={downloadName} type={type} date={date} id={id} />;
}

// ── Fichier non-audio ───────────────────────────────────────────

function NonAudioFileRow({ fileUrl, label, downloadName, type, date, id }: { fileUrl: string; label: string; downloadName: string; type: string; date: string | null; id?: string }) {
  const [loading, setLoading] = useState(false);
  const icon = type === 'score' ? '📄' : '📝';

  async function handleOpen() {
    setLoading(true);
    try {
      await openSignedUrl(fileUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible d\'ouvrir le fichier');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!fileUrl.startsWith('r2://')) {
      handleOpen();
      return;
    }
    const params = new URLSearchParams({ path: fileUrl, filename: downloadName });
    const a = document.createElement('a');
    a.href = `/api/repertoire/r2-download?${params}`;
    a.download = downloadName;
    a.click();
  }

  async function handleShare() {
    await navigator.clipboard.writeText(`${window.location.origin}/choristes/fichiers/${id}`);
    toast.success('Lien copié !');
  }

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground">{loading ? 'Chargement...' : label}</span>
          {date && <div className="text-xs text-foreground/30 mt-0.5">{date}</div>}
        </div>
        <button
          onClick={handleDownload}
          className="p-1 text-foreground hover:text-primary transition-colors shrink-0"
          title="Télécharger"
          aria-label="Télécharger"
        >
          <Download size={17} />
        </button>
        {id && (
          <button
            onClick={handleShare}
            className="p-1 text-foreground hover:text-primary transition-colors shrink-0"
            title="Copier le lien partageable"
            aria-label="Copier le lien partageable"
          >
            <Copy size={17} />
          </button>
        )}
        <button
          onClick={handleOpen}
          disabled={loading}
          data-testid="open-file-btn"
          className="p-1 text-foreground hover:text-primary transition-colors shrink-0 disabled:opacity-50"
          title="Ouvrir"
          aria-label="Ouvrir"
        >
          <ExternalLink size={17} />
        </button>
      </div>
    </div>
  );
}

// ── Fichier audio ───────────────────────────────────────────────

function AudioFileRow({ fileUrl, label, downloadName, date }: { fileUrl: string; label: string; downloadName: string; date: string | null }) {
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [volumeClosing, setVolumeClosing] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumePopupRef = useRef<HTMLDivElement>(null);
  const volumeCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Init volume depuis localStorage (SSR-safe : useEffect évite le mismatch d'hydratation)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVolume(getStoredVolume()); }, []);

  // Sync volume si un autre composant le change
  useEffect(() => {
    const handler = (e: Event) => setVolume((e as CustomEvent<number>).detail);
    window.addEventListener('audio-volume-change', handler);
    return () => window.removeEventListener('audio-volume-change', handler);
  }, []);

  // Listeners audio (déclenché quand audioUrl est chargée)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.volume = volume;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onPlay = () => {
      document.querySelectorAll('audio').forEach((el) => { if (el !== audio) el.pause(); });
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

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
  }, [audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  function closeVolumePopup() {
    if (volumeCloseTimer.current) clearTimeout(volumeCloseTimer.current);
    setVolumeClosing(true);
    volumeCloseTimer.current = setTimeout(() => {
      setShowVolumePopup(false);
      setVolumeClosing(false);
      volumeCloseTimer.current = null;
    }, 240);
  }

  function openVolumePopup() {
    if (volumeCloseTimer.current) { clearTimeout(volumeCloseTimer.current); volumeCloseTimer.current = null; }
    setVolumeClosing(false);
    setShowVolumePopup(true);
  }

  // Fermer le popup volume au clic extérieur
  useEffect(() => {
    if (!showVolumePopup) return;
    const handler = (e: MouseEvent) => {
      if (volumePopupRef.current && !volumePopupRef.current.contains(e.target as Node)) {
        closeVolumePopup();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVolumePopup]);

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
          toast.error('Impossible de charger l\'audio');
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
    if (!fileUrl.startsWith('r2://')) {
      // Fichier legacy Supabase : ouvrir via URL signée
      try {
        await openSignedUrl(fileUrl);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Impossible de télécharger');
      }
      return;
    }
    const params = new URLSearchParams({ path: fileUrl, filename: downloadName });
    const a = document.createElement('a');
    a.href = `/api/repertoire/r2-download?${params}`;
    a.download = downloadName;
    a.click();
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  }

  function seekTouch(e: React.TouchEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const touch = e.touches[0] ?? e.changedTouches[0];
    const rect = bar.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)) * duration;
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    broadcastVolume(v);
  }

  return (
    <div className="w-full">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className={`rounded-xl border transition-colors ${playerOpen ? 'border-primary/30 bg-background-secondary' : 'border-border'}`}>

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
            {loadingUrl
              ? <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : isPlaying
                ? <Pause size={13} fill="currentColor" />
                : <Play size={13} fill="currentColor" className="translate-x-px" />
            }
          </button>
        </div>

        {/* Barre de progression dépliée */}
        {playerOpen && (
          <div className="px-4 pb-3 flex items-center gap-2">

            {/* Bouton volume → popup */}
            <div className="relative shrink-0" ref={volumePopupRef}>
              <button
                onClick={() => showVolumePopup ? closeVolumePopup() : openVolumePopup()}
                className="text-foreground/40 hover:text-primary transition-colors"
                aria-label="Volume"
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {showVolumePopup && (
                <>
                  {/* Backdrop mobile */}
                  <div
                    className="sm:hidden fixed inset-0 bg-black/40 z-20"
                    onClick={closeVolumePopup}
                  />
                  {/* Bottom sheet (mobile) / popup (desktop) */}
                  <div className={`${volumeClosing ? 'animate-slide-down' : 'animate-slide-up'} sm:animate-none fixed bottom-0 left-0 right-0 z-30 sm:absolute sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-auto sm:z-20 bg-background border-t border-border sm:border sm:rounded-xl rounded-t-2xl shadow-lg px-6 pt-5 pb-8 sm:px-4 sm:py-3 flex flex-col items-center gap-3`}>
                    <div className="w-10 h-1 bg-border rounded-full sm:hidden" />
                    <span className="text-sm sm:text-xs text-foreground/60">Volume global</span>
                    <input
                      type="range" min="0" max="1" step="0.01" value={volume}
                      onChange={handleVolumeChange}
                      className="w-full sm:w-28 h-2 sm:h-1 accent-primary cursor-pointer"
                      aria-label="Volume global"
                    />
                    <span className="text-sm sm:text-xs tabular-nums text-foreground/40">{Math.round(volume * 100)}%</span>
                  </div>
                </>
              )}
            </div>

            {/* Temps actuel */}
            <span className="text-xs tabular-nums text-foreground/40 shrink-0 w-8 text-right">
              {formatTime(currentTime)}
            </span>

            {/* Barre de progression */}
            <div
              ref={progressRef}
              onClick={seek}
              onTouchStart={seekTouch}
              onTouchMove={seekTouch}
              className="flex-1 h-1.5 bg-border rounded-full cursor-pointer relative group"
            >
              <div
                className="h-full bg-primary rounded-full relative transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Durée totale */}
            <span className="text-xs tabular-nums text-foreground/40 shrink-0 w-8">
              {formatTime(duration)}
            </span>

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
