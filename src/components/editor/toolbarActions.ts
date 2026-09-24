import type { Editor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  RemoveFormatting,
  SeparatorHorizontal,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline,
  Undo,
} from 'lucide-react';

export type ToolbarAction = {
  icon: LucideIcon;
  title: string;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
};

export const FORMAT_ACTIONS: ToolbarAction[] = [
  {
    icon: Bold,
    title: 'Gras (Ctrl+B)',
    run: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive('bold'),
  },
  {
    icon: Italic,
    title: 'Italique (Ctrl+I)',
    run: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive('italic'),
  },
  {
    icon: Underline,
    title: 'Souligné (Ctrl+U)',
    run: (e) => e.chain().focus().toggleUnderline().run(),
    isActive: (e) => e.isActive('underline'),
  },
  {
    icon: Strikethrough,
    title: 'Barré',
    run: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive('strike'),
  },
];

export const HEADING_ACTIONS: ToolbarAction[] = ([1, 2, 3] as const).map((level) => ({
  icon: [Heading1, Heading2, Heading3][level - 1]!,
  title: `Titre ${level}`,
  run: (e) => e.chain().focus().toggleHeading({ level }).run(),
  isActive: (e) => e.isActive('heading', { level }),
}));

const ALIGNMENTS = [
  { align: 'left', icon: TextAlignStart, title: 'Aligner à gauche' },
  { align: 'center', icon: TextAlignCenter, title: 'Centrer' },
  { align: 'right', icon: TextAlignEnd, title: 'Aligner à droite' },
  { align: 'justify', icon: TextAlignJustify, title: 'Justifier' },
] as const;

export const ALIGN_ACTIONS: ToolbarAction[] = ALIGNMENTS.map(({ align, icon, title }) => ({
  icon,
  title,
  run: (e) => e.chain().focus().setTextAlign(align).run(),
  isActive: (e) => e.isActive({ textAlign: align }),
}));

export const LIST_ACTIONS: ToolbarAction[] = [
  {
    icon: List,
    title: 'Liste à puces',
    run: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive('bulletList'),
  },
  {
    icon: ListOrdered,
    title: 'Liste numérotée',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive('orderedList'),
  },
  {
    icon: Quote,
    title: 'Citation',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive('blockquote'),
  },
];

export const MISC_ACTIONS: ToolbarAction[] = [
  {
    icon: RemoveFormatting,
    title: 'Effacer la mise en forme',
    run: (e) => e.chain().focus().clearNodes().unsetAllMarks().run(),
  },
  {
    icon: SeparatorHorizontal,
    title: 'Séparateur horizontal',
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  { icon: Undo, title: 'Annuler (Ctrl+Z)', run: (e) => e.chain().focus().undo().run() },
  { icon: Redo, title: 'Rétablir (Ctrl+Y)', run: (e) => e.chain().focus().redo().run() },
];
