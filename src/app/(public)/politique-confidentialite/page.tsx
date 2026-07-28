import { FictionalNotice } from '@/components/ui/FictionalNotice';
import { Main } from '@/components/ui/Main';
import { Section } from '@/components/ui/Section';

export default function PolitiqueConfidentialitePage() {
  return (
    <Main title="Politique de confidentialité" align="left" size="sm">
      <FictionalNotice />
      <Section title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées sur ce site est :{' '}
          <strong>Association Chœur de Rôle</strong>, représentée par Thomas MERCIER, Président,
          dont le siège social est situé Maison des Associations, 49000 Angers.
        </p>
        <p>
          Contact DPO :{' '}
          <a href="mailto:contact@choeur-de-role.fr" className="text-primary hover:opacity-70">
            contact@choeur-de-role.fr
          </a>
        </p>
      </Section>

      <Section title="2. Données collectées">
        <p>Nous collectons les données suivantes :</p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-medium text-foreground mb-1">Visiteurs du site public</p>
            <ul className="list-disc list-inside flex flex-col gap-1 ml-2">
              <li>Données de formulaire de contact : nom, prénom, email, téléphone, message</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-foreground mb-1">Membres de l&apos;association</p>
            <ul className="list-disc list-inside flex flex-col gap-1 ml-2">
              <li>Données d&apos;identification : nom, prénom, email</li>
              <li>Données de contact : téléphone, adresse postale</li>
              <li>Données de profil : photo, date de naissance, pupitre</li>
              <li>Données de connexion : identifiant, mot de passe chiffré</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="3. Finalités et bases légales">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-foreground">Finalité</th>
                <th className="px-4 py-2 text-left font-medium text-foreground">Base légale</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Gestion du formulaire de contact', 'Intérêt légitime'],
                ['Gestion des comptes membres', 'Exécution du contrat associatif'],
                ['Accès aux ressources choristes', 'Exécution du contrat associatif'],
                ["Envoi d'emails de bienvenue", 'Exécution du contrat associatif'],
                [
                  'Affichage du trombinoscope interne',
                  'Intérêt légitime — accès restreint aux membres',
                ],
              ].map(([finalite, base], i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2">{finalite}</td>
                  <td className="px-4 py-2 text-foreground/60">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Destinataires des données">
        <p>Les données collectées sont destinées exclusivement à :</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>L&apos;équipe administrative du Chœur de Rôle</li>
          <li>
            <strong>Supabase</strong> (base de données et authentification) —{' '}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:opacity-70"
            >
              Politique de confidentialité
            </a>
          </li>
          <li>
            <strong>Vercel</strong> (hébergement) —{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:opacity-70"
            >
              Politique de confidentialité
            </a>
          </li>
          <li>
            <strong>Resend</strong> (envoi d&apos;emails) —{' '}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:opacity-70"
            >
              Politique de confidentialité
            </a>
          </li>
        </ul>
        <p>Aucune donnée n&apos;est vendue ou transmise à des tiers à des fins commerciales.</p>
      </Section>

      <Section title="5. Durée de conservation">
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>Données de contact (formulaire) : 3 ans à compter du dernier contact</li>
          <li>Données membres actifs : pendant toute la durée de l&apos;adhésion</li>
          <li>Données membres après départ : 5 ans (obligations légales associatives)</li>
        </ul>
      </Section>

      <Section title="6. Cookies">
        <p>
          Ce site utilise uniquement des cookies techniques strictement nécessaires au
          fonctionnement du service d&apos;authentification (maintien de la session). Ces cookies
          sont exemptés de consentement conformément aux recommandations de la CNIL.
        </p>
        <p>Aucun cookie publicitaire ou de traçage n&apos;est utilisé sur ce site.</p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
          Informatique et Libertés, vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>
            <strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles
          </li>
          <li>
            <strong>Droit de rectification</strong> : corriger des données inexactes
          </li>
          <li>
            <strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré
          </li>
          <li>
            <strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements
          </li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@choeur-de-role.fr" className="text-primary hover:opacity-70">
            contact@choeur-de-role.fr
          </a>
          . Nous nous engageons à répondre dans un délai d&apos;un mois.
        </p>
        <p>
          En cas de réclamation, vous pouvez également contacter la{' '}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:opacity-70"
          >
            CNIL
          </a>
          .
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
          protéger vos données contre tout accès non autorisé, perte ou divulgation. Les mots de
          passe sont chiffrés et jamais stockés en clair. Les accès à l&apos;espace membres sont
          protégés par authentification.
        </p>
      </Section>

      <p className="text-xs text-foreground/40 border-t border-border pt-6">
        Dernière mise à jour : mai 2026
      </p>
    </Main>
  );
}
