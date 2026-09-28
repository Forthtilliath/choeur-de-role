import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { StaffDivider } from '@/components/ui/StaffDivider';

import type { Block } from './types';

type Props = {
  blocks: Block[];
};

// Photo posée sur la table comme une carte, légèrement de biais (sens alterné)
function BlockImage({
  src,
  ratio,
  tilt,
  priority,
}: {
  src: string;
  ratio: string;
  tilt: 'left' | 'right';
  priority: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden max-md:order-0 ${ratio} ring-1 ring-secondary/50 shadow-xl transition-transform duration-500 hover:rotate-0 ${tilt === 'left' ? 'md:-rotate-1' : 'md:rotate-1'}`}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
    </div>
  );
}

export function HomeBlocks({ blocks }: Props) {
  const contentBlocks = blocks.filter((b) => !b.is_join_section);
  const joinBlock = blocks.find((b) => b.is_join_section);
  const firstImageIndex = contentBlocks.findIndex((b) => b.image_url);
  const joinOnSecondary = contentBlocks.length % 2 === 1;

  return (
    <div>
      {contentBlocks.map((block, index) => {
        const isEven = index % 2 === 0;
        const photoOnRight = isEven;
        const ratio = block.image_ratio === '3/4' ? 'aspect-3/4' : 'aspect-4/3';
        const content = <SafeHtml className="mdx-content max-md:order-1" html={block.content} />;

        return (
          <section
            key={block.id}
            className={`py-10 md:py-20 px-4 ${isEven ? 'bg-background' : 'bg-background-secondary bg-board'}`}
          >
            <div className="max-w-5xl mx-auto">
              {block.image_url ? (
                <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                  {photoOnRight && content}
                  <BlockImage
                    src={block.image_url}
                    ratio={ratio}
                    tilt={photoOnRight ? 'right' : 'left'}
                    priority={index === firstImageIndex}
                  />
                  {!photoOnRight && content}
                </div>
              ) : (
                <SafeHtml className="mdx-content max-w-3xl mx-auto" html={block.content} />
              )}
            </div>
          </section>
        );
      })}

      {/* Bloc Nous rejoindre — toujours en dernier, présenté comme une carte d'invitation */}
      {joinBlock && (
        <section
          className={`py-10 md:py-20 px-4 ${joinOnSecondary ? 'bg-background-secondary bg-board' : 'bg-background'}`}
        >
          <div className="max-w-2xl mx-auto text-center card-game px-6 py-10 md:px-12">
            <StaffDivider symbol="♛" className="mb-8" />
            <SafeHtml className="mdx-content" html={joinBlock.content} />
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button href="/contact">Nous contacter</Button>
              <Button href="/concerts" variant="outline">
                Voir nos concerts
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
