import { sanitizeHtml } from '@/lib/sanitizeHtml';

type Props = {
  html: string | null | undefined;
  className?: string;
};

/** Affiche du HTML riche (contenu de l'éditeur) après nettoyage par liste blanche. */
export function SafeHtml({ html, className }: Props) {
  return (
    <div
      className={className}
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- HTML nettoyé par sanitizeHtml
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
