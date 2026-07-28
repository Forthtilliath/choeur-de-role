'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { completeAdminOnboarding } from '@/app/choristes/admin/bienvenue/actions';

type Props = {
  firstName: string;
};

const TOTAL_STEPS = 2;

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
                active
                  ? 'bg-primary border-primary text-white'
                  : done
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-background-secondary border-border text-foreground/30'
              }`}
            >
              {done ? '✓' : step}
            </div>
            {step < TOTAL_STEPS && (
              <div className={`h-px w-8 ${done ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SETUP_FLOW = [
  {
    icon: '🗓️',
    title: 'Créer une saison',
    why: `La saison structure l'année chorale. Elle permet d'associer chaque membre à une période (2024-2025, 2025-2026…) et d'organiser le répertoire par année.`,
    path: 'Administration → Saisons',
    href: '/choristes/admin/saisons',
  },
  {
    icon: '🎤',
    title: 'Configurer les pupitres',
    why: `Les pupitres définissent les voix (soprano, alto, ténor…). Ils servent à classer les membres et à les afficher correctement dans le trombinoscope.`,
    path: 'Administration → Pupitres',
    href: '/choristes/admin/pupitres',
  },
  {
    icon: '✉️',
    title: 'Inviter les choristes',
    why: `Chaque invitation envoie un email automatique avec un lien d'activation et un mot de passe généré automatiquement — trois mots séparés par des tirets. Le choriste n'a rien à créer.`,
    path: 'Administration → Membres',
    href: '/choristes/admin/membres',
  },
  {
    icon: '📅',
    title: 'Alimenter le calendrier',
    why: `Le calendrier est la première chose que les choristes consultent après leur connexion. Ajoutez les répétitions et concerts dès maintenant.`,
    path: 'Administration → Calendrier',
    href: '/choristes/admin/calendrier',
  },
  {
    icon: '🎵',
    title: 'Publier un concert',
    why: `Les concerts sont visibles par tous les visiteurs du site public — c'est votre vitrine. Ajoutez photos, dates et lieux.`,
    path: 'Administration → Concerts',
    href: '/choristes/admin/concerts',
  },
];

export function AdminOnboarding({ firstName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completing, setCompleting] = useState(false);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleComplete(destination = '/choristes/admin/tableau-de-bord') {
    setCompleting(true);
    const ok = await completeAdminOnboarding();
    if (ok) {
      router.push(destination);
    } else {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setCompleting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <StepProgress current={step} />

      {/* Step 1 — Bienvenue */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
              Accès administrateur
            </p>
            <h1 className="text-3xl font-medium text-foreground mb-3">
              Bienvenue, {firstName}&nbsp;!
            </h1>
            <p className="text-foreground/60 leading-relaxed">
              Vous disposez des droits d&apos;administration. Ce guide vous présente l&apos;ordre de mise en
              place recommandé pour démarrer efficacement.
            </p>
          </div>

          <div className="flex flex-col gap-0 rounded-2xl border border-border bg-background overflow-hidden">
            <div className="px-5 py-3 bg-background-secondary border-b border-border">
              <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
                En tant qu&apos;administrateur, vous pouvez
              </p>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {[
                { icon: '👥', text: 'Gérer les comptes membres et leurs rôles' },
                { icon: '🎵', text: 'Publier concerts, actualités et galeries photos' },
                { icon: '📅', text: 'Administrer le calendrier et les évènements' },
                { icon: '📊', text: 'Créer des sondages et analyser les réponses' },
                { icon: '🔍', text: `Consulter le journal d'activité et les messages de contact` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-5 py-3 text-sm text-foreground/70">
                  <span>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={next} size="lg">
            Voir le guide de démarrage →
          </Button>
        </div>
      )}

      {/* Step 2 — Par où commencer */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-medium text-foreground mb-2">Par où commencer ?</h2>
            <p className="text-foreground/60 text-sm">
              Voici l&apos;ordre recommandé pour configurer la plateforme. Chaque étape débloque la
              suivante — respectez cet ordre pour éviter les blocages.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {SETUP_FLOW.map(({ icon, title, why, path, href }, i) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl border border-border bg-background">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  {i < SETUP_FLOW.length - 1 && (
                    <div className="w-px flex-1 bg-border min-h-3" />
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                  </div>
                  <p className="text-xs text-foreground/50 leading-relaxed">{why}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-foreground/30 font-mono">{path}</span>
                    <button
                      type="button"
                      onClick={() => handleComplete(href)}
                      disabled={completing}
                      className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
                    >
                      Y aller →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => handleComplete()}
            loading={completing}
            size="lg"
            className="w-full"
          >
            {completing ? 'Enregistrement...' : 'Accéder au tableau de bord →'}
          </Button>
        </div>
      )}
    </div>
  );
}
