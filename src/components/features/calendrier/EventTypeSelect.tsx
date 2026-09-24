'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { EventType } from './types';

// Liste déroulante des types d'évènement, avec pastille de couleur
export function EventTypeSelect({
  eventTypes,
  value,
  onChange,
}: {
  eventTypes: EventType[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = eventTypes.find((et) => et.id === value);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground hover:border-primary/50 focus:outline-none focus:border-primary transition-colors"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors"
          style={{ backgroundColor: selected?.color }}
        />
        <span className="flex-1 text-left">{selected?.label}</span>
        <ChevronDown
          size={14}
          className={`text-foreground/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              type="button"
              onClick={() => {
                onChange(et.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-background-secondary ${et.id === value ? 'bg-background-tertiary font-medium text-foreground' : 'text-foreground/70'}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: et.color }}
              />
              {et.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
