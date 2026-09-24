import { Extension } from '@tiptap/react';

// Ajoute les attributs text-shadow et class aux marques textStyle
export const TextShadow = Extension.create({
  name: 'textShadow',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          textShadow: {
            default: null,
            parseHTML: (element) => element.style.textShadow || null,
            renderHTML: (attributes) => {
              if (!attributes.textShadow) return {};
              return { style: `text-shadow: ${attributes.textShadow}` };
            },
          },

          class: {
            default: null,
            parseHTML: (element) => element.className || null,
            renderHTML: (attributes) => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },
});
