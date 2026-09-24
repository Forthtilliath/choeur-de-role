'use client';

import { useState } from 'react';

import { adminGroups } from '@/components/layout/AdminSidebar';
import { AuthButton } from '@/components/layout/AuthButton';

import { adminIcons, privateLinks, publicLinks } from './headerLinks';

const ITEM_CLASS = 'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors';
const IDLE_CLASS = 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary';
const ACTIVE_CLASS = 'bg-primary/10 text-primary-light font-medium';
const SECTION_CLASS =
  'text-[10px] font-semibold uppercase tracking-wider text-foreground/40 px-3 pt-4 pb-1';

function MenuButton({
  active,
  activeClass = ACTIVE_CLASS,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  activeClass?: string;
  icon: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={`${ITEM_CLASS} ${active ? activeClass : IDLE_CLASS}`}>
      <span className="text-base shrink-0">{icon}</span>
      {children}
    </button>
  );
}

type Props = {
  pathname: string;
  isMember: boolean;
  isCa: boolean;
  isAdmin: boolean;
  pendingPollsCount: number;
  initialLoggedIn?: boolean;
  onNavigateAction: (href: string) => void;
  onCloseAction: () => void;
};

// Menu mobile/tablette — style palette
export function MobileMenu({
  pathname,
  isMember,
  isCa,
  isAdmin,
  pendingPollsCount,
  initialLoggedIn,
  onNavigateAction,
  onCloseAction,
}: Props) {
  const [showAdminLinks, setShowAdminLinks] = useState(false);

  return (
    <nav className="fixed inset-0 z-40 lg:hidden bg-background-secondary px-2 pt-20 pb-4 flex flex-col overflow-y-auto overscroll-contain">
      {/* Accueil */}
      <MenuButton active={pathname === '/'} icon="🏠" onClick={() => onNavigateAction('/')}>
        <span>Accueil</span>
      </MenuButton>

      {/* Liens publics */}
      <p className={SECTION_CLASS}>Découvrir</p>
      {publicLinks.map((lien) => (
        <MenuButton
          key={lien.href}
          active={pathname === lien.href}
          icon={lien.icon}
          onClick={() => onNavigateAction(lien.href)}
        >
          <span>{lien.label}</span>
        </MenuButton>
      ))}

      {/* Espace choristes */}
      {isMember && (
        <>
          <p className={SECTION_CLASS}>Espace choristes</p>
          {privateLinks.map((lien) => (
            <MenuButton
              key={lien.href}
              active={pathname === lien.href}
              icon={lien.icon}
              onClick={() => onNavigateAction(lien.href)}
            >
              <span className="flex items-center gap-1.5">
                {lien.label}
                {lien.href === '/choristes/sondages' && pendingPollsCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-primary text-white font-bold text-[10px]">
                    {pendingPollsCount}
                  </span>
                )}
              </span>
            </MenuButton>
          ))}
        </>
      )}

      {/* Bureau CA */}
      {isCa && (
        <>
          <p className={SECTION_CLASS}>Bureau</p>
          <MenuButton
            active={pathname.startsWith('/choristes/bureau')}
            icon="📌"
            onClick={() => onNavigateAction('/choristes/bureau/taches')}
          >
            <span>Tâches</span>
          </MenuButton>
        </>
      )}

      {/* Administration */}
      {isAdmin && (
        <>
          <button
            onClick={() => setShowAdminLinks((v) => !v)}
            className="flex items-center justify-between w-full px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            <span>Administration</span>
            <span>{showAdminLinks ? '▲' : '▼'}</span>
          </button>
          {showAdminLinks &&
            (adminGroups ?? []).map((group) => (
              <div key={group.label}>
                <p className="text-[10px] text-foreground/30 px-3 pt-2 pb-1 italic">
                  {group.label}
                </p>
                {group.links.map((lien) => (
                  <MenuButton
                    key={lien.href}
                    active={
                      lien.href === '/choristes/admin'
                        ? pathname === '/choristes/admin'
                        : pathname.startsWith(lien.href)
                    }
                    activeClass="bg-secondary/10 text-secondary font-medium"
                    icon={adminIcons[lien.href] ?? '•'}
                    onClick={() => onNavigateAction(lien.href)}
                  >
                    <span>{lien.label}</span>
                  </MenuButton>
                ))}
              </div>
            ))}
        </>
      )}

      {/* Auth */}
      <div className="border-t border-border mt-4 pt-3 px-1">
        <AuthButton onClickAction={onCloseAction} initialLoggedIn={initialLoggedIn} />
      </div>
    </nav>
  );
}
