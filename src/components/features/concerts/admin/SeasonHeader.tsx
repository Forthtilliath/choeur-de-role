'use client';

import { ChevronDown, ChevronUp, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { ButtonIcon } from '@/components/ui/ButtonIcon';

import type { SeasonWithPerformancesWithDates } from '../types';

// Saison réelle, ou saison virtuelle « Sans saison » regroupant les représentations orphelines
export type SeasonItem = SeasonWithPerformancesWithDates & { isVirtual?: boolean };

type Props = {
  season: SeasonItem;
  isOpen: boolean;
  onToggleOpenAction: () => void;
  isRenaming: boolean;
  renameLabel: string;
  onRenameLabelChangeAction: (value: string) => void;
  onStartRenameAction: () => void;
  onConfirmRenameAction: () => void;
  onCancelRenameAction: () => void;
  onToggleActiveAction: () => void;
  onDeleteAction: () => void;
};

export function SeasonHeader({
  season,
  isOpen,
  onToggleOpenAction,
  isRenaming,
  renameLabel,
  onRenameLabelChangeAction,
  onStartRenameAction,
  onConfirmRenameAction,
  onCancelRenameAction,
  onToggleActiveAction,
  onDeleteAction,
}: Props) {
  return (
    <div
      className={`flex items-center gap-2 px-3 md:px-4 py-3 bg-background-secondary ${season.isVirtual ? 'bg-orange-50 border-b border-orange-200' : ''}`}
    >
      {/* Gauche : nom + rep count (ou formulaire de renommage) */}
      {isRenaming ? (
        // Empêche le clic dans le champ de renommage de rouvrir/fermer le panneau de saison.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
          <input
            value={renameLabel}
            onChange={(e) => onRenameLabelChangeAction(e.target.value)}
            className="border border-border rounded-lg px-3 py-1 text-sm bg-background flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirmRenameAction();
              if (e.key === 'Escape') onCancelRenameAction();
            }}
            autoFocus
          />
          <Button size="sm" onClick={onConfirmRenameAction}>
            OK
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelRenameAction}>
            Annuler
          </Button>
        </div>
      ) : (
        <button
          onClick={onToggleOpenAction}
          className="flex-1 text-left min-w-0 hover:opacity-70 transition-opacity"
        >
          {/* Ligne 1 : nom + badge active */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${season.isVirtual ? 'text-orange-700' : 'text-foreground'}`}
            >
              {season.label}
            </span>
            {season.active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Active
              </span>
            )}
            {season.isVirtual && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                À réaffecter
              </span>
            )}
          </div>
          {/* Ligne 2 : nb représentations */}
          <p className="text-xs text-foreground/40 mt-0.5">
            {season.performances.length} représentation
            {season.performances.length > 1 ? 's' : ''}
          </p>
        </button>
      )}

      {/* Droite col 1 : actions (icônes Lucide) */}
      {!season.isVirtual && !isRenaming && (
        // Empêche le clic sur les icônes d'actions de rouvrir/fermer le panneau de saison.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <ButtonIcon
            onClick={onToggleActiveAction}
            className={`p-1.5 rounded-lg transition-all ${
              season.active
                ? 'text-primary/80 hover:text-primary'
                : 'text-foreground/30 hover:text-foreground/60'
            }`}
            title={season.active ? 'Désactiver' : 'Activer'}
            variant="outline"
          >
            {season.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </ButtonIcon>
          <ButtonIcon onClick={onStartRenameAction} title="Renommer" variant="outline">
            <Pencil size={15} />
          </ButtonIcon>
          <ButtonIcon onClick={onDeleteAction} title="Supprimer" variant="danger">
            <Trash2 size={15} />
          </ButtonIcon>
        </div>
      )}

      {/* Droite col 2 : chevron ouvrir/fermer */}
      {!isRenaming && (
        <button
          onClick={onToggleOpenAction}
          className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-background transition-all shrink-0"
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      )}
    </div>
  );
}
