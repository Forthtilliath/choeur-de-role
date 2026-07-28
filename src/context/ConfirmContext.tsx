'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export type ConfirmDetails = {
  icon?: string;
  label: string;
  sublabel?: string;
};

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireTyping?: string;
  warning?: string;
  details?: ConfirmDetails;
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(
  () => Promise.resolve(false),
);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const openConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  function handleConfirm() {
    state?.resolve(true);
    setState(null);
  }

  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={openConfirm}>
      {children}
      {state && (
        <ConfirmModal
          title={state.title}
          message={state.message}
          confirmLabel={state.confirmLabel}
          cancelLabel={state.cancelLabel}
          danger={state.danger}
          requireTyping={state.requireTyping}
          warning={state.warning}
          details={state.details}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
