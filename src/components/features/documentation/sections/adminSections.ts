import type { Section } from './types';

// Administration : CA, liens, partenaires, pupitres, profil, recherche, mentions
export const ADMIN_SECTIONS: Section[] = [
  {
    id: 'ca',
    icon: '📋',
    title: 'Conseil CA',
    description: 'Publier des comptes-rendus de réunion, avec import PDF automatique.',
    steps: [
      {
        title: 'Importer un PDF',
        content:
          'Administration → CA → "+ Ajouter un compte-rendu" → cliquez "📄 Importer un PDF". Le contenu est extrait automatiquement et pré-remplit l\'éditeur. Corrigez si nécessaire avant de publier.',
        tip: "L'extraction n'est pas parfaite pour tous les PDFs — vérifiez toujours le contenu avant publication.",
      },
      {
        title: 'Publier un compte-rendu',
        content:
          'Après avoir vérifié le contenu, cliquez "Ajouter" (brouillon) puis "Publier". Le PDF original reste disponible en téléchargement pour les choristes via un bouton "📄 PDF".',
      },
      {
        title: 'Accès CA',
        content:
          'Les membres avec le rôle CA peuvent aussi gérer les comptes-rendus, pas seulement les admins.',
      },
    ],
  },
  {
    id: 'liens',
    icon: '🔗',
    title: 'Liens utiles',
    description: 'Gérer les liens partagés avec les choristes, avec niveaux de visibilité.',
    steps: [
      {
        title: 'Ajouter un lien',
        content:
          'Administration → Liens → "+ Ajouter un lien". Remplissez le label, l\'URL et choisissez la visibilité.',
      },
      {
        title: 'Niveaux de visibilité',
        content:
          'Trois niveaux disponibles :\n— "Tous les choristes" : visible par tous les membres connectés\n— "CA et admins" : réservé au conseil d\'administration\n— "Admins uniquement" : réservé aux administrateurs',
      },
      {
        title: 'Accès CA',
        content: 'Les membres avec le rôle CA peuvent aussi gérer les liens.',
      },
    ],
  },
  {
    id: 'partenaires',
    icon: '🤝',
    title: 'Partenaires',
    description: 'Gérer les logos partenaires et le dossier de sponsoring.',
    steps: [
      {
        title: 'Ajouter un partenaire',
        content:
          'Administration → Partenaires → "+ Ajouter". Uploadez le logo, renseignez le nom et le site web. Choisissez la taille : "Grand" pour les partenaires principaux, "Carré" pour les autres.',
      },
      {
        title: 'Mettre à jour le dossier de sponsoring',
        content:
          'Sur la page publique Partenaires, un bouton "📄 Changer le dossier" est visible pour les admins. Cliquez dessus pour uploader un nouveau PDF. L\'ancien est automatiquement remplacé.',
      },
    ],
  },
  {
    id: 'pupitres',
    icon: '🎶',
    title: 'Pupitres',
    description: "Gérer les pupitres et leurs groupes pour l'affichage.",
    steps: [
      {
        title: 'Ajouter un pupitre',
        content:
          'Administration → Pupitres → "+ Ajouter un pupitre". Saisissez le nom et optionnellement un groupe (ex: "Femmes" pour Soprano 1 et Soprano 2).',
      },
      {
        title: 'Groupes de pupitres',
        content:
          'Les pupitres avec le même nom de groupe sont affichés ensemble dans le trombinoscope et les filtres. Ex: "Soprano 1" et "Soprano 2" avec le groupe "Sopranes" → bouton splitté [1] Sopranes [2].',
      },
      {
        title: 'Pupitres non-réels',
        content:
          'Certains pupitres comme "Tutti" ou "Instrumentale" ne correspondent pas à une voix réelle. Ils n\'apparaissent pas dans les filtres du trombinoscope mais peuvent être assignés à des fichiers.',
      },
    ],
  },
  {
    id: 'profil',
    icon: '👤',
    title: 'Profil choriste',
    description: 'Ce que les choristes peuvent modifier eux-mêmes dans leur espace.',
    steps: [
      {
        title: 'Ce que le choriste peut modifier',
        content:
          'Chaque choriste peut modifier : son prénom et nom, son téléphone, son adresse, sa photo de profil, et ses préférences de visibilité (email, téléphone, adresse).',
      },
      {
        title: 'Visibilité sur le trombinoscope',
        content:
          "Le choriste choisit ce que les autres voient de lui. L'email, le téléphone et l'adresse sont masqués par défaut.",
        tip: 'Les données masquées ne sont jamais envoyées au navigateur — le filtrage est fait côté serveur.',
      },
      {
        title: 'Apparaître sur la carte',
        content:
          'Pour apparaître sur la carte des choristes, le choriste doit : 1) avoir une adresse renseignée, 2) avoir activé la visibilité de l\'adresse, 3) avoir vérifié sa position via le bouton "📍 Vérifier la position".',
      },
    ],
  },
  {
    id: 'recherche',
    icon: '🔍',
    title: 'Palette de recherche (⌘K)',
    description: "Naviguer rapidement vers n'importe quelle page, chant, choriste ou évènement.",
    steps: [
      {
        title: 'Ouvrir la palette',
        content:
          "Appuyez sur ⌘K (Mac) ou Ctrl+K (Windows/Linux) depuis n'importe quelle page. Vous pouvez aussi cliquer sur l'icône loupe dans la barre de navigation.",
        tip: 'La palette fonctionne sur toutes les pages du site, connecté ou non.',
      },
      {
        title: 'Rechercher',
        content:
          'Commencez à taper pour voir les résultats. La recherche couvre : les pages du site, les choristes (prénom, nom, pupitre), les chants du répertoire, les concerts, les actualités publiées et les évènements du calendrier.\n\nLes résultats apparaissent après un court délai (400 ms) et sont groupés par catégorie.',
      },
      {
        title: 'Navigation clavier',
        content:
          '↑ / ↓ pour se déplacer entre les résultats, Entrée pour ouvrir, Échap pour fermer. La souris fonctionne également.',
      },
      {
        title: 'Section Administration dans la palette',
        content:
          'En tant qu\'admin, la palette propose également toutes les pages d\'administration (membres, médiathèque, saisons, calendrier, etc.) dans le groupe "Administration". Pratique pour naviguer rapidement sans passer par le menu.',
      },
    ],
  },
  {
    id: 'mentions',
    icon: '⚖️',
    title: 'Mentions légales',
    description: "Mettre à jour les informations légales de l'association.",
    steps: [
      {
        title: 'Modifier les informations légales',
        content:
          "Administration → Mentions légales. Modifiez le nom de l'association, le siège social, le numéro RNA, le nom du président, l'email de contact et l'hébergeur. Ces informations sont utilisées sur les pages Mentions légales, CGU et Politique de confidentialité.",
      },
    ],
  },
];
