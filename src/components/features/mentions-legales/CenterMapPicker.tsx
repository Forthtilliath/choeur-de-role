'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  lat: string;
  lng: string;
  label: string;
  onChange: (lat: string, lng: string) => void;
};

const DEFAULT_LAT = 47.445717;
const DEFAULT_LNG = -0.537951;

export function CenterMapPicker({ lat, lng, label, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const currentCoordsRef = useRef({
    lat: parseFloat(lat) || DEFAULT_LAT,
    lng: parseFloat(lng) || DEFAULT_LNG,
  });

  const coords = {
    lat: parseFloat(lat) || DEFAULT_LAT,
    lng: parseFloat(lng) || DEFAULT_LNG,
  };

  useEffect(() => {
    if (!open) return;
    let map: import('leaflet').Map;
    let isMounted = true;

    async function initMap() {
      if (!mapRef.current || !isMounted) return;
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (!mapRef.current || !isMounted) return;

      const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (container._leaflet_id) return;

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      currentCoordsRef.current = coords;
      map = L.map(mapRef.current, { center: [coords.lat, coords.lng], zoom: 15 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      marker.bindPopup('Déplacez ce marker pour ajuster la position.').openPopup();
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        currentCoordsRef.current = { lat: pos.lat, lng: pos.lng };
      });

      requestAnimationFrame(() => map.invalidateSize());
    }

    const timer = setTimeout(initMap, 50);
    return () => {
      clearTimeout(timer);
      isMounted = false;
      map?.remove();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- coords intentionally excluded: map init uses props at open time only

  function handleConfirm() {
    const c = currentCoordsRef.current;
    onChange(c.lat.toFixed(6), c.lng.toFixed(6));
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-background">
        <span className="flex-1 text-sm text-foreground/60">
          {lat && lng ? `${lat}, ${lng}` : 'Position non définie'}
        </span>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)}>
          📍 Choisir sur la carte
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border border-border overflow-hidden w-full max-w-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Position du lieu de répétition
                </p>
                <p className="text-xs text-foreground/50 mt-0.5 truncate max-w-xs">
                  {label || 'Lieu de répétition'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-foreground/40 hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 shrink-0">
              <p className="text-xs text-primary">
                📍 Déplacez le marker pour ajuster la position, puis confirmez.
              </p>
            </div>
            <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-border shrink-0">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleConfirm}>
                ✓ Confirmer la position
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
