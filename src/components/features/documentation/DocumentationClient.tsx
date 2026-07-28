'use client';

import { useState } from 'react';

type Section = {
  id: string;
  icon: string;
  title: string;
  description: string;
  steps: Step[];
};

type Step = {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
};

const SECTIONS: Section[] = [
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
          'Dans le formulaire de représentation, le champ "Notes choristes" permet d\'ajouter des informations visibles uniquement dans le répertoire choristes. Utilisez l\'éditeur riche pour formater le texte, ajouter des liens Drive, un planning de répétitions, etc.\n\nCes notes s\'affichent automatiquement quand un choriste sélectionne cette représentation dans le filtre du répertoire.',
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
          'Chaque chant a une URL directe : /choristes/repertoire/{id}. Ce lien ouvre le répertoire avec l\'accordéon du chant déplié et un scroll automatique jusqu\'à lui. Les choristes peuvent aussi trouver n\'importe quel chant via la palette de recherche (⌘K).',
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
          'Chaque article a un lien d\'ancre stable : /choristes#news-{id}. Ce lien ouvre la page Actualités et scrolle directement jusqu\'à l\'article. Les choristes peuvent aussi retrouver n\'importe quel article via la palette de recherche (⌘K).',
        tip: 'Le lien est stable même si d\'autres articles sont ajoutés — il ne change pas.',
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
          'Administration → Calendrier → Types d\'évènements. Vous pouvez créer, modifier et supprimer les types (Répétition, Concert, Anniversaire...). Chaque type a un label, une couleur, une description optionnelle et une option "Spécial" pour le mettre en avant.\n\nGlissez-déposez les lignes avec la poignée ⠿ pour changer l\'ordre d\'affichage.',
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
          'Chaque évènement a une URL directe : /choristes/calendrier/{id}. Ce lien ouvre le calendrier positionné sur le mois de l\'évènement et affiche sa fiche automatiquement. Les choristes peuvent aussi trouver n\'importe quel évènement via la palette de recherche (⌘K).',
        tip: 'Pratique pour partager les détails d\'une répétition ou d\'un concert par message.',
      },
    ],
  },
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
    description: 'Naviguer rapidement vers n\'importe quelle page, chant, choriste ou évènement.',
    steps: [
      {
        title: 'Ouvrir la palette',
        content:
          'Appuyez sur ⌘K (Mac) ou Ctrl+K (Windows/Linux) depuis n\'importe quelle page. Vous pouvez aussi cliquer sur l\'icône loupe dans la barre de navigation.',
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

export function DocumentationClient() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = SECTIONS.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.steps.some(
        (step) => step.title.toLowerCase().includes(q) || step.content.toLowerCase().includes(q),
      )
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Recherche */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher dans la documentation..."
        className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background w-full"
      />

      {filtered.length === 0 && (
        <p className="text-center text-foreground/50 py-8">
          Aucun résultat pour &quot;{search}&quot;
        </p>
      )}

      {filtered.map((section) => (
        <div key={section.id} className="border border-border rounded-2xl overflow-hidden">
          {/* Header section */}
          <button
            onClick={() => setOpenId(openId === section.id ? null : section.id)}
            className="w-full flex items-center gap-4 px-6 py-4 bg-background-secondary hover:bg-background-tertiary transition-colors text-left"
          >
            <span className="text-2xl shrink-0">{section.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{section.title}</p>
              <p className="text-xs text-foreground/50 mt-0.5">{section.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-foreground/30">
                {section.steps.length} étape{section.steps.length > 1 ? 's' : ''}
              </span>
              <span className="text-foreground/40 text-sm">
                {openId === section.id ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {/* Contenu */}
          {openId === section.id && (
            <div className="divide-y divide-border">
              {section.steps.map((step, index) => (
                <div key={index} className="px-6 py-4 flex gap-4">
                  {/* Numéro */}
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
                      {step.content}
                    </p>

                    {step.tip && (
                      <div className="flex gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-xs shrink-0">💡</span>
                        <p className="text-xs text-primary/80">{step.tip}</p>
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
                        <span className="text-xs shrink-0">⚠️</span>
                        <p className="text-xs text-orange-700">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
