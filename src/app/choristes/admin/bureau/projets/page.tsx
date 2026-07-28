import type { Metadata } from 'next';
import { getProjects, getTemplates } from '@/components/features/bureau/queries';
import { ProjectsAdmin } from '@/components/features/bureau/admin/ProjectsAdmin';

export const metadata: Metadata = { title: 'Admin — Projets' };

export default async function AdminProjetsPage() {
  const [projects, templates] = await Promise.all([getProjects(), getTemplates()]);
  return (
    <main className="px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Projets</h1>
        <p className="text-sm text-foreground/50 mt-1">Créer, activer ou archiver les projets du tableau de tâches.</p>
      </div>
      <ProjectsAdmin projects={projects} templates={templates} />
    </main>
  );
}
