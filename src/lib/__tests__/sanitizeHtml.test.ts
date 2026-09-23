import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from '../sanitizeHtml';

describe('sanitizeHtml', () => {
  it("conserve le HTML produit par l'éditeur", () => {
    const html =
      '<h2 style="text-align: center">Titre</h2>' +
      '<p><strong>gras</strong> <em>it</em> <a href="https://exemple.fr" target="_blank" rel="noopener">lien</a></p>' +
      '<ul><li>un</li></ul><img src="https://cdn.exemple.fr/a.webp" alt="photo">' +
      '<span style="color: #DC2626; text-shadow: 1px 1px 2px black">couleur</span>' +
      '<span data-badge="" data-variant="alto" data-text="A">A</span>';
    const out = sanitizeHtml(html);

    expect(out).toContain('<h2 style="text-align:center;">Titre</h2>');
    expect(out).toContain('<a href="https://exemple.fr" target="_blank" rel="noopener">lien</a>');
    expect(out).toContain('<img src="https://cdn.exemple.fr/a.webp" alt="photo">');
    expect(out).toContain('color:#DC2626;');
    expect(out).toContain('text-shadow:1px 1px 2px black;');
    expect(out).toContain('data-badge="" data-variant="alto" data-text="A"');
  });

  it('supprime les scripts et leur contenu', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });

  it('supprime les gestionnaires d’événements', () => {
    expect(sanitizeHtml('<img src="https://cdn.exemple.fr/x.png" onerror="alert(1)">')).toBe(
      '<img src="https://cdn.exemple.fr/x.png">',
    );
  });

  it('conserve les liens mailto, tel et relatifs', () => {
    const out = sanitizeHtml(
      '<a href="mailto:contact@exemple.fr">m</a><a href="tel:+33600000000">t</a><a href="/concerts">c</a>',
    );
    expect(out).toContain('href="mailto:contact@exemple.fr"');
    expect(out).toContain('href="tel:+33600000000"');
    expect(out).toContain('href="/concerts"');
  });

  it('neutralise les URLs javascript:', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript');
  });

  it('retire les propriétés CSS hors liste blanche', () => {
    const out = sanitizeHtml('<p style="position: fixed; color: red">x</p>');
    expect(out).not.toContain('position');
    expect(out).toContain('color:red;');
  });

  it('supprime les balises inconnues en gardant leur texte', () => {
    expect(sanitizeHtml('<iframe src="https://evil"></iframe><div>texte</div>')).toBe('texte');
  });

  it('renvoie une chaîne vide pour null/undefined', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
