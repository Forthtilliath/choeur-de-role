export const SITE_URL = 'https://choeur-de-role.vercel.app';
export const SITE_NAME = 'Chœur de Rôle';
export const SITE_DESCRIPTION =
  'Chorale à Angers depuis 2015. Le Chœur de Rôle réunit près de 70 choristes adultes pour des spectacles vivants tous les 2 ans. Chant choral, variété, classique.';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  foundingDate: '2015',
  location: {
    '@type': 'Place',
    name: 'Angers',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Angers',
      addressRegion: 'Maine-et-Loire',
      addressCountry: 'FR',
    },
  },
  genre: ['Chant choral', 'Variété', 'Classique'],
};
