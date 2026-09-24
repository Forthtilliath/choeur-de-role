'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';

import { privateLinks } from './headerLinks';

const LINK_CLASS = 'text-xs transition-all px-3 py-1 rounded-md whitespace-nowrap';
const ACTIVE_CLASS = 'text-primary-light bg-primary/10 dark:bg-primary/20 font-medium';
const IDLE_CLASS = 'text-foreground/70 hover:text-foreground hover:bg-background';

type Props = {
  pathname: string;
  isCa: boolean;
  isAdmin: boolean;
  pendingPollsCount: number;
};

// Sous-menu choristes desktop, fixé sous le header
export function ChoristesSubNav({ pathname, isCa, isAdmin, pendingPollsCount }: Props) {
  const inAdmin = pathname.startsWith('/choristes/admin');

  return (
    <div className="hidden lg:flex fixed top-16 left-0 right-0 z-40 bg-background-tertiary border-b border-border">
      <div
        className={`max-w-5xl mx-auto px-4 h-10 flex items-center w-full ${isAdmin ? 'justify-between' : 'justify-center'}`}
      >
        <nav className="flex items-center gap-1">
          {privateLinks.map((lien) => (
            <span className="relative" key={lien.href}>
              <Link
                href={lien.href}
                prefetch={false}
                className={`${LINK_CLASS} ${pathname === lien.href ? ACTIVE_CLASS : IDLE_CLASS}`}
              >
                {lien.label}
                {lien.href === '/choristes/sondages' && pendingPollsCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex size-3 z-51">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-primary justify-center items-center text-black text-[10px] font-bold">
                      {pendingPollsCount}
                    </span>
                  </span>
                )}
              </Link>
            </span>
          ))}
        </nav>
        {isCa && (
          <Link
            href="/choristes/bureau/taches"
            prefetch={false}
            className={`${LINK_CLASS} ${pathname.startsWith('/choristes/bureau') ? ACTIVE_CLASS : IDLE_CLASS}`}
          >
            Tâches
          </Link>
        )}
        {isAdmin && (
          <Button
            href="/choristes/admin/tableau-de-bord"
            variant={inAdmin ? 'secondary' : 'outline-secondary'}
            size="sm"
            className="flex gap-1 group"
          >
            <Settings
              size={14}
              className={`[animation-duration:3s]! ${inAdmin ? 'animate-spin' : 'group-hover:animate-spin'}`}
            />
            Administration
          </Button>
        )}
      </div>
    </div>
  );
}
