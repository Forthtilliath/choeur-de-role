'use client';

import { Tables } from '@/types/database';

type VoicePart = Tables<'voice_parts'>;

type Props = {
  voiceParts: VoicePart[];
  selectedIds: Set<string>;
  onToggleAction: (id: string) => void;
};

// Couleurs par nom de pupitre
function getPartColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('soprane')) return 'bg-soprano text-black';
  if (n.includes('alto')) return 'bg-alto text-black';
  if (n.includes('ténor')) return 'bg-tenor text-black';
  if (n.includes('basse')) return 'bg-bass text-white';
  return 'bg-foreground/10 text-foreground';
}

function getPartColorInactive(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('soprane')) return 'bg-soprano/20 text-foreground/50';
  if (n.includes('alto')) return 'bg-alto/20 text-foreground/50';
  if (n.includes('ténor')) return 'bg-tenor/20 text-foreground/50';
  if (n.includes('basse')) return 'bg-bass/20 text-foreground/50';
  return 'bg-foreground/5 text-foreground/30';
}

export function VoicePartFilter({ voiceParts, selectedIds, onToggleAction }: Props) {
  // Séparer pupitres avec groupe et sans groupe
  const grouped = new Map<string, VoicePart[]>();
  const ungrouped: VoicePart[] = [];

  for (const vp of voiceParts) {
    if (vp.group_name) {
      if (!grouped.has(vp.group_name)) grouped.set(vp.group_name, []);
      grouped.get(vp.group_name)!.push(vp);
    } else {
      ungrouped.push(vp);
    }
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* Boutons groupés */}
      {Array.from(grouped.entries()).map(([groupName, parts]) => {
        if (parts.length === 1) {
          // Groupe avec 1 seul pupitre → bouton simple
          const vp = parts[0];
          const active = selectedIds.has(vp.id);
          return (
            <button
              key={vp.id}
              onClick={() => onToggleAction(vp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${
                active
                  ? `${getPartColor(vp.name)} border-primary`
                  : `${getPartColorInactive(vp.name)} border-border`
              }`}
            >
              {vp.name}
            </button>
          );
          // } else if (parts.length === 2) {
          //   return (
          //     <div
          //       key={groupName}
          //       className="flex items-stretch rounded-lg overflow-hidden border border-border"
          //     >
          //       {parts.slice(0, Math.ceil(parts.length / 2)).map((vp) => {
          //         const active = selectedIds.has(vp.id);
          //         return (
          //           <button
          //             key={vp.id}
          //             onClick={() => onToggleAction(vp.id)}
          //             className={`px-2.5 py-1.5 text-xs font-medium transition-all border-r border-white/20 ${
          //               active ? getPartColor(vp.name) : getPartColorInactive(vp.name)
          //             }`}
          //             title={vp.name}
          //           >
          //             {getShortName(vp.name, parts)}
          //           </button>
          //         );
          //       })}

          //       {/* Label groupe central non cliquable */}
          //       <span className="px-2.5 py-1.5 text-xs font-medium text-foreground/60 bg-background-secondary border-x border-border select-none whitespace-nowrap">
          //         {groupName}
          //       </span>

          //       {parts.slice(Math.ceil(parts.length / 2)).map((vp) => {
          //         const active = selectedIds.has(vp.id);
          //         return (
          //           <button
          //             key={vp.id}
          //             onClick={() => onToggleAction(vp.id)}
          //             className={`px-2.5 py-1.5 text-xs font-medium transition-all border-l border-white/20 ${
          //               active ? getPartColor(vp.name) : getPartColorInactive(vp.name)
          //             }`}
          //             title={vp.name}
          //           >
          //             {getShortName(vp.name, parts)}
          //           </button>
          //         );
          //       })}
          //     </div>
          //   );
        } else {
          // Groupe avec plusieurs pupitres → bouton splitté avec label groupe au centre
          return (
            <div
              key={groupName}
              className="flex items-center rounded-lg overflow-hidden border border-border"
            >
              {/* Label groupe non cliquable au centre */}
              <span className="px-2 py-1.5 text-xs font-medium text-foreground/50 bg-background-secondary border-l border-r border-border select-none order-first">
                {groupName}
              </span>
              {parts.map((vp, index) => {
                const active = selectedIds.has(vp.id);
                return (
                  <button
                    key={vp.id}
                    onClick={() => onToggleAction(vp.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
                      active ? getPartColor(vp.name) : getPartColorInactive(vp.name)
                    } ${index > 0 ? 'border-l border-white/20' : ''}`}
                    title={vp.name}
                  >
                    {getShortName(vp.name)}
                  </button>
                );
              })}
            </div>
          );
        }
      })}

      {/* Boutons non groupés */}
      {ungrouped.map((vp) => {
        const active = selectedIds.has(vp.id);
        return (
          <button
            key={vp.id}
            onClick={() => onToggleAction(vp.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border font-medium transition-all ${
              active
                ? `${getPartColor(vp.name)} border-primary`
                : `${getPartColorInactive(vp.name)} border-border`
            }`}
          >
            {vp.name}
          </button>
        );
      })}
    </div>
  );
}

function getShortName(name: string): string {
  // Si tous les siblings partagent la même base, afficher le suffixe distinctif
  // Ex: "Soprano 1" et "Soprano 2" → "1" et "2"
  // Ex: "Ténor" et "Basse" → "T" et "B"
  const numbers = name.match(/\d+/);
  if (numbers) return numbers[0];

  // Pas de numéro → première lettre
  return name.charAt(0).toUpperCase();
}
