'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import Image from 'next/image';
import { toast } from 'sonner';
import { EditableSection } from '@/components/editor/EditableSection';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import {
  updateBlockOrder,
  toggleBlockActive,
  deleteBlock,
  updateBlockContent,
  uploadBlockImage,
  removeBlockImage,
  updateBlockRatio,
  insertBlock,
} from '../clientQueries';
import { Block } from '../types';

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

    const newBlocks = [...contentOnly];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
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
    if (!await confirm({ message: 'Supprimer ce bloc ?', danger: true })) return;
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
        const photoOnRight = isEven;
        const ratio = block.image_ratio === '3/4' ? 'aspect-3/4' : 'aspect-4/3';

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
              {block.image_url ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    {photoOnRight ? (
                      <>
                        <EditableSection
                          page="home_block"
                          blockKey={block.id}
                          initialContent={block.content}
                          canEdit
                          onSaveOverrideAction={(content) => handleSaveContent(block.id, content)}
                        />
                        <ImageBlock
                          imageUrl={block.image_url}
                          ratio={ratio}
                          onUpload={(file) => handleUploadImage(block.id, file)}
                          onRemove={() => handleRemoveImage(block.id)}
                          onChangeRatio={(r) => handleChangeRatio(block.id, r)}
                        />
                      </>
                    ) : (
                      <>
                        <ImageBlock
                          imageUrl={block.image_url}
                          ratio={ratio}
                          onUpload={(file) => handleUploadImage(block.id, file)}
                          onRemove={() => handleRemoveImage(block.id)}
                          onChangeRatio={(r) => handleChangeRatio(block.id, r)}
                        />
                        <EditableSection
                          page="home_block"
                          blockKey={block.id}
                          initialContent={block.content}
                          canEdit
                          onSaveOverrideAction={(content) => handleSaveContent(block.id, content)}
                        />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                  <EditableSection
                    page="home_block"
                    blockKey={block.id}
                    initialContent={block.content}
                    canEdit
                    onSaveOverrideAction={(content) => handleSaveContent(block.id, content)}
                  />
                  <ImageBlock
                    imageUrl={block.image_url}
                    ratio={ratio}
                    onUpload={(file) => handleUploadImage(block.id, file)}
                    onRemove={() => handleRemoveImage(block.id)}
                    onChangeRatio={(r) => handleChangeRatio(block.id, r)}
                  />
                </div>
              )}
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

function ImageBlock({
  imageUrl,
  ratio,
  onUpload,
  onRemove,
  onChangeRatio,
}: {
  imageUrl: string | null;
  ratio: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onChangeRatio?: (ratio: '4/3' | '3/4') => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    e.target.value = '';
  }

  function handleConfirm() {
    if (!pendingFile) return;
    onUpload(pendingFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  function handleCancelPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  const displayUrl = previewUrl ?? imageUrl;
  const isPending = pendingFile !== null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative rounded-2xl overflow-hidden ${ratio} bg-background-tertiary flex items-center justify-center group`}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {isPending ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3">
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:opacity-80 text-white text-xs font-medium"
                >
                  ✓ Valider
                </button>
                <button
                  onClick={handleCancelPreview}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-xs">
                  Changer
                  <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
                <button
                  onClick={onRemove}
                  className="px-3 py-1.5 rounded-lg bg-red-500/70 hover:bg-red-500 text-white text-xs"
                >
                  Supprimer
                </button>
              </div>
            )}
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors">
            <span className="text-3xl">📷</span>
            <span className="text-sm">Ajouter une photo</span>
            <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Sélecteur ratio — uniquement si image présente et callback fourni */}
      {displayUrl && onChangeRatio && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onChangeRatio('4/3')}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${ratio === 'aspect-4/3' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
          >
            Paysage (4/3)
          </button>
          <button
            onClick={() => onChangeRatio('3/4')}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${ratio === 'aspect-3/4' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
          >
            Portrait (3/4)
          </button>
        </div>
      )}
    </div>
  );
}

function AddBlockForm({
  onSave,
  onCancel,
}: {
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('<h2>Nouveau bloc</h2><p>Votre contenu ici...</p>');

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary text-left">
      <h3 className="text-base font-medium mb-4 text-foreground">Nouveau bloc</h3>
      <RichEditor content={content} onChangeAction={setContent} placeholder="Contenu du bloc..." />
      <div className="flex gap-3 justify-end mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={() => onSave(content)}>Ajouter</Button>
      </div>
    </div>
  );
}
