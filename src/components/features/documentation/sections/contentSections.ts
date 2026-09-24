import type { Section } from './types';

// Contenu public : accueil, concerts, évènements externes, galerie
export const CONTENT_SECTIONS: Section[] = [
  {
    id: 'homepage',
    icon: '🏠',
    title: "Page d'accueil",
    description:
      'Modifier le hero, les blocs de contenu et basculer entre vue admin et vue choriste.',
    steps: [
      {
        title: 'Changer la photo de fond',
        content:
          'Sur la page d\'accueil en mode admin, cliquez sur le bouton "📷 Changer la photo" en haut à droite du hero. Sélectionnez une image depuis votre ordinateur. La photo est remplacée immédiatement.',
        tip: 'Préférez une photo horizontale de haute qualité (minimum 1920px de large).',
      },
      {
        title: 'Modifier le titre ou le sous-titre',
        content:
          'Survolez le texte du hero → un bouton "✏️ Modifier" apparaît. Cliquez dessus pour ouvrir l\'éditeur. Modifiez le contenu, puis cliquez "Sauvegarder".',
      },
      {
        title: 'Gérer les blocs de contenu',
        content:
          'Chaque bloc de la page d\'accueil peut être réordonné (↑↓), masqué (sans supprimer) ou supprimé. Pour ajouter un bloc, descendez en bas de page et cliquez "+ Ajouter un bloc".',
        tip: 'Le bloc "Nous rejoindre" est fixe — il apparaît toujours en dernier.',
      },
      {
        title: 'Prévisualiser comme un visiteur',
        content:
          'Sur la page d\'accueil, un bouton "👁 Voir comme un visiteur" est disponible en bas à droite. Cliquez dessus pour voir la page telle qu\'un visiteur la verrait (non connecté). Recliquez pour repasser en mode admin.',
        tip: 'Utile pour vérifier le rendu avant de publier un nouveau bloc.',
      },
    ],
  },
  {
    id: 'concerts',
    icon: '🎵',
    title: 'Concerts & Programmation',
    description: 'Gérer les saisons, ajouter des concerts, modifier les dates et les affiches.',
    steps: [
      {
        title: 'Créer une nouvelle saison',
        content:
          'Allez dans Administration → Programmation. Cliquez "+ Nouvelle saison", saisissez le nom (ex: 2026-2027) et validez. La saison est inactive par défaut.',
        tip: 'Une seule saison peut être active à la fois. La saison active est mise en avant sur le site.',
      },
      {
        title: 'Activer, renommer ou supprimer une saison',
        content:
          'Dans l\'en-tête de chaque saison, trois boutons sont disponibles : ✏️ pour renommer, "Activer" pour en faire la saison courante, 🗑 pour supprimer. Si vous supprimez une saison qui contient des concerts, ceux-ci seront déplacés dans un groupe "Sans saison" pour être réaffectés.',
        warning:
          "La suppression d'une saison est irréversible. Les concerts ne sont pas supprimés mais devront être réaffectés.",
      },
      {
        title: 'Ajouter un concert',
        content:
          'Ouvrez la saison souhaitée → cliquez "+ Ajouter une représentation". Remplissez le titre, le lieu, les dates, ajoutez une affiche (format portrait recommandé) et un lien de billetterie si besoin.',
        tip: 'Le slug (URL du concert) est généré automatiquement depuis le titre.',
      },
      {
        title: 'Ajouter des notes choristes',
        content:
          "Dans le formulaire de représentation, le champ \"Notes choristes\" permet d'ajouter des informations visibles uniquement dans le répertoire choristes. Utilisez l'éditeur riche pour formater le texte, ajouter des liens Drive, un planning de répétitions, etc.\n\nCes notes s'affichent automatiquement quand un choriste sélectionne cette représentation dans le filtre du répertoire.",
        tip: 'Idéal pour partager un lien Google Drive ou la liste des répétitions prévues pour un concert.',
      },
      {
        title: 'Modifier un concert depuis la page publique',
        content:
          'Sur la page d\'un concert (ex: /concerts/nom-du-concert), un bouton "⚙️ Modifier ce concert" est visible pour les admins. Il redirige directement vers le formulaire de modification.',
      },
    ],
  },
  {
    id: 'evenements',
    icon: '🎭',
    title: 'Évènements externes',
    description: "Concerts d'autres chorales, expositions, évènements de choristes.",
    steps: [
      {
        title: 'Ajouter un évènement',
        content:
          'Administration → Évènements → "+ Ajouter un évènement". Remplissez le titre, les dates, le lieu et la description. L\'affiche est optionnelle.',
        tip: "Les fichiers joints (programmes, flyers PDF) ne peuvent être ajoutés qu'après la création initiale — modifiez l'évènement pour les ajouter.",
      },
      {
        title: 'Dates multiples',
        content:
          'Chaque évènement peut avoir plusieurs dates. Cliquez "+ Ajouter une date" pour en ajouter. Chaque date peut être supprimée individuellement.',
      },
      {
        title: 'Description enrichie',
        content:
          "La description utilise l'éditeur de texte riche. Vous pouvez mettre en gras, créer des listes, ajouter des titres, etc. Elle s'affiche sur la page détail de l'évènement.",
      },
      {
        title: 'Fichiers joints',
        content:
          'Après création, ouvrez le formulaire de modification pour ajouter des fichiers (PDF, images...). Chaque fichier a un label affiché sur la page publique comme lien de téléchargement.',
      },
      {
        title: 'Modifier depuis la page publique',
        content:
          'Sur la page d\'un évènement (/evenements/{id}), un bouton "⚙️ Modifier cet évènement" est visible pour les admins. Il ouvre directement le formulaire de modification pré-rempli.',
      },
      {
        title: 'Publier un évènement',
        content:
          'Les évènements sont en brouillon par défaut. Cliquez "Publier" pour les rendre visibles sur la page publique /evenements.',
      },
    ],
  },
  {
    id: 'galerie',
    icon: '📷',
    title: 'Galerie',
    description: 'Créer des albums photos, ajouter des vidéos YouTube et les lier à des concerts.',
    steps: [
      {
        title: 'Créer un album',
        content:
          'Administration → Galerie → "+ Nouvel album". Saisissez le titre et cliquez "Créer". L\'album est en brouillon par défaut — il ne sera visible qu\'après publication.',
      },
      {
        title: 'Ajouter des photos',
        content:
          'Ouvrez l\'album (bouton ▼) → cliquez "📷 Choisir des photos". Vous pouvez sélectionner plusieurs photos en même temps. Après upload, les photos apparaissent dans la grille.',
        tip: "Cliquez sur la légende sous une photo pour la modifier. Les flèches ← → permettent de réorganiser l'ordre.",
      },
      {
        title: 'Réorganiser les photos',
        content:
          "Deux façons de changer l'ordre des photos dans un album :\n— Glissez la photo avec la poignée ⠿ (visible au survol) vers sa nouvelle position\n— Utilisez les flèches ← → pour déplacer photo par photo",
        tip: 'Le drag & drop est plus rapide pour de grands réorganisements.',
      },
      {
        title: 'Ajouter des vidéos YouTube',
        content:
          "Dans les paramètres de l'album, collez l'URL d'une playlist YouTube (format : youtube.com/playlist?list=PL...) puis cliquez \"🔄 Sync\". Toutes les vidéos de la playlist sont importées automatiquement.",
        tip: 'Pour les vidéos non répertoriées (privées mais accessibles par lien), la synchronisation fonctionne de la même façon.',
        warning: "Une nouvelle synchronisation remplace toutes les vidéos précédentes de l'album.",
      },
      {
        title: 'Lier un album à un concert',
        content:
          "Dans les paramètres de l'album, sélectionnez le concert associé dans le menu déroulant. L'album apparaîtra automatiquement sur la page du concert.",
      },
      {
        title: 'Publier ou masquer un album',
        content:
          'Cliquez sur "Masquer" ou "Publier" dans l\'en-tête de l\'album. Un album masqué n\'est pas visible par les visiteurs mais reste accessible dans l\'administration.',
      },
    ],
  },
];
