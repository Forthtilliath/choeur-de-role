import type { Metadata } from 'next';
import {
  Calendar,
  ImageIcon,
  Music,
  Newspaper,
  Users,
  Vote,
  Mic2,
} from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from '@/components/features/dashboard/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Tableau de bord' };

const ACTION_LABELS: Record<string, string> = {
  member_create: 'Membre créé',
  member_update: 'Membre modifié',
  member_delete: 'Membre supprimé',
  password_reset: 'Mot de passe réinitialisé',
  password_reset_all: 'Réinit. générale des mots de passe',
  email_change: 'Email modifié',
  resend_invite: 'Invitation renvoyée',
  member_locked: 'Compte verrouillé',
  member_unlocked: 'Compte déverrouillé',
};

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border border-border rounded-2xl p-5 bg-background-secondary flex flex-col gap-3 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
    >
      <div className="flex items-center gap-2 text-foreground/50 group-hover:text-primary/70 transition-colors">
        <Icon size={15} />
        <span className="text-xs font-medium uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-foreground/40">{sub}</p>}
    </Link>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${datePart} à ${h}h${m}`;
}

export default async function TableauDeBordPage() {
  await handlePageAccess(isAdmin);
  const stats = await getDashboardStats();

  return (
    <Main variant="admin" size="lg" title="Tableau de bord">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            title="Membres"
            value={stats.members.total}
            href="/choristes/admin/membres"
          />
          <StatCard
            icon={Calendar}
            title="Séances à venir"
            value={stats.concerts.upcomingDates}
            sub="dates de concert"
            href="/choristes/admin/concerts"
          />
          <StatCard
            icon={Music}
            title="Répertoire"
            value={stats.repertoire.songs}
            sub={`chants — ${stats.repertoire.files} fichier${stats.repertoire.files !== 1 ? 's' : ''}`}
            href="/choristes/admin/mediatheque"
          />
          <StatCard
            icon={ImageIcon}
            title="Galerie"
            value={stats.galerie.albums}
            sub={`albums — ${stats.galerie.photos} photo${stats.galerie.photos !== 1 ? 's' : ''}`}
            href="/choristes/admin/galerie"
          />
          <StatCard
            icon={Newspaper}
            title="Actualités"
            value={stats.news.published}
            sub={`publiées — ${stats.news.drafts} brouillon${stats.news.drafts !== 1 ? 's' : ''}`}
            href="/choristes/admin"
          />
          <StatCard
            icon={Vote}
            title="Sondages actifs"
            value={stats.polls.active}
            href="/choristes/admin/sondages"
          />
        </div>

        {stats.currentSeason && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
              Saison en cours · {stats.currentSeason.label}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard
                icon={Users}
                title="Choristes"
                value={stats.currentSeason.choristes}
                sub="inscrits cette saison"
                href="/choristes/admin/membres"
              />
              <StatCard
                icon={Calendar}
                title="Concerts"
                value={stats.currentSeason.representations}
                sub="cette saison"
                href="/choristes/admin/concerts"
              />
              <StatCard
                icon={Music}
                title="Chants"
                value={stats.currentSeason.chants}
                sub="au programme cette saison"
                href="/choristes/admin/mediatheque"
              />
            </div>
            {stats.currentSeason.byVoicePart.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mic2 size={13} className="text-foreground/40" />
                  <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
                    Choristes par pupitre
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {stats.currentSeason.byVoicePart.map((vp) => (
                    <Link
                      key={vp.name}
                      href="/choristes/admin/membres"
                      className="border border-border rounded-2xl p-4 bg-background-secondary flex flex-col gap-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide truncate">
                        {vp.name}
                      </span>
                      <p className="text-3xl font-bold text-foreground">{vp.count}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {stats.auditLogs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
              Activité récente
            </h2>
            <div className="border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background-secondary">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide">
                      Action
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide hidden sm:table-cell">
                      Auteur
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide hidden md:table-cell">
                      IP
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-foreground text-sm">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                        {log.target_name && (
                          <span className="text-xs text-foreground/50 block mt-0.5">
                            → {log.target_name}
                          </span>
                        )}
                        {!log.target_name && typeof log.details?.email === 'string' && (
                          <span className="text-xs text-foreground/40 block mt-0.5">
                            {log.details.email}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground/60 hidden sm:table-cell">
                        {log.actor_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-foreground/40 font-mono text-xs hidden md:table-cell">
                        {log.ip ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-foreground/40 text-right text-xs whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Main>
  );
}
