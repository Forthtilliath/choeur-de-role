import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez le Chœur de Rôle à Angers : renseignements, candidature choriste, partenariat. Nous vous répondons rapidement.',
  alternates: { canonical: 'https://www.choeur-de-role.fr/contact' },
  openGraph: { url: 'https://www.choeur-de-role.fr/contact' },
};
import { ContactForm } from '@/components/features/contact/ContactForm';
import { Main } from '@/components/ui/Main';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ContactPage() {
  return (
    <Main
      title="Nous contacter"
      subtitle="Une question, une envie de nous rejoindre ou de devenir partenaire ? Écrivez-nous, nous vous répondrons dans les plus brefs délais."
      size="xs"
    >
      <div className="text-left">
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-36" />
              <Skeleton className="h-10" />
            </div>
          }
        >
          <ContactForm />
        </Suspense>
      </div>
    </Main>
  );
}
