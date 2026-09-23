/**
 * Données structurées schema.org. `<` est échappé : une valeur contenant
 * `</script>` (titre, description…) ne peut pas fermer la balise.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data) as string | undefined;
  if (!json) return null;
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- JSON échappé ci-dessus
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, '\\u003c') }}
    />
  );
}
