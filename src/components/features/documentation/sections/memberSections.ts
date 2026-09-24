import type { Section } from './types';

// Espace choristes : membres, répertoire, actualités, calendrier
export const MEMBER_SECTIONS: Section[] = [
  {
    id: 'membres',
    icon: '👥',
    title: 'Membres',
    description: 'Créer des comptes choristes, modifier leurs informations et gérer les rôles.',
    steps: [
      {
        title: 'Ajouter un choriste',
        content:
          'Administration → Membres → "+ Ajouter un membre". Remplissez le prénom, nom, email et pupitre. Un email est automatiquement envoyé au choriste avec son mot de passe (passphrase de 4 mots) et un lien d\'activation.',
        tip: 'Le choriste doit cliquer sur le lien dans les 24h pour activer son compte.',
      },
      {
        title: 'Renvoyer une invitation',
        content:
          'Si le choriste n\'a pas cliqué sur le lien ou si celui-ci a expiré, un bouton ✉ "Renvoyer" apparaît sur sa ligne dans le tableau. Cliquez dessus pour générer un nouveau lien et une nouvelle passphrase.',
        warning: "L'ancienne passphrase sera invalidée.",
      },
      {
        title: "Modifier l'email d'un choriste",
        content:
          'Ouvrez le formulaire de modification → dans le champ Email, cliquez "Modifier" → saisissez la nouvelle adresse → "Confirmer". Le choriste reçoit un email de confirmation à sa nouvelle adresse.',
      },
      {
        title: "Modifier le rôle d'un choriste",
        content:
          'Les rôles disponibles sont : Membre, CA, Admin. Un admin ne peut attribuer que des rôles inférieurs au sien. Le rôle Super Admin ne peut être modifié que par un autre Super Admin.',
        warning:
          "Ne retirez jamais le rôle Super Admin au dernier compte Super Admin — vous perdriez l'accès à l'administration.",
      },
      {
        title: 'Détecter les modifications récentes',
        content:
          'Les choristes qui ont modifié leur profil (dans "Mon profil") sont signalés par un badge orange dans le tableau. Un bouton "✏️ N modifs choristes" en haut permet de les voir rapidement.',
      },
    ],
  },
  {
    id: 'repertoire',
    icon: '🎼',
    title: 'Médiathèque & Répertoire',
    description: 'Gérer les chants, uploader des fichiers audio, partitions et paroles.',
    steps: [
      {
        title: 'Ajouter un chant',
        content:
          'Administration → Médiathèque → "+ Ajouter un chant". Remplissez le titre, le compositeur (optionnel), et associez-le aux représentations concernées.',
      },
      {
        title: 'Ajouter un fichier à un chant',
        content:
          'Ouvrez le chant (▼) → cliquez "+ Ajouter un fichier". Choisissez le type (Audio / Partition / Paroles), sélectionnez les pupitres concernés (laisser vide = visible par tous) et uploadez le fichier.',
        tip: "L'ordre d'affichage est automatique : Audio → Paroles → Partitions, puis trié par pupitre.",
      },
      {
        title: 'Restreindre un fichier à certains pupitres',
        content:
          "Lors de l'ajout ou modification d'un fichier, sélectionnez les pupitres dans la liste. Un fichier sans pupitre sélectionné est visible par tous les choristes.",
      },
      {
        title: 'Les fichiers sont privés',
        content:
          'Les fichiers du répertoire sont stockés dans un espace sécurisé. Les choristes y accèdent via des liens temporaires (valables 60 secondes). Ils ne peuvent pas être téléchargés directement par URL.',
      },
      {
        title: 'Notes affichées dans le répertoire',
        content:
          'Si une représentation a des "Notes choristes" renseignées (depuis Administration → Programmation → modifier la représentation), elles s\'affichent automatiquement dans le répertoire quand le choriste sélectionne cette représentation dans le filtre.\n\nUtilisez ce champ pour partager des liens Drive, un planning de répétitions ou toute information spécifique au concert.',
      },
      {
        title: 'Partager un lien direct vers un chant',
        content:
          "Chaque chant a une URL directe : /choristes/repertoire/{id}. Ce lien ouvre le répertoire avec l'accordéon du chant déplié et un scroll automatique jusqu'à lui. Les choristes peuvent aussi trouver n'importe quel chant via la palette de recherche (⌘K).",
        tip: 'Utile pour signaler un chant spécifique à un choriste par message.',
      },
    ],
  },
  {
    id: 'actualites',
    icon: '📢',
    title: 'Actualités',
    description: "Publier des annonces, épingler des messages importants et modifier l'intro.",
    steps: [
      {
        title: 'Créer une actualité',
        content:
          'Administration → Actualités → "+ Ajouter une actualité". Rédigez le titre et le contenu dans l\'éditeur. L\'actualité est en brouillon par défaut.',
      },
      {
        title: 'Publier et épingler',
        content:
          'Cliquez "Publier" pour rendre l\'actualité visible. Cliquez "Épingler" pour la faire apparaître en tête de liste avec un badge 📌. Les actualités épinglées apparaissent toujours en premier.',
      },
      {
        title: "Modifier le texte d'introduction",
        content:
          'Sur la page Actualités (espace choristes), survolez le bloc d\'introduction → cliquez "✏️ Modifier". Ce texte est visible par tous les choristes connectés.',
      },
      {
        title: 'Partager un lien direct vers un article',
        content:
          "Chaque article a un lien d'ancre stable : /choristes#news-{id}. Ce lien ouvre la page Actualités et scrolle directement jusqu'à l'article. Les choristes peuvent aussi retrouver n'importe quel article via la palette de recherche (⌘K).",
        tip: "Le lien est stable même si d'autres articles sont ajoutés — il ne change pas.",
      },
    ],
  },
  {
    id: 'calendrier',
    icon: '📅',
    title: 'Calendrier',
    description: "Ajouter des évènements, gérer les récurrences et les types d'évènements.",
    steps: [
      {
        title: 'Ajouter un évènement',
        content:
          'Sur le calendrier, survolez un jour → cliquez "+". Remplissez le titre, le type, les horaires et le lieu. Cliquez "Ajouter".',
        tip: 'Vous pouvez aussi cliquer sur un évènement existant pour le modifier.',
      },
      {
        title: 'Créer des évènements récurrents',
        content:
          'Dans le formulaire, activez le switch "Répétition récurrente". Choisissez le jour de la semaine, les horaires, la période (du... au...) et les dates à exclure si besoin.',
        tip: 'Pratique pour les répétitions hebdomadaires — créez toute une saison en quelques clics.',
      },
      {
        title: "Gérer les types d'évènements",
        content:
          "Administration → Calendrier → Types d'évènements. Vous pouvez créer, modifier et supprimer les types (Répétition, Concert, Anniversaire...). Chaque type a un label, une couleur, une description optionnelle et une option \"Spécial\" pour le mettre en avant.\n\nGlissez-déposez les lignes avec la poignée ⠿ pour changer l'ordre d'affichage.",
        tip: 'La couleur du type "Anniversaire" est utilisée pour tous les anniversaires générés automatiquement — changer la couleur ici met à jour tout le calendrier.',
      },
      {
        title: 'Fermer le formulaire sans perdre ses données',
        content:
          'Si vous cliquez en dehors du formulaire après avoir saisi des informations, une confirmation vous sera demandée avant de fermer.',
      },
      {
        title: 'Partager un lien direct vers un évènement',
        content:
          "Chaque évènement a une URL directe : /choristes/calendrier/{id}. Ce lien ouvre le calendrier positionné sur le mois de l'évènement et affiche sa fiche automatiquement. Les choristes peuvent aussi trouver n'importe quel évènement via la palette de recherche (⌘K).",
        tip: "Pratique pour partager les détails d'une répétition ou d'un concert par message.",
      },
    ],
  },
];
