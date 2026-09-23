'use client';

import { createContext, use, useState } from 'react';

type CommandPaletteContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CommandPaletteContext
      value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}
    >
      {children}
    </CommandPaletteContext>
  );
}

export const useCommandPalette = () => use(CommandPaletteContext);
