'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Notification } from '@/app/api/notifications/route';

const ICON: Record<Notification['type'], string> = {
  repertoire: '🎵',
  liens: '🔗',
  ca: '📋',
  calendrier: '📅',
  galerie: '📷',
};

export function NotificationsPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Afficher une seule fois par session
    const shown = sessionStorage.getItem('notif_shown');
    if (shown) return;

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data: Notification[]) => {
        if (data.length > 0) {
          setNotifications(data);
          setVisible(true);
          sessionStorage.setItem('notif_shown', '1');
        }
      })
      .catch(() => {});
  }, []);

  if (!visible || notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center pointer-events-none bg-black/20 dark:bg-black/40 backdrop-blur-sm">
      <div className="pointer-events-auto w-full max-w-sm bg-background border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background-secondary">
          <div>
            <p className="text-sm font-medium text-foreground">Nouveautés depuis votre dernière visite</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-foreground/40 hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {notifications.map((notif) => (
            <Link
              key={notif.type}
              href={notif.href}
              onClick={() => setVisible(false)}
              className="flex items-center gap-3 px-5 py-3 hover:bg-background-secondary transition-colors no-underline"
            >
              <span className="text-lg shrink-0">{ICON[notif.type]}</span>
              <p className="text-sm text-foreground flex-1">{notif.label}</p>
              <span className="text-foreground/30 text-xs shrink-0">→</span>
            </Link>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-foreground/40 hover:text-foreground transition-colors w-full text-center"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}