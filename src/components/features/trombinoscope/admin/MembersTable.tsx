'use client';

import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';

import type { AdminMemberWithSeasons, AuthInfo } from '../types';

import { MemberRow } from './MemberRow';
import type { NameFormat, SortDir, SortKey } from './membersList';
import { SortTh } from './SortTh';

const SCROLL_BUTTON_CLASS =
  'w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30 disabled:opacity-30 text-xs transition-all';
const PLAIN_TH_CLASS = 'px-4 py-3 text-left text-xs font-medium text-foreground/50';

type Props = {
  members: AdminMemberWithSeasons[];
  authMap: Record<string, AuthInfo>;
  selectionMode: boolean;
  selectedIds: Set<string>;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSortAction: (key: SortKey) => void;
  nameFormat: NameFormat;
  onToggleNameFormatAction: () => void;
  onEditAction: (member: AdminMemberWithSeasons) => void;
  onDeleteAction: (id: string) => void;
  onLockToggleAction: (memberId: string, locked: boolean) => void;
  onToggleMemberAction: (id: string) => void;
};

export function MembersTable({
  members,
  authMap,
  selectionMode,
  selectedIds,
  sortKey,
  sortDir,
  onSortAction,
  nameFormat,
  onToggleNameFormatAction,
  onEditAction,
  onDeleteAction,
  onLockToggleAction,
  onToggleMemberAction,
}: Props) {
  const { scrollRef, innerRef, canScrollLeft, canScrollRight, updateScrollState, scrollByStep } =
    useHorizontalScroll<HTMLTableElement>();
  const sortProps = { sortKey, sortDir, onSort: onSortAction };

  return (
    <div className="rounded-2xl overflow-hidden border border-border relative">
      {/* Ombre gauche */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20 bg-linear-to-r from-background/80 to-transparent" />
      )}
      {/* Ombre droite */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20 bg-linear-to-l from-background/80 to-transparent" />
      )}
      {/* Boutons de scroll */}
      {(canScrollLeft || canScrollRight) && (
        <div className="absolute top-2 right-2 z-30 flex gap-1">
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollLeft}
            className={SCROLL_BUTTON_CLASS}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            disabled={!canScrollRight}
            className={SCROLL_BUTTON_CLASS}
          >
            →
          </button>
        </div>
      )}
      <div ref={scrollRef} className="overflow-x-auto" onScroll={updateScrollState}>
        <table ref={innerRef} className="w-full text-sm">
          <thead>
            <tr className="bg-background-secondary border-b border-border">
              {selectionMode && <th className="pl-4 pr-1 py-3 w-8" />}
              <SortTh
                label="Nom"
                col="last_name"
                {...sortProps}
                nameFormat={nameFormat}
                onToggleNameFormat={onToggleNameFormatAction}
                className={
                  selectionMode
                    ? ''
                    : 'sticky left-0 z-10 bg-background-secondary border-r border-border/40'
                }
              />
              <SortTh label="Pupitre" col="voice_part" {...sortProps} />
              <SortTh label="Rôle" col="role" {...sortProps} />
              <th className={PLAIN_TH_CLASS}>Contact</th>
              <SortTh label="Naissance" col="birthday" {...sortProps} />
              <th className={PLAIN_TH_CLASS}>Adresse</th>
              <SortTh label="Modifié" col="updated" {...sortProps} />
              <th className={PLAIN_TH_CLASS}>Connexion</th>
              <th className={PLAIN_TH_CLASS}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                authInfo={authMap[member.id]}
                onEditAction={() => onEditAction(member)}
                onDeleteAction={() => onDeleteAction(member.id)}
                onLockToggleAction={onLockToggleAction}
                nameFormat={nameFormat}
                selectionMode={selectionMode}
                checked={selectedIds.has(member.id)}
                onToggleAction={() => onToggleMemberAction(member.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
