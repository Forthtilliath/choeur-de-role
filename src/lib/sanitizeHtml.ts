import { escapeAttrValue, FilterXSS } from 'xss';

// Liste blanche calquée sur ce que produit l'éditeur Tiptap (StarterKit, Link,
// Image, TextStyle/Color, TextAlign, TextShadow, badges de pupitre).
const BLOCK = ['class', 'style'];

const filter = new FilterXSS({
  whiteList: {
    p: BLOCK,
    h1: BLOCK,
    h2: BLOCK,
    h3: BLOCK,
    h4: BLOCK,
    h5: BLOCK,
    h6: BLOCK,
    br: [],
    hr: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
    s: [],
    code: [],
    pre: [],
    blockquote: [],
    ul: [],
    ol: ['start'],
    li: [],
    a: ['href', 'target', 'rel', 'title', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style', 'class'],
    span: BLOCK,
  },
  css: {
    whiteList: { color: true, 'text-align': true, 'text-shadow': true },
  },
  // Attributs data-* des badges de pupitre (data-badge, data-variant, data-text)
  onIgnoreTagAttr: (tag, name, value) => {
    if (tag === 'span' && name.startsWith('data-')) {
      return `${name}="${escapeAttrValue(value)}"`;
    }
    return undefined;
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

/**
 * Nettoie du HTML riche (contenu saisi dans l'éditeur) avant injection dans la page :
 * balises, attributs et propriétés CSS hors liste blanche supprimés, URLs
 * `javascript:` neutralisées.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  return html ? filter.process(html) : '';
}
