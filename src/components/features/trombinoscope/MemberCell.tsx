'use client';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { formatPhone } from '@/utils/phoneHelpers';
import { toTitleCase, toUpperCase } from '@/utils/stringHelpers';
import { Column, TrombiMember } from './types';

function getVoicePartBg(name: string | undefined): string {
  if (!name) return '';
  const n = name.toLowerCase();
  if (n.includes('soprane')) return 'bg-soprano/20 hover:bg-soprano/35';
  if (n.includes('alto')) return 'bg-alto/30 hover:bg-alto/50';
  if (n.includes('ténor')) return 'bg-tenor/20 hover:bg-tenor/35';
  if (n.includes('basse')) return 'bg-bass/20 hover:bg-bass/35';
  if (n.includes('pianist')) return 'bg-pianist/20 hover:bg-pianist/35';
  if (n.includes('chef') || n.includes('directeur')) return 'bg-choir-director/20 hover:bg-choir-director/35';
  return 'bg-background-secondary hover:bg-background-tertiary';
}

export function getVoicePartBadge(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('soprane')) return 'bg-soprano text-black';
  if (n.includes('alto')) return 'bg-alto text-black';
  if (n.includes('ténor')) return 'bg-tenor text-black';
  if (n.includes('basse')) return 'bg-bass text-black';
  if (n.includes('pianist')) return 'bg-pianist text-white';
  if (n.includes('chef') || n.includes('directeur')) return 'bg-choir-director text-white';
  return 'bg-foreground/10 text-foreground';
}

export { getVoicePartBg };

function BureauRoleBadge({ bureauRole }: { bureauRole: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const roles = bureauRole.split(/\n|\s+-\s+/).map((r) => r.replace(/\//g, ' ').trim()).filter(Boolean);

  return (
    <div
      className="inline-flex justify-center"
      onMouseEnter={() => setRect(ref.current?.getBoundingClientRect() ?? null)}
      onMouseLeave={() => setRect(null)}
      onClick={(e) => { e.stopPropagation(); setRect(r => r ? null : ref.current?.getBoundingClientRect() ?? null); }}
    >
      <span ref={ref} className="text-base cursor-help select-none">🎼</span>
      {rect && createPortal(
        <div
          style={{
            position: 'fixed',
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            maxWidth: `min(220px, calc(100vw - ${rect.right + 16}px))`,
          }}
        >
          <div className="bg-app-green text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg">
            {roles.map((role, i) => (
              <p key={i} className="m-0 whitespace-nowrap">{role}</p>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function MemberCell({ col, member, priority = false }: { col: Column; member: TrombiMember; priority?: boolean }) {
  switch (col.key) {
    case 'ca':
      return member.bureau_role ? <BureauRoleBadge bureauRole={member.bureau_role} /> : null;

    case 'voice_part':
      return member.voice_parts ? (
        <span
          className={`shadow-voice-badge text-xs px-2 py-0.5 rounded-full border border-transparent font-semibold whitespace-nowrap ${getVoicePartBadge(member.voice_parts.name)}`}
        >
          {member.voice_parts.name}
        </span>
      ) : null;

    case 'photo':
      return (
        <div className="relative mx-auto w-20 h-20 min-w-20 rounded-sm overflow-hidden bg-background-secondary shadow-member-photo">
          {member.photo_url ? (
            <Image
              src={member.photo_url}
              alt={`${member.first_name} ${member.last_name}`}
              fill
              priority={priority}
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/30 text-lg">
              👤
            </div>
          )}
        </div>
      );

    case 'first_name':
      return <span className="font-medium">{toTitleCase(member.first_name)}</span>;

    case 'last_name':
      return <span>{toUpperCase(member.last_name)}</span>;

    case 'email':
      return member.email ? (
        <Link
          href={`mailto:${member.email}`}
          className="text-trombi-link text-xs underline-offset-2 hover:underline"
        >
          {member.email}
        </Link>
      ) : (
        <span className="text-foreground/25 text-xs">—</span>
      );

    case 'phone':
      return member.phone ? (
        <Link
          href={`tel:${member.phone}`}
          className="text-trombi-link text-xs whitespace-nowrap hover:underline"
        >
          {formatPhone(member.phone)}
        </Link>
      ) : (
        <span className="text-xs">—</span>
      );

    case 'address':
      return member.city || member.address ? (
        <span className="text-xs">
          {[toTitleCase(member.city), toTitleCase(member.address)].filter(Boolean).join(', ')}
        </span>
      ) : (
        <span className="text-xs">—</span>
      );

    default:
      return null;
  }
}
