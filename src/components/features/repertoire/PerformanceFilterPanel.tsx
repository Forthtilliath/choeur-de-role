'use client';

import { useState } from 'react';

import type { PerformanceFilter } from './types';

const ACTIVE_CLASS = 'border-primary bg-primary/10 text-primary';
const IDLE_CLASS = 'border-border text-foreground/60';

type Props = {
  performances: PerformanceFilter[];
  now: Date;
  selectedPerformanceId: string | null;
  effectivePerformanceId: string | null;
  initialOpenSongId?: string;
  onSelectAction: (id: string | null) => void;
  mobileOpen: boolean;
  onToggleMobileAction: () => void;
};

// Filtre par représentation : à venir d'abord, passées repliées derrière un bouton
export function PerformanceFilterPanel({
  performances,
  now,
  selectedPerformanceId,
  effectivePerformanceId,
  initialOpenSongId,
  onSelectAction,
  mobileOpen,
  onToggleMobileAction,
}: Props) {
  const [showPastPerfs, setShowPastPerfs] = useState(false);

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

  const selectedPerfName =
    performances.find((p) => p.id === effectivePerformanceId)?.title ?? 'Toutes';

  return (
    <div className="flex flex-col gap-2">
      {/* Mobile toggle */}
      <button
        onClick={onToggleMobileAction}
        className="sm:hidden flex items-center justify-between w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground/60 bg-background"
      >
        <span>Représentation — {selectedPerfName}</span>
        <span>{mobileOpen ? '▲' : '▼'}</span>
      </button>
      <div className={`flex flex-col gap-2 ${mobileOpen ? '' : 'hidden sm:flex'}`}>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-foreground/50 hidden sm:inline">Représentation :</span>
          <button
            onClick={() => onSelectAction(null)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${effectivePerformanceId === null ? ACTIVE_CLASS : IDLE_CLASS}`}
          >
            Toutes
          </button>
          {upcomingPerfs.map((p) => {
            const isActive = effectivePerformanceId === p.id;
            const isStoredNotInSong =
              !!initialOpenSongId && selectedPerformanceId === p.id && !isActive;
            return (
              <button
                key={p.id}
                onClick={() => onSelectAction(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  isActive
                    ? ACTIVE_CLASS
                    : isStoredNotInSong
                      ? 'border-dashed border-primary/60 text-primary/60'
                      : IDLE_CLASS
                }`}
              >
                {p.title}
              </button>
            );
          })}
          {/* Selected past perf: normal active if song is in it, discrete dashed if not */}
          {selectedPastPerf && (
            <button
              onClick={() => onSelectAction(selectedPastPerf.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                effectivePerformanceId === selectedPastPerf.id
                  ? ACTIVE_CLASS
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
                onClick={() => onSelectAction(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all opacity-60 ${effectivePerformanceId === p.id ? `${ACTIVE_CLASS} opacity-100` : IDLE_CLASS}`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
