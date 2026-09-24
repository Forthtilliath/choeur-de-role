import { Button } from '@/components/ui/Button';

import { StepHeader } from './OnboardingLayout';

const WELCOME_ITEMS = [
  { icon: '📷', text: 'Ajouter une photo de profil' },
  { icon: '📝', text: 'Renseigner vos informations personnelles' },
  { icon: '🔒', text: 'Choisir ce que les autres choristes peuvent voir' },
];

const DISCOVER_ITEMS = [
  {
    icon: '📅',
    title: 'Regarder le prochain évènement',
    desc: `Répétitions, concerts, dates importantes — le calendrier est votre boussole dans la vie de la chorale.`,
    cta: 'Voir le calendrier',
    href: '/choristes/calendrier',
  },
  {
    icon: '🎵',
    title: 'Consulter les partitions',
    desc: `Retrouvez les pièces que la chorale travaille en ce moment, avec leur historique de concert.`,
    cta: 'Ouvrir le répertoire',
    href: '/choristes/repertoire',
  },
  {
    icon: '👥',
    title: 'Mettre des visages sur les voix',
    desc: `Le trombinoscope vous présente tous vos collègues choristes — photos, pupitres et coordonnées.`,
    cta: 'Voir le trombinoscope',
    href: '/choristes/trombinoscope',
  },
];

// Étape 1 — Bienvenue
export function WelcomeStep({
  firstName,
  onNextAction,
}: {
  firstName: string;
  onNextAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">Bienvenue</p>
        <h1 className="text-3xl font-medium text-foreground mb-3">Bonjour {firstName}&nbsp;!</h1>
        <p className="text-foreground/60 leading-relaxed">
          Votre compte a été créé. Avant de rejoindre l&apos;espace choriste, prenons quelques
          minutes pour configurer votre profil — cela n&apos;en prendra que trois.
        </p>
      </div>
      <ul className="flex flex-col gap-3 py-4">
        {WELCOME_ITEMS.map(({ icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-sm text-foreground/70">
            <span className="text-lg">{icon}</span>
            {text}
          </li>
        ))}
      </ul>
      <Button onClick={onNextAction} size="lg" className="w-full">
        Commencer
      </Button>
    </div>
  );
}

// Étape 5 — Découvrir : chaque raccourci termine l'onboarding puis redirige
export function DiscoverStep({
  completing,
  onCompleteAction,
}: {
  completing: boolean;
  onCompleteAction: (destination?: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeader eyebrow="Prêt !" title="Par où commencer ?">
        Votre profil est configuré. Voici trois choses à faire dès maintenant pour vous sentir chez
        vous.
      </StepHeader>

      <div className="flex flex-col gap-3">
        {DISCOVER_ITEMS.map(({ icon, title, desc, cta, href }) => (
          <div
            key={title}
            className="flex gap-4 p-4 rounded-2xl border border-border bg-background"
          >
            <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-foreground/50 leading-relaxed">{desc}</p>
              <button
                type="button"
                onClick={() => onCompleteAction(href)}
                disabled={completing}
                className="text-xs text-primary font-medium mt-1 hover:underline text-left disabled:opacity-50"
              >
                {cta} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onCompleteAction} loading={completing} size="lg" className="w-full">
        {completing ? 'Enregistrement...' : "C'est parti — accéder à l'espace choriste"}
      </Button>
    </div>
  );
}
