export type SearchItem = {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: string;
};

export const publicNavItems: SearchItem[] = [
  { id: 'nav-concerts', group: 'Pages', label: 'Concerts', href: '/concerts', icon: '🎶' },
  {
    id: 'nav-evenements',
    group: 'Pages',
    label: 'Événements externes',
    href: '/evenements',
    icon: '📅',
  },
  { id: 'nav-galerie', group: 'Pages', label: 'Galerie', href: '/galerie', icon: '🖼️' },
  { id: 'nav-partenaires', group: 'Pages', label: 'Partenaires', href: '/partenaires', icon: '🤝' },
  { id: 'nav-contact', group: 'Pages', label: 'Contact', href: '/contact', icon: '✉️' },
];

export const privateNavItems: SearchItem[] = [
  {
    id: 'nav-actu',
    group: 'Espace choristes',
    label: 'Actualités',
    href: '/choristes',
    icon: '📰',
  },
  {
    id: 'nav-calendrier',
    group: 'Espace choristes',
    label: 'Calendrier',
    href: '/choristes/calendrier',
    icon: '📅',
  },
  {
    id: 'nav-repertoire',
    group: 'Espace choristes',
    label: 'Répertoire',
    href: '/choristes/repertoire',
    icon: '🎵',
  },
  {
    id: 'nav-liens',
    group: 'Espace choristes',
    label: 'Liens utiles',
    href: '/choristes/liens',
    icon: '🔗',
  },
  {
    id: 'nav-trombi',
    group: 'Espace choristes',
    label: 'Trombinoscope',
    href: '/choristes/trombinoscope',
    icon: '👥',
  },
  {
    id: 'nav-carte',
    group: 'Espace choristes',
    label: 'Carte',
    href: '/choristes/carte',
    icon: '🗺️',
  },
  { id: 'nav-ca', group: 'Espace choristes', label: 'CA', href: '/choristes/ca', icon: '📋' },
  {
    id: 'nav-sondages',
    group: 'Espace choristes',
    label: 'Sondages',
    href: '/choristes/sondages',
    icon: '📊',
  },
  {
    id: 'nav-profil',
    group: 'Espace choristes',
    label: 'Mon profil',
    href: '/choristes/profil',
    icon: '👤',
  },
];

export const adminNavItems: SearchItem[] = [
  {
    id: 'adm-dash',
    group: 'Administration',
    label: 'Tableau de bord',
    href: '/choristes/admin/tableau-de-bord',
    icon: '📊',
  },
  {
    id: 'adm-messages',
    group: 'Administration',
    label: 'Messages de contact',
    href: '/choristes/admin/messages',
    icon: '✉️',
  },
  {
    id: 'adm-homepage',
    group: 'Administration',
    label: "Page d'accueil",
    href: '/choristes/admin/homepage',
    icon: '🏠',
  },
  {
    id: 'adm-concerts',
    group: 'Administration',
    label: 'Concerts',
    href: '/choristes/admin/concerts',
    icon: '🎭',
  },
  {
    id: 'adm-galerie',
    group: 'Administration',
    label: 'Galerie photos',
    href: '/choristes/admin/galerie',
    icon: '🖼️',
  },
  {
    id: 'adm-evenements',
    group: 'Administration',
    label: 'Événements',
    href: '/choristes/admin/evenements',
    icon: '📅',
  },
  {
    id: 'adm-sponsors',
    group: 'Administration',
    label: 'Partenaires',
    href: '/choristes/admin/sponsors',
    icon: '🤝',
  },
  {
    id: 'adm-membres',
    group: 'Administration',
    label: 'Membres',
    href: '/choristes/admin/membres',
    icon: '👥',
  },
  {
    id: 'adm-pupitres',
    group: 'Administration',
    label: 'Pupitres',
    href: '/choristes/admin/pupitres',
    icon: '🎤',
  },
  {
    id: 'adm-saisons',
    group: 'Administration',
    label: 'Saisons',
    href: '/choristes/admin/saisons',
    icon: '📆',
  },
  {
    id: 'adm-media',
    group: 'Administration',
    label: 'Médiathèque',
    href: '/choristes/admin/mediatheque',
    icon: '📁',
  },
  {
    id: 'adm-calendrier',
    group: 'Administration',
    label: 'Calendrier',
    href: '/choristes/admin/calendrier',
    icon: '📅',
  },
  {
    id: 'adm-liens',
    group: 'Administration',
    label: 'Liens utiles',
    href: '/choristes/admin/liens',
    icon: '🔗',
  },
  {
    id: 'adm-ca',
    group: 'Administration',
    label: 'Comptes-rendus CA',
    href: '/choristes/admin/ca',
    icon: '📋',
  },
  {
    id: 'adm-sondages',
    group: 'Administration',
    label: 'Sondages',
    href: '/choristes/admin/sondages',
    icon: '📊',
  },
  {
    id: 'adm-audit',
    group: 'Administration',
    label: "Journal d'audit",
    href: '/choristes/admin/audit-log',
    icon: '🔍',
  },
];
