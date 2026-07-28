import type { Metadata } from 'next';
import { getTemplates } from '@/components/features/bureau/queries';
import { TemplatesAdmin } from '@/components/features/bureau/admin/TemplatesAdmin';

export const metadata: Metadata = { title: 'Admin — Templates' };

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();
  return (
    <main className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Templates</h1>
        <p className="text-sm text-foreground/50 mt-1">Créer des listes de tâches types réutilisables pour initialiser de nouveaux projets.</p>
      </div>
      <TemplatesAdmin templates={templates} />
    </main>
  );
}
