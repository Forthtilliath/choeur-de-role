'use client';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { VoicePartFilter } from '@/components/ui/VoicePartFilter';

import type { Season } from '../../concerts';
import type { VoicePart } from '../types';

import { ROLE_GROUPS } from './membersList';

type Props = {
  search: string;
  onSearchChangeAction: (value: string) => void;
  selectionMode: boolean;
  onToggleSelectionModeAction: () => void;
  onExportAction: () => void;
  onToggleCsvImportAction: () => void;
  onAddMemberAction: () => void;
  voiceParts: VoicePart[];
  selectedVoicePartIds: Set<string>;
  onToggleVoicePartAction: (id: string) => void;
  selectedRoleGroups: Set<string>;
  onToggleRoleGroupAction: (key: string) => void;
  seasons: Season[];
  filterSeasonId: string;
  onFilterSeasonChangeAction: (id: string) => void;
  showLocked: boolean;
  onToggleShowLockedAction: () => void;
  recentCount: number;
  showRecent: boolean;
  onToggleShowRecentAction: () => void;
};

export function MembersToolbar({
  search,
  onSearchChangeAction,
  selectionMode,
  onToggleSelectionModeAction,
  onExportAction,
  onToggleCsvImportAction,
  onAddMemberAction,
  voiceParts,
  selectedVoicePartIds,
  onToggleVoicePartAction,
  selectedRoleGroups,
  onToggleRoleGroupAction,
  seasons,
  filterSeasonId,
  onFilterSeasonChangeAction,
  showLocked,
  onToggleShowLockedAction,
  recentCount,
  showRecent,
  onToggleShowRecentAction,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Ligne 1 : recherche + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-64">
          <input
            value={search}
            onChange={(e) => onSearchChangeAction(e.target.value)}
            placeholder="Rechercher un membre..."
            className="border border-border rounded-lg px-2 py-1 pr-7 text-sm bg-background w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChangeAction('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
        <div className="ml-auto flex gap-2 shrink-0 flex-wrap">
          <Button variant="ghost" onClick={onToggleSelectionModeAction} size="sm">
            {selectionMode ? 'Annuler la sélection' : 'Sélectionner'}
          </Button>
          <Button variant="ghost" onClick={onExportAction} size="sm">
            Exporter CSV
          </Button>
          <Button variant="ghost" onClick={onToggleCsvImportAction} size="sm">
            Importer CSV
          </Button>
          <Button onClick={onAddMemberAction} size="sm">
            Ajouter un membre
          </Button>
        </div>
      </div>

      {/* Ligne 2 : filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <VoicePartFilter
          voiceParts={voiceParts}
          selectedIds={selectedVoicePartIds}
          onToggleAction={onToggleVoicePartAction}
        />
        <div className="flex items-center rounded-lg overflow-hidden border border-border">
          {ROLE_GROUPS.map((g, index) => {
            const active = selectedRoleGroups.has(g.key);
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => onToggleRoleGroupAction(g.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${active ? g.active : g.inactive}${index > 0 ? ' border-l border-white/20' : ''}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
        <Select
          value={filterSeasonId}
          onChange={(e) => onFilterSeasonChangeAction(e.target.value)}
          className="px-2 py-1 text-foreground/70"
        >
          <option value="">Toutes les saisons</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <button
          onClick={onToggleShowLockedAction}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${showLocked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50 hover:border-foreground/30'}`}
        >
          🔒 {showLocked ? 'Masquer les verrouillés' : 'Voir les verrouillés'}
        </button>
        {recentCount > 0 && (
          <button
            onClick={onToggleShowRecentAction}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${showRecent ? 'border-primary bg-primary/10 text-primary' : 'border-orange-300 text-orange-500'}`}
          >
            ✏️ {recentCount} modif{recentCount > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
