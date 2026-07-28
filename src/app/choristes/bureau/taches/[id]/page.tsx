import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTaskComments, getCategories, getCaMembers, getProject, getTasks } from '@/components/features/bureau/queries';
import { TaskBoard } from '@/components/features/bureau/TaskBoard';
import { getUserQuery } from '@/lib/auth';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project ? `${project.name} — Tâches` : 'Projet introuvable' };
}

export default async function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, user] = await Promise.all([getProject(id), getUserQuery()]);
  if (!project) notFound();

  const [tasks, comments, caMembers, categories] = await Promise.all([
    getTasks(id),
    getAllTaskComments(id),
    getCaMembers(),
    getCategories(),
  ]);

  return (
    <main className="px-4 py-6 md:py-10 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground/40 mb-6">
        <Link href="/choristes/bureau/taches" className="hover:text-foreground transition-colors">
          Tâches
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
        {!project.is_active && (
          <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/40">
            Archivé
          </span>
        )}
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-foreground/50 mt-1">{project.description}</p>
          )}
        </div>
        {!project.is_active && (
          <div className="shrink-0 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Ce projet est archivé — lecture seule
          </div>
        )}
      </div>

      <TaskBoard
        projectId={id}
        initialTasks={tasks}
        initialComments={comments}
        caMembers={caMembers}
        categories={categories}
        currentUserId={user.id ?? ''}
        isAdmin={user.isAdmin}
        readOnly={!project.is_active}
      />
    </main>
  );
}
