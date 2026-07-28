export type LegalData = Record<string, string>;

export const LEGAL_FIELDS = [
  {
    section: 'Association',
    fields: [
      { key: 'association_name', label: "Nom de l'association" },
      { key: 'siege_social', label: 'Siège social' },
      { key: 'rna', label: 'Numéro RNA' },
      { key: 'president_name', label: 'Nom du président' },
      { key: 'contact_email', label: 'Email de contact', type: 'email' },
      { key: 'site_url', label: 'Domaine du site' },
    ],
  },
  {
    section: 'Hébergeur',
    fields: [
      { key: 'hebergeur_name', label: "Nom de l'hébergeur" },
      { key: 'hebergeur_address', label: "Adresse de l'hébergeur" },
      { key: 'hebergeur_url', label: "Site de l'hébergeur", type: 'url' },
    ],
  },
  {
    section: 'Carte des choristes',
    fields: [],
  },
];
