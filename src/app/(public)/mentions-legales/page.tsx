import Link from 'next/link';
import { getLegalData } from '@/components/features/mentions-legales/queries';
import { FictionalNotice } from '@/components/ui/FictionalNotice';
import { Main } from '@/components/ui/Main';
import { Section } from '@/components/ui/Section';

export default async function MentionsLegalesPage() {
  const legalData = await getLegalData();

  return (
    <Main title="Mentions légales" align="left" size="sm">
      <FictionalNotice />
      <Section title="1. Éditeur du site">
        <p>
          Le présent site est édité par l&apos;association{' '}
          <strong>{legalData.association_name}</strong>, association loi 1901 déclarée sous le
          numéro RNA <strong>{legalData.rna}</strong>.
        </p>
        <p>
          <strong>Siège social :</strong> {legalData.siege_social}
          <br />
          <strong>Représentant légal :</strong> {legalData.president_name}, Président
          <br />
          <strong>Contact :</strong>{' '}
          <Link
            href={`mailto:${legalData.contact_email}`}
            className="text-primary hover:opacity-70"
          >
            {legalData.contact_email}
          </Link>
        </p>
      </Section>

      <Section title="2. Hébergement">
        <p>
          Ce site est hébergé par <strong>{legalData.hebergeur_name}</strong>
          <br />
          {legalData.hebergeur_address}
          <br />
          <Link
            href={legalData.hebergeur_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:opacity-70"
          >
            {legalData.hebergeur_url}
          </Link>
        </p>
      </Section>

      <Section title="3. Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, images, logos, etc.) sont la
          propriété exclusive de l&apos;association {legalData.association_name} ou de leurs auteurs
          respectifs, et sont protégés par les lois françaises et internationales relatives à la
          propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification ou exploitation des contenus de ce site,
          sans autorisation écrite préalable, est strictement interdite.
        </p>
      </Section>

      <Section title="4. Données personnelles">
        <p>
          Le traitement des données personnelles collectées sur ce site est décrit dans notre{' '}
          <Link href="/politique-confidentialite" className="text-primary hover:opacity-70">
            Politique de confidentialité
          </Link>
          .
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          Ce site utilise uniquement des cookies techniques strictement nécessaires au
          fonctionnement du service d&apos;authentification. Ces cookies ne nécessitent pas de
          consentement préalable conformément à l&apos;article 82 de la loi Informatique et Libertés
          et aux recommandations de la CNIL.
        </p>
      </Section>

      <Section title="6. Responsabilité">
        <p>
          L&apos;association {legalData.association_name} s&apos;efforce d&apos;assurer
          l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Elle ne
          saurait être tenue responsable des erreurs, omissions ou résultats qui pourraient être
          obtenus par un mauvais usage de ces informations.
        </p>
      </Section>

      <Section title="7. Droit applicable">
        <p>
          Le présent site et ses mentions légales sont soumis au droit français. En cas de litige,
          les tribunaux français seront seuls compétents.
        </p>
      </Section>

      <p className="text-xs text-foreground/40 border-t border-border pt-6">
        Dernière mise à jour : mai 2026
      </p>
    </Main>
  );
}
