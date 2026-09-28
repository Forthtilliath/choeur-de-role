import type { Metadata } from 'next';
import NextImage from 'next/image';

export const metadata: Metadata = {
  title: 'Nos partenaires',
  description:
    'Les partenaires et sponsors qui soutiennent le Chœur de Rôle dans son aventure chorale à Angers. Rejoignez-nous.',
  alternates: { canonical: 'https://www.choeur-de-role.fr/partenaires' },
  openGraph: { url: 'https://www.choeur-de-role.fr/partenaires' },
};
import Link from 'next/link';

import { getPartners } from '@/components/features/partenaires/queries';
import { SponsorDossierButton } from '@/components/features/partenaires/SponsorDossierButton';
import type { Partner } from '@/components/features/partenaires/types';
import { Button } from '@/components/ui/Button';
import { Main } from '@/components/ui/Main';
import { StaffDivider } from '@/components/ui/StaffDivider';
import { getUserQuery } from '@/lib/auth';
import { getContentBlocks } from '@/lib/content';

export default async function PartenairesPage() {
  const { isAdmin: canEdit } = await getUserQuery();
  const partners = await getPartners();
  const blocks = await getContentBlocks('partners');
  const dossierUrl = blocks.sponsor_dossier_url ?? '';

  const currentLarge = partners.filter((p) => p.size === 'current_large');
  const currentSquare = partners.filter((p) => p.size === 'current_square');

  return (
    <Main
      title="Nos partenaires"
      subtitle="Ils nous font confiance et nous soutiennent dans notre aventure chorale."
      actions={
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Button href="/contact?sujet=partenariat" variant="outline">
            Devenir partenaire
          </Button>
          {dossierUrl && (
            <Button href={dossierUrl} target="_blank" rel="noopener noreferrer" variant="outline">
              📄 Dossier de sponsoring
            </Button>
          )}
          {canEdit && <SponsorDossierButton currentUrl={dossierUrl} />}
        </div>
      }
    >
      {partners?.length === 0 && (
        <p className="text-center text-foreground/50">Aucun partenaire pour le moment.</p>
      )}

      {currentLarge.length > 0 && (
        <div className="grid grid-cols-1 *:h-65 gap-8 mb-8">
          {currentLarge.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      {currentSquare.length > 0 && (
        <div className="grid grid-cols-1 *:h-65 sm:grid-cols-2 sm:*:h-80 md:*:h-96 gap-6 mb-8">
          {currentSquare.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

      <div className="relative mt-10 md:mt-20 rounded-3xl p-6 md:p-12 text-center bg-felt frame-gold overflow-hidden">
        <StaffDivider
          symbol="♛"
          surfaceClassName="bg-felt"
          className="mb-8 text-secondary/30"
        />
        <h2 className="text-3xl font-semibold mb-4 text-felt-foreground">
          Vous souhaitez nous soutenir ?
        </h2>
        <p className="mb-8 text-felt-foreground/75 max-w-xl mx-auto">
          Rejoignez nos partenaires et participez à l&apos;aventure du Chœur de Rôle. Contactez-nous
          pour en savoir plus sur nos offres de partenariat.
        </p>
        <Button href="/contact?sujet=partenariat" variant="secondary">
          Nous contacter
        </Button>
      </div>
    </Main>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const isGif = partner.logo_url?.toLowerCase().endsWith('.gif');

  const logo = partner.logo_url ? (
    <NextImage
      src={partner.logo_url}
      alt={partner.name}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, 50vw"
      unoptimized={isGif}
      loading="eager"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full text-foreground/30 text-sm">
      📷
    </div>
  );

  const content = (
    // Toujours blanc, même en sombre : les logos partenaires sont prévus pour un fond clair
    <div className="rounded-2xl flex items-center justify-center bg-white ring-1 ring-secondary/40 outline-1 -outline-offset-8 outline-secondary/35 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl w-full h-full mx-auto p-6">
      <div className="relative w-full h-full">{logo}</div>
    </div>
  );

  if (partner.website_url) {
    return (
      <Link
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
