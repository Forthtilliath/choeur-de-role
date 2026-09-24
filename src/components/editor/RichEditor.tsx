'use client';

import { useState } from 'react';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { BadgeNode } from './Badge';
import { EditorToolbar } from './EditorToolbar';
import { ImageInputBar } from './ImageInputBar';
import { LinkInputBar } from './LinkInputBar';
import { TextShadow } from './TextShadow';

type Props = {
  content: string;
  onChangeAction: (content: string) => void;
  placeholder?: string;
  dark?: boolean;
};

export function RichEditor({ content, onChangeAction, placeholder, dark }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

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

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col max-h-150">
      <EditorToolbar
        editor={editor}
        dark={dark}
        showImageInput={showImageInput}
        onToggleLinkAction={() => {
          setShowLinkInput((v) => !v);
          setShowImageInput(false);
        }}
        onToggleImageAction={() => {
          setShowImageInput((v) => !v);
          setShowLinkInput(false);
        }}
        onColorPickerOpenAction={() => {
          setShowLinkInput(false);
          setShowImageInput(false);
        }}
      />

      {showLinkInput && (
        <LinkInputBar editor={editor} onCloseAction={() => setShowLinkInput(false)} />
      )}

      {showImageInput && (
        <ImageInputBar editor={editor} onCloseAction={() => setShowImageInput(false)} />
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
