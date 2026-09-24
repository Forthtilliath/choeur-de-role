import type { fetchMemberSearchData, fetchPublicSearchData } from './clientQueries';
import type { SearchItem } from './navSearchItems';

type PublicData = Awaited<ReturnType<typeof fetchPublicSearchData>>;
type MemberData = Awaited<ReturnType<typeof fetchMemberSearchData>>;

// Résultats dynamiques : concerts et actus pour tous, choristes/chants/calendrier pour les membres
export function buildDynamicSearchItems(
  { performances, news }: PublicData,
  memberData: MemberData | null,
): SearchItem[] {
  const items: SearchItem[] = [];

  performances.forEach((p) => {
    items.push({
      id: `p-${p.id}`,
      group: 'Concerts',
      label: p.title,
      href: `/concerts/${p.slug ?? ''}`,
      icon: '🎭',
    });
  });

  news.forEach((n) => {
    items.push({
      id: `n-${n.id}`,
      group: 'Actualités',
      label: n.title,
      href: `/choristes#news-${n.id}`,
      icon: '📰',
    });
  });

  if (memberData) {
    memberData.members.forEach((m) => {
      const name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
      if (!name) return;
      const vp = (m.voice_parts as { name: string } | null)?.name;
      items.push({
        id: `m-${m.id}`,
        group: 'Choristes',
        label: name,
        sublabel: vp,
        href: '/choristes/trombinoscope',
        icon: '👤',
      });
    });

    memberData.songs.forEach((s) => {
      items.push({
        id: `s-${s.id}`,
        group: 'Chants',
        label: s.title,
        href: `/choristes/repertoire/${s.id}`,
        icon: '🎵',
      });
    });

    memberData.events.forEach((e) => {
      const date = new Date(e.starts_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      items.push({
        id: `ev-${e.id}`,
        group: 'Calendrier',
        label: e.title,
        sublabel: date,
        href: `/choristes/calendrier/${e.id}`,
        icon: '📅',
      });
    });
  }

  return items;
}
