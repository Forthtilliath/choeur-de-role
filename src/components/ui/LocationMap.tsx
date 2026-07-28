'use client';

import { useState } from 'react';

export function LocationMap({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const encoded = encodeURIComponent(location);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-foreground/60 flex items-start gap-1 hover:text-primary transition-colors w-full text-left"
      >
        <span className="shrink-0 mt-px">📍</span>
        <span className="wrap-break-word min-w-0 flex-1">{location}</span>
        <span className="text-foreground/30 ml-1 text-[10px] shrink-0 mt-px">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-2">
          <iframe
            title={`Carte — ${location}`}
            src={`https://maps.google.com/maps?q=${encoded}&output=embed&hl=fr&z=17`}
            className="hidden md:block w-full h-72 rounded-lg border border-border"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex gap-2 flex-wrap">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all no-underline"
            >
              🗺 Google Maps
            </a>
            <a
              href={`https://waze.com/ul?q=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all no-underline"
            >
              🚗 Waze
            </a>
            <a
              href={`https://maps.apple.com/?daddr=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg border border-border text-foreground/60 hover:border-primary hover:text-primary transition-all no-underline"
            >
              🍎 Apple Plans
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
