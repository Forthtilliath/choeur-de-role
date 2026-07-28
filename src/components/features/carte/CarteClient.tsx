'use client';

// Imports statiques OK — ce composant est chargé via dynamic(..., { ssr: false })
import * as LNamespace from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useEffect, useRef } from 'react';
import { escapeHtml, toTitleCase, toUpperCase } from '@/utils/stringHelpers';
import type { MapCenter, MembreCarte } from './types';

// Turbopack crée un namespace ESM figé depuis le module CJS de leaflet.
// .default pointe vers module.exports (l'objet live que les plugins peuvent augmenter).
const L = ((LNamespace as unknown as { default: typeof LNamespace }).default ??
  LNamespace) as typeof LNamespace;

type Props = {
  membres: MembreCarte[];
  center: MapCenter;
};

function getVoicePartColor(name: string | undefined): string {
  if (!name) return '#6b7280';
  const n = name.toLowerCase();
  if (n.includes('soprane')) return '#f97316';
  if (n.includes('alto')) return '#eab308';
  if (n.includes('ténor')) return '#22c55e';
  if (n.includes('basse')) return '#3b82f6';
  return '#6b7280';
}

export function CarteClient({ membres, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<typeof L.Map.prototype | null>(null);
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Marker lieu de répétition — hors cluster
    const rehearsalIcon = L.divIcon({
      html: `<div style="background:#128441;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">♫</div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([center.lat, center.lng], { icon: rehearsalIcon })
      .addTo(map)
      .bindPopup(`<span style="font-weight:700;color:#128441;">${center.label}</span>`);

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction(c) {
        const count = c.getChildCount();
        const size = count < 10 ? 36 : count < 50 ? 42 : 48;
        return L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#128441;color:white;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:sans-serif;">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    membres.forEach((m) => {
      if (m.lat === null || m.lng === null) return;

      const color = getVoicePartColor(m.voice_parts?.name);
      const firstName = escapeHtml(toTitleCase(m.first_name)) || '?';
      const lastName = escapeHtml(toUpperCase(m.last_name)) || '?';
      const initials = `${firstName[0]}${lastName[0]}`;

      const icon = L.divIcon({
        html: m.photo_url
          ? `<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:3px solid ${color};box-shadow:0 2px 8px rgba(0,0,0,0.25);background:#f3f4f6;"><img src="${escapeHtml(m.photo_url)}" style="width:100%;height:100%;object-fit:cover;" /></div>`
          : `<div style="width:40px;height:40px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:600;font-family:sans-serif;">${initials}</div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const fullName = `${firstName} ${lastName}`.trim();
      const addressLine = escapeHtml(
        [toTitleCase(m.address), m.zip_code, toTitleCase(m.city)].filter(Boolean).join(', '),
      );
      const voicePartName = escapeHtml(m.voice_parts?.name);
      const bureauRole = escapeHtml(m.bureau_role);
      const safePhone = escapeHtml(m.phone);
      const safeEmail = escapeHtml(m.email);

      const popupContent = `
        <div style="font-family:sans-serif;min-width:180px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            ${
              m.photo_url
                ? `<img src="${escapeHtml(m.photo_url)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ${color}" />`
                : `<div style="width:40px;height:40px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:600;">${initials}</div>`
            }
            <div>
              <p style="font-weight:600;margin:0;font-size:14px;">${fullName}</p>
              ${voicePartName ? `<p style="margin:0;font-size:11px;color:#6b7280;">${voicePartName}</p>` : ''}
              ${bureauRole ? `<p style="margin:0;font-size:11px;color:#6b7280;font-style:italic;">${bureauRole}</p>` : ''}
            </div>
          </div>
          ${addressLine ? `<p style="margin:0 0 8px;font-size:12px;color:#374151;">📍 ${addressLine}</p>` : ''}
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${safePhone ? `<a href="tel:${safePhone}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#f3f4f6;color:#374151;font-size:12px;text-decoration:none;border:1px solid #e5e7eb;">📞 Appeler</a>` : ''}
            ${safeEmail ? `<a href="mailto:${safeEmail}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#eff6ff;color:#2563eb;font-size:12px;text-decoration:none;border:1px solid #dbeafe;">✉ Email</a>` : ''}
          </div>
        </div>
      `;

      cluster.addLayer(
        L.marker([m.lat, m.lng], { icon }).bindPopup(popupContent, { maxWidth: 280 }),
      );
    });

    map.addLayer(cluster);

    // Bouton plein écran intégré aux contrôles Leaflet (topleft, sous zoom +/-)
    const FullscreenCtrl = L.Control.extend({
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const a = L.DomUtil.create('a', '', container) as HTMLAnchorElement;
        a.innerHTML = '⛶';
        a.title = 'Plein écran';
        a.href = '#';
        a.style.cssText = 'font-size:16px;display:flex;align-items:center;justify-content:center;';
        L.DomEvent.on(a, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          const el = containerRef.current;
          if (!el) return;
          if (!document.fullscreenElement) {
            el.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        });
        return container;
      },
      onRemove() {},
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (FullscreenCtrl as any)({ position: 'topleft' }).addTo(map);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [membres, center]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {membres.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <p className="text-foreground/50 text-sm">Aucun choriste géolocalisé.</p>
            <p className="text-foreground/30 text-xs mt-1">
              Les choristes apparaissent en activant le partage d&apos;adresse dans leur profil.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
