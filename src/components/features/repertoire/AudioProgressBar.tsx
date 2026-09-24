'use client';

import { useRef } from 'react';

import { formatTime } from './repertoireFiles';

type Props = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
};

// Temps écoulé, barre de progression cliquable / tactile / clavier, durée totale
export function AudioProgressBar({ audioRef, currentTime, duration }: Props) {
  const progressRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function seekTo(clientX: number) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  }

  function seekTouch(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0] ?? e.changedTouches[0];
    if (touch) seekTo(touch.clientX);
  }

  function seekByKeyboard(e: React.KeyboardEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const step = 5;
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(duration, audio.currentTime + step);
    else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - step);
    else if (e.key === 'Home') audio.currentTime = 0;
    else if (e.key === 'End') audio.currentTime = duration;
    else return;
    e.preventDefault();
  }

  return (
    <>
      {/* Temps actuel */}
      <span className="text-xs tabular-nums text-foreground/40 shrink-0 w-8 text-right">
        {formatTime(currentTime)}
      </span>

      {/* Barre de progression */}
      <div
        ref={progressRef}
        onClick={(e) => seekTo(e.clientX)}
        onTouchStart={seekTouch}
        onTouchMove={seekTouch}
        onKeyDown={seekByKeyboard}
        role="slider"
        tabIndex={0}
        aria-label="Position de lecture"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} sur ${formatTime(duration)}`}
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
    </>
  );
}
