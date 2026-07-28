import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { notFound } from 'next/navigation';
import { handlePageAccess } from '@/lib/auth';
import { r2, R2_BUCKET } from '@/lib/r2';
import { createServerClient } from '@/lib/supabase.server';
import { Main } from '@/components/ui/Main';
import { getSongFileById } from '@/components/features/repertoire/queries';

async function buildSignedUrl(fileUrl: string): Promise<string | null> {
  if (fileUrl.startsWith('r2://')) {
    const key = fileUrl.slice(5);
    return getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), { expiresIn: 3600 });
  }
  // Legacy Supabase
  const supabase = await createServerClient();
  const urlParts = fileUrl.split('/repertoire/');
  const filePath = urlParts[urlParts.length - 1];
  const { data } = await supabase.storage.from('repertoire').createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}

export default async function FichierPage({ params }: { params: Promise<{ id: string }> }) {
  await handlePageAccess();
  const { id } = await params;

  const file = await getSongFileById(id);
  if (!file) notFound();

  const signedUrl = await buildSignedUrl(file.file_url);

  const typeLabel =
    file.type === 'audio' ? '🎵 Audio' : file.type === 'score' ? '📄 Partition' : '📝 Paroles';
  const songTitle = (file.songs as { title: string } | null)?.title ?? 'Sans titre';
  const fileLabel = file.label ? ` — ${file.label}` : '';

  return (
    <Main variant="choriste" title={songTitle}>
      <div className="flex flex-col gap-6 max-w-lg mx-auto pt-4">
        <div className="rounded-xl border border-border p-5 flex flex-col gap-1">
          <span className="text-xs text-foreground/40 uppercase tracking-wide">Fichier</span>
          <p className="text-foreground font-medium">
            {typeLabel}{fileLabel}
          </p>
        </div>

        {signedUrl ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-medium hover:bg-primary/90 transition-colors text-center"
          >
            Ouvrir le fichier ↗
          </a>
        ) : (
          <p className="text-sm text-foreground/50 text-center">Ce fichier n&apos;est pas accessible.</p>
        )}
      </div>
    </Main>
  );
}
