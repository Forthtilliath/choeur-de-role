import { FictionalNotice } from '@/components/ui/FictionalNotice';
import { Main } from '@/components/ui/Main';
import { Section } from '@/components/ui/Section';

export default function CGUPage() {
  return (
    <Main title="Conditions Générales d'Utilisation" align="left" size="sm">
      <FictionalNotice />
      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
          l&apos;utilisation du site internet du <strong>Chœur de Rôle</strong>, accessible à
          l&apos;adresse <strong>choeur-de-role.fr</strong>.
        </p>
        <p>
          L&apos;utilisation du site implique l&apos;acceptation pleine et entière des présentes
          CGU.
        </p>
      </Section>

      <Section title="2. Accès au site">
        <p>
          Le site est accessible gratuitement depuis n&apos;importe quel navigateur internet.
          Certaines sections sont réservées aux membres de l&apos;association et nécessitent une
          authentification par identifiant et mot de passe.
        </p>
        <p>
          Les accès à l&apos;espace choristes sont créés exclusivement par les administrateurs de
          l&apos;association. Tout compte est personnel et non transmissible.
        </p>
      </Section>

      <Section title="3. Obligations des utilisateurs">
        <p>Les utilisateurs s&apos;engagent à :</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>Ne pas partager leurs identifiants de connexion avec des tiers</li>
          <li>Utiliser le site conformément à sa destination</li>
          <li>
            Ne pas tenter d&apos;accéder à des sections pour lesquelles ils ne disposent pas
            d&apos;autorisation
          </li>
          <li>
            Ne pas diffuser les contenus de l&apos;espace choristes (partitions, enregistrements) à
            l&apos;extérieur de l&apos;association
          </li>
          <li>Signaler toute anomalie ou utilisation frauduleuse de leur compte</li>
        </ul>
      </Section>

      <Section title="4. Contenu de l'espace choristes">
        <p>
          Les partitions, enregistrements audio et documents mis à disposition dans l&apos;espace
          choristes sont destinés exclusivement aux membres de l&apos;association dans le cadre de
          leur pratique au sein du Chœur de Rôle.
        </p>
        <p>
          Ces contenus ne peuvent être reproduits, distribués ou utilisés à d&apos;autres fins sans
          autorisation écrite préalable des ayants droit concernés.
        </p>
      </Section>

      <Section title="5. Responsabilité">
        <p>
          Chœur de Rôle ne saurait être tenu responsable des dommages directs ou indirects
          résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
        </p>
        <p>
          L&apos;association se réserve le droit de modifier, suspendre ou interrompre l&apos;accès
          au site à tout moment, sans préavis.
        </p>
      </Section>

      <Section title="6. Modification des CGU">
        <p>
          Chœur de Rôle se réserve le droit de modifier les présentes CGU à tout moment. Les
          utilisateurs seront informés des modifications par tout moyen approprié.
          L&apos;utilisation continue du site après modification vaut acceptation des nouvelles CGU.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Pour toute question relative aux présentes CGU, vous pouvez contacter l&apos;association à
          l&apos;adresse suivante :{' '}
          <a href="mailto:contact@choeur-de-role.fr" className="text-primary hover:opacity-70">
            contact@choeur-de-role.fr
          </a>
        </p>
      </Section>

      <p className="text-xs text-foreground/40 border-t border-border pt-6">
        Dernière mise à jour : mai 2026
      </p>
    </Main>
  );
}
