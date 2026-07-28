import { DocumentationClient } from '@/components/features/documentation/DocumentationClient';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function DocumentationPage() {
  await handlePageAccess(isAdmin);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-medium text-foreground">Documentation</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Guide d&apos;utilisation du site — à destination des administrateurs.
        </p>
      </div>
      <DocumentationClient />
    </main>
  );
}
