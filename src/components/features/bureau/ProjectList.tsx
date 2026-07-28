'use client';

import Link from 'next/link';
import type { TaskProject } from '@/types/tasks';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function ProjectList({ projects }: { projects: TaskProject[] }) {
  const active = projects.filter((p) => p.is_active);
  const archived = projects.filter((p) => !p.is_active);

  return (
    <div className="flex flex-col gap-8">
      {active.length === 0 && archived.length === 0 && (
        <p className="text-sm text-foreground/40 text-center py-12 italic">
          Aucun projet pour l&apos;instant.
        </p>
      )}

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Archivés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archived.map((p) => (
              <ProjectCard key={p.id} project={p} archived />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project, archived = false }: { project: TaskProject; archived?: boolean }) {
  return (
    <Link
      href={`/choristes/bureau/taches/${project.id}`}
      className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:shadow-md ${
        archived
          ? 'border-border bg-background-secondary opacity-60 hover:opacity-80'
          : 'border-border bg-background hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </span>
          {project.description && (
            <span className="text-xs text-foreground/50 line-clamp-2">{project.description}</span>
          )}
        </div>
        {archived ? (
          <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/40">
            Archivé
          </span>
        ) : (
          <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1" title="Actif" />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-foreground/40">
        <span>
          {project.task_count} tâche{project.task_count !== 1 ? 's' : ''}
        </span>
        <span>Modifié le {formatDate(project.updated_at)}</span>
      </div>
    </Link>
  );
}
