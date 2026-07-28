'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

type Details = {
  icon?: string;
  label: string;
  sublabel?: string;
};

type Props = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireTyping?: string;
  warning?: string;
  details?: Details;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  requireTyping,
  warning,
  details,
  onConfirm,
  onCancel,
}: Props) {
  const [typedValue, setTypedValue] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (requireTyping) {
      inputRef.current?.focus();
    } else {
      cancelRef.current?.focus();
    }
  }, [requireTyping]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const canConfirm = !requireTyping || typedValue === requireTyping;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-background rounded-2xl border border-border w-full max-w-sm shadow-2xl flex flex-col">

        {/* Header */}
        <div className="p-6 flex items-center gap-4">
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              danger
                ? 'bg-red-100 dark:bg-red-950/50'
                : 'bg-amber-100 dark:bg-amber-950/50'
            }`}
          >
            {danger
              ? <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              : <Info size={18} className="text-amber-600 dark:text-amber-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            {title && <p className="font-semibold text-foreground mb-0.5">{title}</p>}
            <p className="text-sm text-foreground/70 leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onCancel}
            className="shrink-0 -mt-1 -mr-1 w-8 h-8 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Item card */}
        {details && (
          <div className="mx-6 -mt-2 mb-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-foreground/4 border border-border">
              {details.icon && (
                <span className="text-lg shrink-0 leading-none">{details.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{details.label}</p>
                {details.sublabel && (
                  <p className="text-xs text-foreground/50 mt-0.5 truncate">{details.sublabel}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        {warning && (
          <div className="mx-6 mt-2 mb-1">
            <div className="flex gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          </div>
        )}

        {/* Require typing */}
        {requireTyping && (
          <div className="mx-6 mt-4 flex flex-col gap-2">
            <label className="text-xs text-foreground/50">
              Tapez{' '}
              <span className="font-mono font-bold text-foreground">{requireTyping}</span>{' '}
              pour continuer
            </label>
            <input
              ref={inputRef}
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTyping}
              autoComplete="off"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background font-mono"
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-5 flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm border border-border text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-white hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
