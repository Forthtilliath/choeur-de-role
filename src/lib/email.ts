import { Resend } from 'resend';
import { env } from '@/env';
import { escapeHtml as h } from '@/utils/stringHelpers';
import {
  welcomeEmailHtml,
  passwordResetEmailHtml,
  emailChangeEmailHtml,
  candidatureNotificationEmailHtml,
  candidatureAcknowledgementEmailHtml,
  suspiciousLoginEmailHtml,
} from './emailTemplates';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  firstName,
  passphrase,
  confirmationUrl,
}: {
  to: string;
  firstName: string;
  passphrase: string;
  confirmationUrl: string;
}) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Bienvenue au Chœur de Rôle - Activez votre compte',
    html: welcomeEmailHtml({ firstName, passphrase, confirmationUrl }),
  });
}

export async function sendEmailChangeEmail({
  to,
  firstName,
  confirmationUrl,
}: {
  to: string;
  firstName: string;
  confirmationUrl: string;
}) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Votre adresse email a été modifiée — Chœur de Rôle',
    html: emailChangeEmailHtml({ firstName, confirmationUrl }),
  });
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  passphrase,
}: {
  to: string;
  firstName: string;
  passphrase: string;
}) {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Votre nouveau mot de passe — Chœur de Rôle',
    html: passwordResetEmailHtml({ firstName, passphrase }),
  });
}

export async function sendCandidatureEmails({
  firstName,
  lastName,
  email,
  phone,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const adminUrl = `${env.NEXT_PUBLIC_SITE_URL ?? 'https://choeur-de-role.fr'}/choristes/admin/messages`;

  await Promise.all([
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: env.NEXT_MAIL_CONTACT!,
      subject: `[Candidature] ${firstName} ${lastName} souhaite rejoindre la chorale`,
      html: candidatureNotificationEmailHtml({ firstName, lastName, email, phone, message, adminUrl }),
    }),
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Votre candidature au Chœur de Rôle — confirmation de réception',
      html: candidatureAcknowledgementEmailHtml({ firstName }),
    }),
  ]);
}

export async function sendSuspiciousLoginEmail({
  adminEmails,
  memberName,
  memberEmail,
  previousCountry,
  newCountry,
  city,
  ip,
}: {
  adminEmails: string[];
  memberName: string;
  memberEmail: string;
  previousCountry: string;
  newCountry: string;
  city?: string;
  ip?: string;
}) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date());

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: adminEmails,
    subject: `[Alerte] Connexion inhabituelle — ${memberName}`,
    html: suspiciousLoginEmailHtml({ memberName, memberEmail, previousCountry, newCountry, city, ip, date }),
  });
}

export async function sendContactEmail({
  category,
  first_name,
  last_name,
  email,
  phone,
  message,
}: {
  category: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const categoryLabels: Record<string, string> = {
    rejoindre: 'Rejoindre la chorale',
    partenariat: 'Devenir partenaire',
    autre: 'Autre demande',
  };

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: env.NEXT_MAIL_CONTACT!,
    subject: `[Contact] ${categoryLabels[category]} — ${first_name} ${last_name}`,
    html: `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <h2 style="color: #1a1a1a; margin-bottom: 24px;">Nouveau message de contact</h2>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>Catégorie :</strong> ${categoryLabels[category]}</p>
    <p style="margin: 0 0 8px 0;"><strong>Nom :</strong> ${h(first_name)} ${h(last_name)}</p>
    <p style="margin: 0 0 8px 0;"><strong>Email :</strong> <a href="mailto:${h(email)}">${h(email)}</a></p>
    ${phone ? `<p style="margin: 0 0 8px 0;"><strong>Téléphone :</strong> ${h(phone)}</p>` : ''}
  </div>
  <div style="background: #f0f7f3; border-left: 3px solid #5a9e6f; border-radius: 0 12px 12px 0; padding: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 500;">Message :</p>
    <p style="margin: 0; white-space: pre-wrap;">${h(message)}</p>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px;">Message envoyé depuis le site du Chœur de Rôle</p>
</body>
</html>`,
  });
}
