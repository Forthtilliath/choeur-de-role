import type { Metadata } from 'next';
import { getProjects } from '@/components/features/bureau/queries';
import { ProjectList } from '@/components/features/bureau/ProjectList';

export const metadata: Metadata = { title: 'Tâches — Projets' };

export default async function TachesPage() {
  const projects = await getProjects();

  return (
    <main className="px-4 py-6 md:py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Tâches</h1>
        <p className="text-sm text-foreground/50 mt-1">
          {projects.filter((p) => p.is_active).length} projet{projects.filter((p) => p.is_active).length !== 1 ? 's' : ''} actif{projects.filter((p) => p.is_active).length !== 1 ? 's' : ''}
        </p>
      </div>
      <ProjectList projects={projects} />
    </main>
  );
}
