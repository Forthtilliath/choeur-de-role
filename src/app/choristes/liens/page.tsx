import { LinkCard } from '@/components/features/liens';
import { getMemberLinksQuery } from '@/components/features/liens/queries';
import { Button } from '@/components/ui/Button';
import { Main } from '@/components/ui/Main';
import { handlePageAccess } from '@/lib/auth';

export default async function LiensPage() {
  const { isCa: canEdit } = await handlePageAccess();
  const links = await getMemberLinksQuery();

  return (
    <Main
      variant="choriste"
      title="Liens utiles"
      actions={
        canEdit && (
          <Button href="/choristes/admin/liens" variant="outline" size="sm">
            ⚙️ Gérer les liens
          </Button>
        )
      }
    >
      {(!links || links.length === 0) && (
        <p className="text-foreground/50 text-center py-12">Aucun lien pour le moment.</p>
      )}

      <div className="flex flex-col gap-3">
        {links?.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </Main>
  );
}
