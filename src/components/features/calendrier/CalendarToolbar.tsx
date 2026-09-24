'use client';

import { useState } from 'react';

import type { EventType } from './types';

export type CalendarView = 'month' | 'week';

// Pastilles des types + repères « aujourd'hui » et « prochain rassemblement »
function LegendItems({ eventTypes, itemClass }: { eventTypes: EventType[]; itemClass: string }) {
  return (
    <>
      {eventTypes.map((et) => (
        <div key={et.id} className={itemClass}>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: et.color }}
          />
          {et.label}
        </div>
      ))}
      <div className={itemClass}>
        <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
        Aujourd&apos;hui
      </div>
      <div className={itemClass}>
        <span className="w-2.5 h-2.5 rounded-full border-2 border-primary shrink-0" />
        Prochain rassemblement
      </div>
    </>
  );
}

type Props = {
  eventTypes: EventType[];
  view: CalendarView;
  onViewChangeAction: (view: CalendarView) => void;
};

// Légende (repliable sur mobile), bascule mois/semaine et export iCal
export function CalendarToolbar({ eventTypes, view, onViewChangeAction }: Props) {
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile : bouton toggle légende */}
        <button
          className="md:hidden flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
          onClick={() => setLegendOpen((v) => !v)}
        >
          <span className="flex gap-1">
            {eventTypes.slice(0, 4).map((et) => (
              <span
                key={et.id}
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: et.color }}
              />
            ))}
          </span>
          Légende {legendOpen ? '▲' : '▼'}
        </button>

        {/* Desktop : légende complète inline */}
        <div className="hidden md:flex flex-wrap gap-3 flex-1">
          <LegendItems
            eventTypes={eventTypes}
            itemClass="flex items-center gap-1.5 text-xs text-foreground/60"
          />
        </div>

        {/* Contrôles droite : toggle vue + export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle mois/semaine — desktop uniquement */}
          <div className="hidden md:flex gap-1 border border-border rounded-lg p-0.5">
            {(['month', 'week'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChangeAction(v)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  view === v ? 'bg-primary text-white' : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {v === 'month' ? 'Mois' : 'Semaine'}
              </button>
            ))}
          </div>

          {/* Export iCal */}
          <a
            href="/api/calendrier/export-ical"
            download="calendrier-cda.ics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-foreground/50 hover:text-foreground hover:border-primary/40 transition-colors"
            title="Exporter le calendrier (.ics)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className="hidden sm:inline">.ics</span>
          </a>
        </div>
      </div>

      {/* Légende dépliée — mobile uniquement */}
      {legendOpen && (
        <div className="md:hidden flex flex-col gap-2 p-3 rounded-xl border border-border bg-background-secondary">
          <LegendItems
            eventTypes={eventTypes}
            itemClass="flex items-center gap-2 text-xs text-foreground/60"
          />
        </div>
      )}
    </div>
  );
}
