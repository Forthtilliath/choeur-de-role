'use client';

import { useEffect, useRef, useState } from 'react';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cva } from 'class-variance-authority';
import {
  Bold,
  Check,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Palette,
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
import { cn } from '@/lib/utils';
import { Badge, BadgeVariant } from '../shared/Badge';
import { BadgeNode } from './Badge';
import { uploadEditorImage } from './uploadEditorImage';

const TextShadow = Extension.create({
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

type Props = {
  content: string;
  onChangeAction: (content: string) => void;
  placeholder?: string;
  dark?: boolean;
};

type ColorOption = {
  label: string;
  value: string;
};

// Light mode — Tailwind 600 shades, ≥ 4.5:1 contrast on white
const COLORS_LIGHT: ColorOption[] = [
  { label: 'Défaut', value: '' },
  { label: 'Rouge', value: '#DC2626' },
  { label: 'Violet', value: '#7C3AED' },
  { label: 'Bleu', value: '#2563EB' },
  { label: 'Vert', value: '#16A34A' },
];

// Dark mode — Tailwind 400 shades, readable on dark backgrounds (~#111827)
const COLORS_DARK: ColorOption[] = [
  { label: 'Défaut', value: '' },
  { label: 'Blanc', value: '#F9FAFB' },
  { label: 'Rouge', value: '#F87171' },
  { label: 'Violet', value: '#A78BFA' },
  { label: 'Bleu', value: '#60A5FA' },
  { label: 'Vert', value: '#4ADE80' },
  { label: 'Jaune', value: '#FACC15' },
];

const BADGES: { variant: BadgeVariant; label: string; short: string }[] = [
  { variant: 'alto', label: 'Alti', short: 'A' },
  { variant: 'soprano', label: 'Sopranes', short: 'S' },
  { variant: 'tenor', label: 'Ténors', short: 'T' },
  { variant: 'bass', label: 'Basses', short: 'B' },
];

export function RichEditor({ content, onChangeAction, placeholder, dark }: Props) {
  const COLORS = dark ? COLORS_DARK : COLORS_LIGHT;
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showColorPicker) return;
    function handleOutsideClick(e: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showColorPicker]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Écrivez ici...' }),
      TextStyle,
      Color,
      TextShadow,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      BadgeNode,
    ],
    content,
    onUpdate: ({ editor }) => onChangeAction(editor.getHTML()),
  });

  if (!editor) return null;

  function handleSetColor(color: ColorOption) {
    if (!editor) return;
    if (!color.value) {
      editor.chain().focus().unsetColor().unsetMark('textStyle').run();
      return;
    }
    editor.chain().focus().setColor(color.value).run();
  }

  function handleSetLink() {
    if (!editor) return;
    if (!linkUrl) return;

    const url = ['tel:', 'http://', 'mailto:'].some((p) => linkUrl.startsWith(p))
      ? linkUrl
      : `https://${linkUrl}`;

    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }

  function handleSetImage() {
    if (!editor) return;
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col max-h-150">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 flex-wrap p-1.5 border-b border-border bg-background sticky top-0 z-10 shrink-0"
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Formatage texte */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras (Ctrl+B)"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique (Ctrl+I)"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Souligné (Ctrl+U)"
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Barré"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <Separator />

        {/* Titres */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator />

        {/* Alignement */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Aligner à gauche"
        >
          <TextAlignStart className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centrer"
        >
          <TextAlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Aligner à droite"
        >
          <TextAlignEnd className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justifier"
        >
          <TextAlignJustify className="size-4" />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput((v) => !v);
              setShowImageInput(false);
              setShowColorPicker(false);
            }
          }}
          active={editor.isActive('link')}
          title="Lien"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            setShowImageInput((v) => !v);
            setShowLinkInput(false);
            setShowColorPicker(false);
          }}
          active={showImageInput}
          title="Image"
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <Separator />

        {/* Listes */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <Separator />

        {/* Couleur du texte */}
        <div className="relative" ref={colorPickerRef}>
          <ToolbarButton
            onClick={() => {
              setShowColorPicker((v) => !v);
              setShowLinkInput(false);
              setShowImageInput(false);
            }}
            active={showColorPicker}
            title="Couleur du texte"
            className="relative"
          >
            <Palette className="size-4" />
            {editor.getAttributes('textStyle').color && (
              <span
                className="absolute bottom-1 right-1 size-1.5 rounded-full ring-1 ring-background"
                style={{ backgroundColor: editor.getAttributes('textStyle').color }}
              />
            )}
          </ToolbarButton>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-xl shadow-lg py-1 z-50 min-w-40">
              {COLORS.map((color) => {
                const isActive = color.value
                  ? editor.isActive('textStyle', { color: color.value })
                  : !editor.getAttributes('textStyle').color;
                return (
                  <button
                    type="button"
                    key={color.value || 'default'}
                    onClick={() => {
                      handleSetColor(color);
                      setShowColorPicker(false);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-left transition-colors hover:bg-muted',
                      isActive ? 'text-primary font-medium' : 'text-foreground',
                    )}
                  >
                    <span
                      className="size-4 rounded-full border border-border/60 shrink-0"
                      style={{ backgroundColor: color.value || (dark ? '#F9FAFB' : '#111827') }}
                    />
                    <span className="flex-1">{color.label}</span>
                    {isActive && <Check className="size-3 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Badges pupitre */}
        <div className="flex items-center gap-0.125">
          {BADGES.map((badge) => (
            <button
              key={badge.variant}
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertContent([
                    { type: 'text', text: ' ' },
                    { type: 'badgeComponent', attrs: { variant: badge.variant, text: badge.label } },
                    { type: 'text', text: ' ' },
                  ])
                  .run();
              }}
              title={`Insérer badge ${badge.label}`}
              className="px-1.5 py-1 rounded-lg hover:bg-muted transition-colors shrink-0"
            >
              <Badge variant={badge.variant} text={badge.short} />
            </button>
          ))}
        </div>

        <Separator />

        {/* Autres */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          active={false}
          title="Effacer la mise en forme"
        >
          <RemoveFormatting className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Séparateur horizontal"
        >
          <SeparatorHorizontal className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo className="size-4" />
        </ToolbarButton>
      </div>

      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background-secondary shrink-0">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSetLink();
              if (e.key === 'Escape') setShowLinkInput(false);
            }}
            placeholder="https://..."
            className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSetLink}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground/60"
          >
            ✕
          </button>
        </div>
      )}

      {showImageInput && (
        <div className="flex flex-col gap-2 px-3 py-2 border-b border-border bg-background-secondary shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${imageMode === 'upload' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/50 hover:text-foreground'}`}
            >
              Depuis l&apos;appareil
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${imageMode === 'url' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/50 hover:text-foreground'}`}
            >
              URL externe
            </button>
            <button
              type="button"
              onClick={() => setShowImageInput(false)}
              className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-border text-foreground/60 hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {imageMode === 'upload' ? (
            <label
              className={cn(
                'flex items-center justify-center text-xs px-3 py-3 rounded-lg border border-dashed border-border text-foreground/60 cursor-pointer hover:border-primary/50 hover:text-primary transition-colors',
                imageUploading && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
            >
              {imageUploading ? 'Envoi en cours...' : 'Cliquer pour choisir une image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !editor) return;
                  setImageUploading(true);
                  const url = await uploadEditorImage(file);
                  setImageUploading(false);
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                    setShowImageInput(false);
                  }
                }}
              />
            </label>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSetImage();
                  if (e.key === 'Escape') setShowImageInput(false);
                }}
                placeholder="https://..."
                className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSetImage}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white"
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div
        className="overflow-y-auto flex-1"
        style={{ caretColor: editor.getAttributes('textStyle').color || undefined }}
      >
        <EditorContent
          editor={editor}
          className={`mdx-content p-4 min-h-48 ${dark ? 'bg-gray-900 text-white' : 'bg-background text-foreground'}`}
        />
      </div>
    </div>
  );
}

const toolbarButtonVariants = cva(
  'size-8 flex items-center justify-center rounded transition-colors shrink-0',
  {
    variants: {
      active: {
        true: 'bg-primary/15 text-primary',
        false: 'text-foreground/50 hover:text-foreground hover:bg-muted',
      },
    },
    defaultVariants: { active: false },
  },
);

function ToolbarButton({
  onClick,
  active,
  title,
  children,
  className,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(toolbarButtonVariants({ active }), className)}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 mx-1 bg-border shrink-0" />;
}
