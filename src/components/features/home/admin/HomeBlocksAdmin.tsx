'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { EditableSection } from '@/components/editor/EditableSection';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { swapItems } from '@/utils/swapItems';

import {
  deleteBlock,
  insertBlock,
  removeBlockImage,
  toggleBlockActive,
  updateBlockContent,
  updateBlockOrder,
  updateBlockRatio,
  uploadBlockImage,
} from '../clientQueries';
import type { Block } from '../types';

import { AddBlockForm } from './AddBlockForm';
import { ImageBlock } from './ImageBlock';

type Props = {
  initialBlocks: Block[];
};

export function HomeBlocksAdmin({ initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(
    [...initialBlocks].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const confirm = useConfirm();

  const contentBlocks = blocks.filter((b) => !b.is_join_section);
  const joinBlock = blocks.find((b) => b.is_join_section);

  async function handleMove(id: string, direction: 'up' | 'down') {
    const contentOnly = blocks.filter((b) => !b.is_join_section);
    const index = contentOnly.findIndex((b) => b.id === id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === contentOnly.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = swapItems(contentOnly, index, swapIndex);
    const updated = newBlocks.map((b, i) => ({ ...b, order_index: i }));

    setBlocks([...updated, ...(joinBlock ? [joinBlock] : [])]);
    await Promise.all(updated.map((b) => updateBlockOrder(b.id, b.order_index ?? 0)));
  }

  async function handleToggleActive(block: Block) {
    await toggleBlockActive(block.id, !block.active);
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, active: !b.active } : b)));
    toast.success(block.active ? 'Bloc masqué' : 'Bloc affiché');
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: 'Supprimer ce bloc ?', danger: true }))) return;
    await deleteBlock(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bloc supprimé');
  }

  async function handleSaveContent(id: string, content: string) {
    await updateBlockContent(id, content);
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }

  async function handleUploadImage(id: string, file: File) {
    const publicUrl = await uploadBlockImage(id, file);
    if (publicUrl) {
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, image_url: publicUrl } : b)));
      toast.success('Image mise à jour');
    } else {
      toast.error("Erreur lors de l'upload de l'image");
    }
  }

  async function handleRemoveImage(id: string) {
    await removeBlockImage(id);
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, image_url: null } : b)));
    toast.success('Image supprimée');
  }

  async function handleChangeRatio(id: string, ratio: '4/3' | '3/4') {
    await updateBlockRatio(id, ratio);
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, image_ratio: ratio } : b)));
  }

  async function handleAddBlock(content: string) {
    const data = await insertBlock(content, contentBlocks.length);
    if (data) {
      setBlocks((prev) => [
        ...prev.filter((b) => !b.is_join_section),
        data,
        ...(joinBlock ? [joinBlock] : []),
      ]);
      setShowAddForm(false);
      toast.success('Bloc ajouté');
    } else {
      toast.error("Erreur lors de l'ajout du bloc");
    }
  }

  return (
    <div>
      {contentBlocks.map((block, index) => {
        const isEven = index % 2 === 0;
        const imageFirst = !!block.image_url && !isEven;
        const ratio = block.image_ratio === '3/4' ? 'aspect-3/4' : 'aspect-4/3';
        const image = (
          <ImageBlock
            imageUrl={block.image_url}
            ratio={ratio}
            onUpload={(file) => handleUploadImage(block.id, file)}
            onRemove={() => handleRemoveImage(block.id)}
            onChangeRatio={(r) => handleChangeRatio(block.id, r)}
          />
        );

        return (
          <section
            key={block.id}
            className={`py-10 md:py-20 px-4 relative ${isEven ? 'bg-background' : 'bg-background-secondary'} ${!block.active ? 'opacity-50' : ''}`}
          >
            {/* Barre d&apos;outils */}
            <div className="max-w-5xl mx-auto mb-4 flex items-center gap-2">
              <span className="text-xs text-foreground/40 mr-auto">
                Bloc {index + 1}
                {!block.active && ' · Masqué'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleMove(block.id, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleMove(block.id, 'down')}
                disabled={index === contentBlocks.length - 1}
              >
                ↓
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleToggleActive(block)}>
                {block.active ? 'Masquer' : 'Afficher'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(block.id)}>
                Supprimer
              </Button>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* Photo à droite un bloc sur deux ; sans photo, l'emplacement d'upload reste à droite */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                {imageFirst && image}
                <EditableSection
                  page="home_block"
                  blockKey={block.id}
                  initialContent={block.content}
                  canEdit
                  onSaveOverrideAction={(content) => handleSaveContent(block.id, content)}
                />
                {!imageFirst && image}
              </div>
            </div>
          </section>
        );
      })}

      {/* Ajouter un bloc */}
      <div className="py-12 px-4 text-center border-t border-border">
        {showAddForm ? (
          <div className="max-w-3xl mx-auto">
            <AddBlockForm onSave={handleAddBlock} onCancel={() => setShowAddForm(false)} />
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            + Ajouter un bloc
          </Button>
        )}
      </div>

      {/* Bloc Nous rejoindre — toujours en dernier, non déplaçable */}
      {joinBlock && (
        <section
          className={`py-10 md:py-20 px-4 ${contentBlocks.length % 2 ? 'bg-background-secondary' : 'bg-background'}`}
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4 flex justify-center">
              <span className="text-xs text-foreground/40 bg-background-tertiary px-3 py-1 rounded-full">
                Bloc fixe — Nous rejoindre
              </span>
            </div>
            <EditableSection
              page="home_block"
              blockKey={joinBlock.id}
              initialContent={joinBlock.content}
              canEdit
              onSaveOverrideAction={(content) => handleSaveContent(joinBlock.id, content)}
            />
            <div className="mt-8 flex gap-4 justify-center opacity-50 pointer-events-none">
              <Button>Nous contacter</Button>
              <Button variant="outline">Voir nos concerts</Button>
            </div>
            <p className="text-xs text-foreground/30 mt-3">
              Les boutons sont fixes et non modifiables
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
