'use client';

import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Check, Palette } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ToolbarButton } from './ToolbarButton';

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

type Props = {
  editor: Editor;
  dark?: boolean;
  onOpenAction: () => void;
};

// Menu de couleur du texte ; se ferme au clic en dehors
export function ColorPicker({ editor, dark, onOpenAction }: Props) {
  const colors = dark ? COLORS_DARK : COLORS_LIGHT;
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

  function handleSetColor(color: ColorOption) {
    if (!color.value) {
      editor.chain().focus().unsetColor().unsetMark('textStyle').run();
      return;
    }
    editor.chain().focus().setColor(color.value).run();
  }

  const currentColor = editor.getAttributes('textStyle').color;

  return (
    <div className="relative" ref={colorPickerRef}>
      <ToolbarButton
        onClick={() => {
          setShowColorPicker((v) => !v);
          onOpenAction();
        }}
        active={showColorPicker}
        title="Couleur du texte"
        className="relative"
      >
        <Palette className="size-4" />
        {currentColor && (
          <span
            className="absolute bottom-1 right-1 size-1.5 rounded-full ring-1 ring-background"
            style={{ backgroundColor: currentColor }}
          />
        )}
      </ToolbarButton>

      {showColorPicker && (
        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-xl shadow-lg py-1 z-50 min-w-40">
          {colors.map((color) => {
            const isActive = color.value
              ? editor.isActive('textStyle', { color: color.value })
              : !currentColor;
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
  );
}
