'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Coords } from './types';

type Props = {
  coords: Coords;
  address: string;
  onConfirmAction: (coords: Coords) => void;
  onCloseAction: () => void;
};

export function GeoValidationPopup({
  coords,
  address,
  onConfirmAction,
  onCloseAction,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const currentCoordsRef = useRef<Coords>(coords);

  useEffect(() => {
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
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      map = L.map(mapRef.current, { center: [coords.lat, coords.lng], zoom: 15 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      marker.bindPopup('Déplacez ce marker pour corriger la position.').openPopup();
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        currentCoordsRef.current = { lat: pos.lat, lng: pos.lng };
      });

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    }

    const timer = setTimeout(initMap, 50);
    return () => {
      clearTimeout(timer);
      isMounted = false;
      map?.remove();
    };
  }, [coords]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl border border-border overflow-hidden w-full max-w-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-medium text-foreground">Vérifier la localisation</p>
            <p className="text-xs text-foreground/50 mt-0.5 truncate max-w-xs">{address}</p>
          </div>
          <button
            onClick={onCloseAction}
            className="text-foreground/40 hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 shrink-0">
          <p className="text-xs text-primary">
            📍 Déplacez le marker si la position n&apos;est pas exacte, puis confirmez.
          </p>
        </div>
        <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-border shrink-0">
          <Button variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button onClick={() => onConfirmAction(currentCoordsRef.current)}>
            ✓ Confirmer la position
          </Button>
        </div>
      </div>
    </div>
  );
}
