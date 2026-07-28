import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getTemplateWithItems } from '@/components/features/bureau/queries';
import { TemplateEditor } from '@/components/features/bureau/admin/TemplateEditor';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await getTemplateWithItems(id);
  return { title: result ? `${result.template.name} — Template` : 'Template introuvable' };
}

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [result, categories] = await Promise.all([
    getTemplateWithItems(id),
    getCategories(),
  ]);
  if (!result) notFound();

  return (
    <main className="px-6 py-8 max-w-4xl mx-auto">
      <TemplateEditor template={result.template} initialItems={result.items} categories={categories} />
    </main>
  );
}
