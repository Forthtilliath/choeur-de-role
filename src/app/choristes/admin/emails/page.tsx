import type { Metadata } from 'next';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';
import { EmailPreviewClient } from '@/components/features/emails/EmailPreviewClient';
import {
  welcomeEmailHtml,
  passwordResetEmailHtml,
  emailChangeEmailHtml,
  candidatureNotificationEmailHtml,
  candidatureAcknowledgementEmailHtml,
} from '@/lib/emailTemplates';
import { generatePassphrase } from '@/lib/passphrase';

export const metadata: Metadata = { title: 'Prévisualisation des emails' };

const SAMPLE_URL = 'https://choeur-de-role.fr/login?token=exemple';

const PASSPHRASE = generatePassphrase(3);

export default async function EmailsPreviewPage() {
  await handlePageAccess(isAdmin);

  const tabs = [
    {
      id: 'welcome',
      label: 'Bienvenue',
      subject: 'Bienvenue au Chœur de Rôle - Activez votre compte',
      html: welcomeEmailHtml({
        firstName: 'Marie',
        passphrase: PASSPHRASE,
        confirmationUrl: SAMPLE_URL,
      }),
    },
    {
      id: 'password-reset',
      label: 'Réinit. mot de passe',
      subject: 'Votre nouveau mot de passe — Chœur de Rôle',
      html: passwordResetEmailHtml({
        firstName: 'Marie',
        passphrase: PASSPHRASE,
      }),
    },
    {
      id: 'email-change',
      label: "Changement d'email",
      subject: 'Votre adresse email a été modifiée — Chœur de Rôle',
      html: emailChangeEmailHtml({
        firstName: 'Marie',
        confirmationUrl: SAMPLE_URL,
      }),
    },
    {
      id: 'candidature-admin',
      label: 'Candidature (admin)',
      subject: '[Candidature] Marie Dupont souhaite rejoindre la chorale',
      html: candidatureNotificationEmailHtml({
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@email.fr',
        phone: '06 12 34 56 78',
        message: "Bonjour, je suis soprano et je chante depuis 10 ans. Je serais ravie de rejoindre votre chorale. Seriez-vous disponible pour une audition ?",
        adminUrl: 'https://choeur-de-role.fr/choristes/admin/messages',
      }),
    },
    {
      id: 'candidature-ack',
      label: 'Candidature (accusé)',
      subject: 'Votre candidature au Chœur de Rôle — confirmation de réception',
      html: candidatureAcknowledgementEmailHtml({ firstName: 'Marie' }),
    },
  ];

  return (
    <Main
      variant="admin"
      size="lg"
      title="Prévisualisation des emails"
      breadcrumbs={[{ label: 'Tableau de bord', href: '/choristes/admin/tableau-de-bord' }]}
      breadcrumbCurrent="Administration"
    >
      <EmailPreviewClient tabs={tabs} />
    </Main>
  );
}
