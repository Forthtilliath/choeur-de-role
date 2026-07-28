'use client';

import { useState } from 'react';

type EmailTab = {
  id: string;
  label: string;
  subject: string;
  html: string;
};

type Props = {
  tabs: EmailTab[];
};

export function EmailPreviewClient({ tabs }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveId(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeId === tab.id
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-foreground/50">
            <span className="font-medium text-foreground/70">Objet :</span>
            <span>{active.subject}</span>
          </div>
          <div className="border border-border rounded-2xl overflow-hidden bg-white">
            <iframe
              srcDoc={active.html}
              className="w-full h-150"
              title={`Aperçu : ${active.label}`}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
