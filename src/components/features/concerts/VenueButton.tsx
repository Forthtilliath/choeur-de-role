'use client';

import { useState } from 'react';

export function VenueButton({ venue }: { venue: string }) {
  const [open, setOpen] = useState(false);
  const encoded = encodeURIComponent(venue);
  const embedUrl = `https://maps.google.com/maps?q=${encoded}&output=embed&hl=fr`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-foreground/70 hover:text-primary transition-colors text-left text-sm underline decoration-dotted"
      >
        {venue}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background rounded-2xl border border-border overflow-hidden w-full max-w-3xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <p className="text-sm font-medium text-foreground">📍 {venue}</p>
              <button
                onClick={() => setOpen(false)}
                className="text-foreground/40 hover:text-foreground text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Carte */}
            <div className="relative w-full h-120">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Carte — ${venue}`}
              />
            </div>

            {/* Navigation */}
            <div className="flex gap-2 flex-wrap px-6 py-3 border-t border-border">
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
        </div>
      )}
    </>
  );
}