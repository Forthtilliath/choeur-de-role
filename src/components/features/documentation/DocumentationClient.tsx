'use client';

import { useState } from 'react';

import { ADMIN_SECTIONS } from './sections/adminSections';
import { CONTENT_SECTIONS } from './sections/contentSections';
import { MEMBER_SECTIONS } from './sections/memberSections';

const SECTIONS = [...CONTENT_SECTIONS, ...MEMBER_SECTIONS, ...ADMIN_SECTIONS];

export function DocumentationClient() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = SECTIONS.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.steps.some(
        (step) => step.title.toLowerCase().includes(q) || step.content.toLowerCase().includes(q),
      )
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Recherche */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher dans la documentation..."
        className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background w-full"
      />

      {filtered.length === 0 && (
        <p className="text-center text-foreground/50 py-8">
          Aucun résultat pour &quot;{search}&quot;
        </p>
      )}

      {filtered.map((section) => (
        <div key={section.id} className="border border-border rounded-2xl overflow-hidden">
          {/* Header section */}
          <button
            onClick={() => setOpenId(openId === section.id ? null : section.id)}
            className="w-full flex items-center gap-4 px-6 py-4 bg-background-secondary hover:bg-background-tertiary transition-colors text-left"
          >
            <span className="text-2xl shrink-0">{section.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{section.title}</p>
              <p className="text-xs text-foreground/50 mt-0.5">{section.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-foreground/30">
                {section.steps.length} étape{section.steps.length > 1 ? 's' : ''}
              </span>
              <span className="text-foreground/40 text-sm">
                {openId === section.id ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {/* Contenu */}
          {openId === section.id && (
            <div className="divide-y divide-border">
              {section.steps.map((step, index) => (
                <div key={step.title} className="px-6 py-4 flex gap-4">
                  {/* Numéro */}
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
                      {step.content}
                    </p>

                    {step.tip && (
                      <div className="flex gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-xs shrink-0">💡</span>
                        <p className="text-xs text-primary/80">{step.tip}</p>
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
                        <span className="text-xs shrink-0">⚠️</span>
                        <p className="text-xs text-orange-700">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
