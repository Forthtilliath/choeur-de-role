'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import { EditableSection } from '@/components/editor/EditableSection';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase.client';
import { useImagePreview } from '@/hooks/useImagePreview';

type Props = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
};

export function HeroAdmin({ heroTitle, heroSubtitle, heroImage }: Props) {
  const [currentImage, setCurrentImage] = useState(heroImage ?? '/images/chorale-groupe.jpg');

  const heroInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl: heroPreviewUrl,
    isPending: heroIsPending,
    uploading: heroUploading,
    handleSelect: handleHeroSelect,
    confirm: confirmHero,
    cancel: cancelHero,
  } = useImagePreview(async (file) => {
    const supabase = createClient();
    try {
      const publicUrl = await uploadImageToR2(file, 'home/hero.webp');
      setCurrentImage(publicUrl);
      await supabase
        .from('content_blocks')
        .upsert(
          { page: 'home', block_key: 'hero_image', content: publicUrl },
          { onConflict: 'page,block_key' },
        );
      toast.success('Image hero mise à jour');
    } catch (err) {
      toast.error("Erreur lors de l'upload de l'image");
      throw err;
    }
  });

  async function saveBlock(blockKey: string, content: string) {
    const supabase = createClient();
    await supabase
      .from('content_blocks')
      .upsert({ page: 'home', block_key: blockKey, content }, { onConflict: 'page,block_key' });
  }

  return (
    <section className="relative flex items-center justify-center h-[calc(100dvh-var(--spacing-header-chorister))]">
      <Image
        src={heroPreviewUrl ?? currentImage}
        alt="Le Chœur de Rôle"
        fill
        sizes="100vw"
        className="object-cover object-top"
        priority
      />
      <div className="absolute inset-0 bg-backdrop/25" />

      {/* Bouton changer photo hero */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        {heroIsPending ? (
          <>
            <Button
              variant="primary"
              size="sm"
              disabled={heroUploading}
              onClick={confirmHero}
            >
              {heroUploading ? 'Upload...' : '✓ Valider'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={heroUploading}
              onClick={cancelHero}
            >
              Annuler
            </Button>
          </>
        ) : (
          <Button
            variant="white"
            size="sm"
            onClick={() => heroInputRef.current?.click()}
          >
            📷 Changer la photo
          </Button>
        )}
        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          onChange={handleHeroSelect}
          className="hidden"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <div className="px-8 py-10 rounded-2xl bg-backdrop/35 border border-white/15 backdrop-contrast-50">
          <div className="[&_.mdx-content]:text-white">
            <EditableSection
              page="home"
              blockKey="hero_title"
              initialContent={heroTitle}
              canEdit
              dark
              onSaveOverrideAction={(content) => saveBlock('hero_title', content)}
            />
          </div>
          <div className="mt-2 [&_.mdx-content]:text-white/90">
            <EditableSection
              page="home"
              blockKey="hero_subtitle"
              initialContent={heroSubtitle}
              canEdit
              dark
              onSaveOverrideAction={(content) => saveBlock('hero_subtitle', content)}
            />
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <Button href="/concerts">Nos concerts</Button>
            <Button href="/contact" variant="white">
              Nous contacter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
