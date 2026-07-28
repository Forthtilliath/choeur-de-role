import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { Badge } from '@/components/shared/Badge';
import type { BadgeVariant } from '@/components/shared/Badge';

type BadgeAttrs = {
  variant: BadgeVariant;
  text: string;
};

const BadgeComponent = ({ node }: ReactNodeViewProps) => {
  const { variant, text } = node.attrs as BadgeAttrs;
  return (
    <NodeViewWrapper as="span">
      <Badge variant={variant} text={text} />
    </NodeViewWrapper>
  );
};

export const BadgeNode = Node.create({
  name: 'badgeComponent',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      variant: {
        default: 'soprano',
        parseHTML: (element) => element.getAttribute('data-variant'),
        renderHTML: ({ variant }) => ({ 'data-variant': variant }),
      },
      text: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-text') ?? element.textContent,
        renderHTML: ({ text }) => ({ 'data-text': text }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-badge]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-badge': '' }),
      HTMLAttributes['data-text'] ?? '',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BadgeComponent);
  },
});
