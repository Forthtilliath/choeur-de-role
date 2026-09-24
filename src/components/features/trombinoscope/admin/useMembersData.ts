import { useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/context/ConfirmContext';

import type { Season } from '../../concerts';
import { bulkAssignSeason, deleteMember } from '../clientQueries';
import type { AdminMemberWithSeasons, AuthInfo } from '../types';

// Liste locale des membres et de leurs infos d'authentification, avec les mutations associées
export function useMembersData(
  initialMembers: AdminMemberWithSeasons[],
  authMap: Record<string, AuthInfo>,
  seasons: Season[],
) {
  const [members, setMembers] = useState<AdminMemberWithSeasons[]>(initialMembers);
  const [localAuthMap, setLocalAuthMap] = useState<Record<string, AuthInfo>>(authMap);
  const confirm = useConfirm();

  function upsertMember(member: AdminMemberWithSeasons) {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      return exists ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member];
    });
  }

  function addMembers(newMembers: AdminMemberWithSeasons[]) {
    if (newMembers.length > 0) setMembers((prev) => [...prev, ...newMembers]);
  }

  function updatePhoto(memberId: string, photoUrl: string) {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, photo_url: photoUrl } : m)));
  }

  function setLocked(memberId: string, locked: boolean) {
    setLocalAuthMap((prev) => ({
      ...prev,
      [memberId]: {
        emailConfirmedAt: undefined,
        lastSignInAt: undefined,
        ...prev[memberId],
        isLocked: locked,
      },
    }));
  }

  async function removeMember(id: string) {
    const item = members.find((m) => m.id === id);
    if (item?.role === 'super_admin') return;
    const name = [item?.first_name, item?.last_name].filter(Boolean).join(' ');
    if (
      !(await confirm({
        message: 'Supprimer définitivement ce membre ?',
        danger: true,
        details: name ? { icon: '👤', label: name, sublabel: item?.email ?? undefined } : undefined,
      }))
    )
      return;
    const ok = await deleteMember(id);
    if (ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Membre supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  async function assignSeason(selectedIds: Set<string>, seasonId: string) {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const season = seasons.find((s) => s.id === seasonId);
    const ok = await bulkAssignSeason(ids, seasonId);
    if (ok) {
      setMembers((prev) =>
        prev.map((m) =>
          selectedIds.has(m.id) && !m.member_season.find((ms) => ms.season_id === seasonId)
            ? { ...m, member_season: [...m.member_season, { season_id: seasonId }] }
            : m,
        ),
      );
      const s = ids.length > 1 ? 's' : '';
      toast.success(`${ids.length} membre${s} ajouté${s} à la saison ${season?.label ?? ''}`);
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  return {
    members,
    localAuthMap,
    upsertMember,
    addMembers,
    updatePhoto,
    setLocked,
    removeMember,
    assignSeason,
  };
}
