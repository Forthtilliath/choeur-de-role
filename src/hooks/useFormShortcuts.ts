'use client';

import { useEffect, useRef } from 'react';

/**
 * Adds keyboard shortcuts to a form:
 * - Cmd/Ctrl+Enter → submit (intercepted before TipTap in capture phase)
 * - Escape → call onCancel (bubbling phase, skipped when RichEditor URL inputs are active)
 */
export function useFormShortcuts(onCancel?: () => void) {
  const formRef = useRef<HTMLFormElement>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Capture phase: fires before TipTap, prevents hard-break on Mod-Enter
    function onCmdEnter(e: KeyboardEvent) {
      if (!form!.contains(document.activeElement)) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        form!.requestSubmit();
      }
    }

    // Bubbling phase: fires after sub-components (RichEditor modals) handle Escape first
    function onEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (!form!.contains(document.activeElement)) return;
      // Skip when a URL input is focused (RichEditor link/image modals)
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.type === 'url') return;
      onCancelRef.current?.();
    }

    document.addEventListener('keydown', onCmdEnter, true);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onCmdEnter, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return formRef;
}
