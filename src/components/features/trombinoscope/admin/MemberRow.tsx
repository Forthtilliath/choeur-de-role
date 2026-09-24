'use client';

import { useState } from 'react';
import { LoaderCircle, Lock, LockOpen, MailCheck, MailWarning, Pencil, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { ButtonIcon } from '@/components/ui/ButtonIcon';
import { useNow } from '@/hooks/useNow';
import { formatDate, formatDateTimeCompact } from '@/utils/dateHelpers';
import { formatPhone } from '@/utils/phoneHelpers';

import { toggleMemberLock } from '../clientQueries';
import { getVoicePartBadge } from '../MemberCell';
import type { AdminMember, AuthInfo } from '../types';

import { RECENT_MS } from './constants';
import { RoleBadge } from './RoleBadge';

export function MemberRow({
  member,
  authInfo,
  onEditAction,
  onDeleteAction,
  onLockToggleAction,
  selectionMode,
  checked,
  onToggleAction,
  nameFormat = 'first_last',
}: {
  member: AdminMember;
  authInfo?: AuthInfo;
  onEditAction: () => void;
  onDeleteAction: () => void;
  onLockToggleAction?: (memberId: string, locked: boolean) => void;
  selectionMode?: boolean;
  checked?: boolean;
  onToggleAction?: () => void;
  nameFormat?: 'first_last' | 'last_first';
}) {
  const now = useNow();
  const isRecentSelfUpdate =
    member.self_updated_at && now - new Date(member.self_updated_at).getTime() < RECENT_MS;
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [locking, setLocking] = useState(false);
  const isUnconfirmed = !authInfo?.emailConfirmedAt && !authInfo?.lastSignInAt;
  const isLocked = authInfo?.isLocked ?? false;

  async function handleToggleLock() {
    setLocking(true);
    const ok = await toggleMemberLock(member.id, !isLocked);
    if (ok) {
      toast.success(isLocked ? 'Compte déverrouillé' : 'Compte verrouillé');
      onLockToggleAction?.(member.id, !isLocked);
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
    setLocking(false);
  }

  async function handleResendInvite() {
    setResending(true);
    const res = await fetch('/api/admin/resend-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member.id }),
    });
    if (res.ok) {
      setResendSuccess(true);
      toast.success('Invitation renvoyée');
      setTimeout(() => setResendSuccess(false), 3000);
    } else {
      toast.error("Erreur lors de l'envoi de l'invitation");
    }
    setResending(false);
  }

  const stickyClass = selectionMode ? '' : 'sticky left-0 z-10';
  const stickyBg =
    selectionMode && checked
      ? 'bg-primary/5'
      : isRecentSelfUpdate
        ? 'bg-orange-50 dark:bg-orange-950/20'
        : 'bg-background';

  const displayName =
    nameFormat === 'last_first'
      ? `${member.last_name ?? ''} ${member.first_name ?? ''}`.trim()
      : `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();

  return (
    <tr
      onClick={selectionMode && member.email ? onToggleAction : undefined}
      className={`border-b border-border last:border-0 hover:bg-background-secondary transition-colors ${isRecentSelfUpdate ? 'bg-orange-50 dark:bg-orange-950/20' : ''} ${selectionMode && member.email ? 'cursor-pointer' : ''} ${selectionMode && checked ? 'bg-primary/5' : ''}`}
    >
      {/* Checkbox sélection */}
      {selectionMode && (
        <td className="pl-4 pr-1 py-3" onClick={(e) => e.stopPropagation()}>
          {member.email ? (
            <input
              type="checkbox"
              checked={checked ?? false}
              onChange={onToggleAction}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
          ) : (
            <span className="w-4 h-4 block" />
          )}
        </td>
      )}

      {/* Photo + Nom — colonne sticky */}
      <td className={`${stickyClass} ${stickyBg} px-4 py-3 border-r border-border/40`}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-background-secondary shrink-0">
            {member.photo_url ? (
              <Image
                src={member.photo_url}
                alt={displayName}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/30">
                👤
              </div>
            )}
          </div>
          <div>
            <p
              className={`font-medium whitespace-nowrap ${isLocked ? 'text-foreground/40 line-through' : 'text-foreground'}`}
            >
              {displayName}
            </p>
            {isLocked && <span className="text-xs text-red-500 dark:text-red-400">Verrouillé</span>}
          </div>
        </div>
      </td>

      {/* Pupitre */}
      <td className="px-4 py-3 whitespace-nowrap">
        {member.voice_parts && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVoicePartBadge(member.voice_parts.name)}`}
          >
            {member.voice_parts.name}
          </span>
        )}
      </td>

      {/* Rôle */}
      <td className="px-4 py-3 whitespace-nowrap">
        <RoleBadge role={member.role ?? 'member'} bureauRole={member.bureau_role} />
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {member.email && (
            <Link
              href={`mailto:${member.email}`}
              className="text-xs text-primary hover:opacity-70 no-underline"
            >
              {member.email}
            </Link>
          )}
          {member.phone && (
            <span className="text-xs text-foreground/50">{formatPhone(member.phone)}</span>
          )}
        </div>
      </td>

      {/* Naissance */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-foreground/60">
          {member.birthday ? formatDate(member.birthday) : '—'}
        </span>
      </td>

      {/* Adresse */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-foreground/60">
          {[member.city, member.address].filter(Boolean).join(', ') || '—'}
        </span>
      </td>

      {/* Modifié */}
      <td className="px-4 py-3 whitespace-nowrap">
        {isRecentSelfUpdate ? (
          <span className="text-xs text-orange-500 font-medium">
            ✏️ {formatDateTimeCompact(member.self_updated_at!)}
          </span>
        ) : member.updated_at ? (
          <span className="text-xs text-foreground/40">
            {formatDateTimeCompact(member.updated_at)}
          </span>
        ) : (
          <span className="text-xs text-foreground/30">—</span>
        )}
      </td>

      {/* Connexion */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-xs text-foreground/40">
          {authInfo?.lastSignInAt ? formatDateTimeCompact(authInfo.lastSignInAt) : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <ButtonIcon size="sm" onClick={onEditAction}>
            <Pencil />
          </ButtonIcon>
          {isUnconfirmed && (
            <ButtonIcon
              size="sm"
              onClick={handleResendInvite}
              disabled={resending}
              title="Renvoyer l'invitation"
              className={`${resendSuccess ? 'border-primary text-primary' : 'border-orange-300 text-orange-500 hover:text-orange-500 hover:border-orange-500'} disabled:opacity-50`}
            >
              {resending ? (
                <LoaderCircle className="animate-spin" />
              ) : resendSuccess ? (
                <MailCheck />
              ) : (
                <MailWarning />
              )}
            </ButtonIcon>
          )}
          {authInfo && member.role !== 'super_admin' && (
            <ButtonIcon
              size="sm"
              onClick={handleToggleLock}
              disabled={locking}
              title={isLocked ? 'Déverrouiller le compte' : 'Verrouiller le compte'}
              className={
                isLocked
                  ? 'border-red-400 text-red-500 hover:border-red-300 disabled:opacity-50'
                  : 'border-foreground/20 text-foreground/40 hover:border-red-400 hover:text-red-500 disabled:opacity-50'
              }
            >
              {locking ? (
                <LoaderCircle className="animate-spin" />
              ) : isLocked ? (
                <Lock />
              ) : (
                <LockOpen />
              )}
            </ButtonIcon>
          )}
          {member.role !== 'super_admin' && (
            <ButtonIcon size="sm" onClick={onDeleteAction} variant="danger">
              <X />
            </ButtonIcon>
          )}
        </div>
      </td>
    </tr>
  );
}
