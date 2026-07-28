import { MeetingCard } from '@/components/features/ca';
import { getCaMeetingsQuery } from '@/components/features/ca/queries';
import { Button } from '@/components/ui/Button';
import { Main } from '@/components/ui/Main';
import { getUserQuery } from '@/lib/auth';

export default async function CAPage() {
  const { isCa: canEdit } = await getUserQuery();
  const meetings = await getCaMeetingsQuery();

  return (
    <Main
      variant="choriste"
      title="CA"
      actions={
        canEdit && (
          <Button href="/choristes/admin/ca" variant="outline" size="sm">
            ⚙️ Gérer les CR
          </Button>
        )
      }
    >

      {meetings.length === 0 && (
        <p className="text-foreground/50 text-center py-12">Aucun compte-rendu pour le moment.</p>
      )}

      <div className="flex flex-col gap-4">
        {meetings.map((meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </Main>
  );
}
