'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors text-sm"
    >
      <Printer className="w-4 h-4" />
      Imprimer
    </button>
  );
}
