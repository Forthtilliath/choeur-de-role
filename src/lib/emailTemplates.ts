import { env } from '@/env';
import { escapeHtml as h } from '@/utils/stringHelpers';

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export function welcomeEmailHtml({
  firstName,
  passphrase,
  confirmationUrl,
}: {
  firstName: string;
  passphrase: string;
  confirmationUrl: string;
}) {
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Le Chœur de Rôle</h1>
    <p style="color: #666; margin-top: 8px;">Bienvenue dans l'espace choristes !</p>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0;">Bonjour ${firstName},</p>
    <p style="margin: 0 0 16px 0;">Un compte a été créé pour vous sur le site du Chœur de Rôle. Cet espace vous permettra d'accéder aux ressources réservées aux choristes : répertoire, partitions, calendrier des répétitions et bien plus.</p>
  </div>
  <div style="background: #f0f7f3; border: 1px solid #5a9e6f; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 500;">Votre mot de passe :</p>
    <p style="font-family: monospace; font-size: 20px; font-weight: 600; color: #5a9e6f; letter-spacing: 1px; margin: 0; padding: 12px; background: white; border-radius: 8px; text-align: center;">${passphrase}</p>
    <p style="color: #666; font-size: 13px; margin: 12px 0 0 0;">Conservez ce mot de passe précieusement. Il ne vous sera plus communiqué.</p>
  </div>
  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${confirmationUrl}" style="display: inline-block; background-color: #5a9e6f; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">Activer mon compte</a>
    <p style="color: #999; font-size: 12px; margin-top: 12px;">Ce lien est valable 24 heures.</p>
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 24px;">
    <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">Une fois votre compte activé, connectez-vous sur :</p>
    <a href="${siteUrl}/login" style="color: #5a9e6f; font-size: 13px;">${siteUrl}/login</a>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">Si vous n'attendiez pas cet email, ignorez-le simplement.</p>
</body>
</html>`;
}

export function passwordResetEmailHtml({
  firstName,
  passphrase,
}: {
  firstName: string;
  passphrase: string;
}) {
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Le Chœur de Rôle</h1>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0;">Bonjour ${firstName},</p>
    <p style="margin: 0;">Votre mot de passe a été réinitialisé par un administrateur.</p>
  </div>
  <div style="background: #f0f7f3; border: 1px solid #5a9e6f; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-weight: 500;">Votre nouveau mot de passe :</p>
    <p style="font-family: monospace; font-size: 20px; font-weight: 600; color: #5a9e6f; letter-spacing: 1px; margin: 0; padding: 12px; background: white; border-radius: 8px; text-align: center;">${passphrase}</p>
    <p style="color: #666; font-size: 13px; margin: 12px 0 0 0;">Conservez ce mot de passe précieusement.</p>
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 24px;">
    <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">Connectez-vous sur :</p>
    <a href="${siteUrl}/login" style="color: #5a9e6f; font-size: 13px;">${siteUrl}/login</a>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">Si vous n'attendiez pas cet email, contactez un administrateur.</p>
</body>
</html>`;
}

export function candidatureNotificationEmailHtml({
  firstName,
  lastName,
  email,
  phone,
  message,
  adminUrl,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  adminUrl: string;
}) {
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="background: #f0f7f3; border-left: 4px solid #5a9e6f; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 13px; color: #5a9e6f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">🎵 Nouvelle candidature</p>
    <h2 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">Chœur de Rôle</h2>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0; font-weight: 500; font-size: 15px;">${h(firstName)} ${h(lastName)} souhaite rejoindre la chorale.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #666; width: 120px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${h(email)}" style="color: #5a9e6f;">${h(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding: 6px 0; color: #666;">Téléphone</td><td style="padding: 6px 0;">${h(phone)}</td></tr>` : ''}
    </table>
  </div>
  <div style="background: white; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #666; font-weight: 500;">Message :</p>
    <p style="margin: 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${h(message)}</p>
  </div>
  <div style="text-align: center; margin-bottom: 24px;">
    <a href="${adminUrl}" style="display: inline-block; background-color: #5a9e6f; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 500;">Voir dans l'espace admin</a>
  </div>
  <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">Message reçu via le formulaire de contact du site du Chœur de Rôle</p>
</body>
</html>`;
}

export function candidatureAcknowledgementEmailHtml({
  firstName,
}: {
  firstName: string;
}) {
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-size: 40px; margin: 0 0 12px 0;">🎵</p>
    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Le Chœur de Rôle</h1>
    <p style="color: #666; margin-top: 8px;">Candidature reçue</p>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0;">Bonjour ${firstName},</p>
    <p style="margin: 0 0 12px 0;">Merci pour votre intérêt pour le Chœur de Rôle ! Nous avons bien reçu votre candidature et nous vous recontacterons dans les prochains jours.</p>
    <p style="margin: 0; color: #666; font-size: 14px;">En attendant, n'hésitez pas à consulter notre site pour en savoir plus sur nos concerts et activités.</p>
  </div>
  <div style="border-top: 1px solid #eee; padding-top: 24px; text-align: center;">
    <a href="${siteUrl}" style="color: #5a9e6f; font-size: 13px;">${siteUrl}</a>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">Cet email est un accusé de réception automatique.</p>
</body>
</html>`;
}

export function emailChangeEmailHtml({
  firstName,
  confirmationUrl,
}: {
  firstName: string;
  confirmationUrl: string;
}) {
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Le Chœur de Rôle</h1>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0;">Bonjour ${firstName},</p>
    <p style="margin: 0;">Votre adresse email a été modifiée par un administrateur. Votre mot de passe reste inchangé.</p>
  </div>
  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${confirmationUrl}" style="display: inline-block; background-color: #5a9e6f; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">Confirmer ma nouvelle adresse</a>
    <p style="color: #999; font-size: 12px; margin-top: 12px;">Ce lien est valable 24 heures.</p>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">Si vous n'êtes pas à l'origine de cette modification, contactez un administrateur.</p>
</body>
</html>`;
}

export function suspiciousLoginEmailHtml({
  memberName,
  memberEmail,
  previousCountry,
  newCountry,
  city,
  ip,
  date,
}: {
  memberName: string;
  memberEmail: string;
  previousCountry: string;
  newCountry: string;
  city?: string;
  ip?: string;
  date: string;
}) {
  const location = city ? `${city} (${newCountry})` : newCountry;
  return `<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 500; color: #1a1a1a; margin: 0;">Le Chœur de Rôle</h1>
    <p style="color: #e85d5d; margin-top: 8px; font-weight: 500;">Alerte de connexion inhabituelle</p>
  </div>
  <div style="background: #fff5f5; border: 1px solid #e85d5d; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0 0 16px 0;">Une connexion depuis un nouveau pays a été détectée pour le compte suivant :</p>
    <p style="margin: 0 0 8px 0;"><strong>Membre :</strong> ${h(memberName)}</p>
    <p style="margin: 0 0 8px 0;"><strong>Email :</strong> ${h(memberEmail)}</p>
    <p style="margin: 0 0 8px 0;"><strong>Pays habituel :</strong> ${h(previousCountry)}</p>
    <p style="margin: 0 0 8px 0;"><strong>Nouveau pays :</strong> ${h(location)}</p>
    ${ip ? `<p style="margin: 0 0 8px 0;"><strong>Adresse IP :</strong> <code>${h(ip)}</code></p>` : ''}
    <p style="margin: 0;"><strong>Date :</strong> ${h(date)}</p>
  </div>
  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="margin: 0;">Si cette connexion est légitime (choriste en déplacement), aucune action n'est nécessaire. Dans le cas contraire, vous pouvez désactiver ce compte depuis l'espace admin.</p>
  </div>
  <div style="text-align: center; margin-bottom: 24px;">
    <a href="${siteUrl}/choristes/admin/membres" style="display: inline-block; background-color: #e85d5d; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 500;">Gérer les membres</a>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">Alerte automatique — Chœur de Rôle</p>
</body>
</html>`;
}
