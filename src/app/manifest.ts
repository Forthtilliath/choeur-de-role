import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chœur de Rôle',
    short_name: 'CDR',
    description: 'Site officiel du Chœur de Rôle — chorale à Angers',
    id: '/',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f9f8fc',
    theme_color: '#5b3fa8',
    categories: ['music', 'entertainment'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Calendrier',
        url: '/choristes/calendrier',
        description: 'Voir le calendrier des répétitions',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Actualités',
        url: '/choristes',
        description: 'Lire les dernières actualités',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/screenshot-wide.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Page d\'accueil — Chœur de Rôle',
      },
      {
        src: '/screenshots/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Page d\'accueil sur mobile',
      },
    ],
  };
}
