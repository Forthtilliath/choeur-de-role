'use client';

import type { Editor } from '@tiptap/react';
import { ImageIcon, LinkIcon } from 'lucide-react';

import type { BadgeVariant } from '../shared/Badge';
import { Badge } from '../shared/Badge';

import { ColorPicker } from './ColorPicker';
import type { ToolbarAction } from './toolbarActions';
import {
  ALIGN_ACTIONS,
  FORMAT_ACTIONS,
  HEADING_ACTIONS,
  LIST_ACTIONS,
  MISC_ACTIONS,
} from './toolbarActions';
import { ToolbarButton, ToolbarSeparator } from './ToolbarButton';

const BADGES: { variant: BadgeVariant; label: string; short: string }[] = [
  { variant: 'alto', label: 'Alti', short: 'A' },
  { variant: 'soprano', label: 'Sopranes', short: 'S' },
  { variant: 'tenor', label: 'Ténors', short: 'T' },
  { variant: 'bass', label: 'Basses', short: 'B' },
];

function ActionButtons({ editor, actions }: { editor: Editor; actions: ToolbarAction[] }) {
  return actions.map(({ icon: Icon, title, run, isActive }) => (
    <ToolbarButton
      key={title}
      onClick={() => run(editor)}
      active={isActive?.(editor) ?? false}
      title={title}
    >
      <Icon className="size-4" />
    </ToolbarButton>
  ));
}

type Props = {
  editor: Editor;
  dark?: boolean;
  showImageInput: boolean;
  onToggleLinkAction: () => void;
  onToggleImageAction: () => void;
  onColorPickerOpenAction: () => void;
};

export function EditorToolbar({
  editor,
  dark,
  showImageInput,
  onToggleLinkAction,
  onToggleImageAction,
  onColorPickerOpenAction,
}: Props) {
  function insertBadge(variant: BadgeVariant, label: string) {
    editor
      .chain()
      .focus()
      .insertContent([
        { type: 'text', text: ' ' },
        { type: 'badgeComponent', attrs: { variant, text: label } },
        { type: 'text', text: ' ' },
      ])
      .run();
  }

  return (
    // Préserve la sélection dans l'éditeur au clic (pas une vraie interaction).
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="flex items-center gap-0.5 flex-wrap p-1.5 border-b border-border bg-background sticky top-0 z-10 shrink-0"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ActionButtons editor={editor} actions={FORMAT_ACTIONS} />
      <ToolbarSeparator />
      <ActionButtons editor={editor} actions={HEADING_ACTIONS} />
      <ToolbarSeparator />
      <ActionButtons editor={editor} actions={ALIGN_ACTIONS} />
      <ToolbarSeparator />

      <ToolbarButton
        onClick={() => {
          if (editor.isActive('link')) editor.chain().focus().unsetLink().run();
          else onToggleLinkAction();
        }}
        active={editor.isActive('link')}
        title="Lien"
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onToggleImageAction} active={showImageInput} title="Image">
        <ImageIcon className="size-4" />
      </ToolbarButton>

      <ToolbarSeparator />
      <ActionButtons editor={editor} actions={LIST_ACTIONS} />
      <ToolbarSeparator />

      <ColorPicker editor={editor} dark={dark} onOpenAction={onColorPickerOpenAction} />

      <ToolbarSeparator />

      {/* Badges pupitre */}
      <div className="flex items-center gap-0.125">
        {BADGES.map((badge) => (
          <button
            key={badge.variant}
            type="button"
            onClick={() => insertBadge(badge.variant, badge.label)}
            title={`Insérer badge ${badge.label}`}
            className="px-1.5 py-1 rounded-lg hover:bg-muted transition-colors shrink-0"
          >
            <Badge variant={badge.variant} text={badge.short} />
          </button>
        ))}
      </div>

      <ToolbarSeparator />
      <ActionButtons editor={editor} actions={MISC_ACTIONS} />
    </div>
  );
}
