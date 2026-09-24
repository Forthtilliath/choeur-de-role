'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

import { broadcastVolume, getStoredVolume } from './repertoireFiles';

// Volume global partagé par tous les lecteurs : popup (desktop) ou bottom sheet (mobile)
export function VolumeControl() {
  const [volume, setVolume] = useState(0.5);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [volumeClosing, setVolumeClosing] = useState(false);
  const volumePopupRef = useRef<HTMLDivElement>(null);
  const volumeCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init volume depuis localStorage (SSR-safe : useEffect évite le mismatch d'hydratation)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setVolume(getStoredVolume());
  }, []);

  // Sync volume si un autre composant le change
  useEffect(() => {
    const handler = (e: Event) => setVolume((e as CustomEvent<number>).detail);
    window.addEventListener('audio-volume-change', handler);
    return () => window.removeEventListener('audio-volume-change', handler);
  }, []);

  function closeVolumePopup() {
    if (volumeCloseTimerRef.current) clearTimeout(volumeCloseTimerRef.current);
    setVolumeClosing(true);
    volumeCloseTimerRef.current = setTimeout(() => {
      setShowVolumePopup(false);
      setVolumeClosing(false);
      volumeCloseTimerRef.current = null;
    }, 240);
  }

  function openVolumePopup() {
    if (volumeCloseTimerRef.current) {
      clearTimeout(volumeCloseTimerRef.current);
      volumeCloseTimerRef.current = null;
    }
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

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    broadcastVolume(v);
  }

  return (
    <div className="relative shrink-0" ref={volumePopupRef}>
      <button
        onClick={() => (showVolumePopup ? closeVolumePopup() : openVolumePopup())}
        className="text-foreground/40 hover:text-primary transition-colors"
        aria-label="Volume"
      >
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {showVolumePopup && (
        <>
          {/* Backdrop mobile — pas un tab stop, la fermeture au clavier passe par le bouton volume. */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div className="sm:hidden fixed inset-0 bg-black/40 z-20" onClick={closeVolumePopup} />
          {/* Bottom sheet (mobile) / popup (desktop) */}
          <div
            className={`${volumeClosing ? 'animate-slide-down' : 'animate-slide-up'} sm:animate-none fixed bottom-0 left-0 right-0 z-30 sm:absolute sm:bottom-full sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-auto sm:z-20 bg-background border-t border-border sm:border sm:rounded-xl rounded-t-2xl shadow-lg px-6 pt-5 pb-8 sm:px-4 sm:py-3 flex flex-col items-center gap-3`}
          >
            <div className="w-10 h-1 bg-border rounded-full sm:hidden" />
            <span className="text-sm sm:text-xs text-foreground/60">Volume global</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full sm:w-28 h-2 sm:h-1 accent-primary cursor-pointer"
              aria-label="Volume global"
            />
            <span className="text-sm sm:text-xs tabular-nums text-foreground/40">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}
