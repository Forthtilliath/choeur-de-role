import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Block } from './types';

type Props = {
  blocks: Block[];
};

export function HomeBlocks({ blocks }: Props) {
  const contentBlocks = blocks.filter((b) => !b.is_join_section);
  const joinBlock = blocks.find((b) => b.is_join_section);
  const firstImageIndex = contentBlocks.findIndex((b) => b.image_url);

  return (
    <div>
      {contentBlocks.map((block, index) => {
        const isEven = index % 2 === 0;
        const photoOnRight = isEven;
        const ratio = block.image_ratio === '3/4' ? 'aspect-3/4' : 'aspect-4/3';

        const isFirst = index === firstImageIndex;

        return (
          <section
            key={block.id}
            className={`py-10 md:py-20 px-4 ${isEven ? 'bg-background' : 'bg-background-secondary'}`}
          >
            <div className="max-w-5xl mx-auto">
              {block.image_url ? (
                <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                  {photoOnRight ? (
                    <>
                      <div
                        className="mdx-content max-md:order-1"
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                      <div className={`relative rounded-2xl overflow-hidden max-md:order-0 ${ratio}`}>
                        <Image
                          src={block.image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={isFirst}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`relative rounded-2xl overflow-hidden max-md:order-0 ${ratio}`}>
                        <Image
                          src={block.image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={isFirst}
                        />
                      </div>
                      <div
                        className="mdx-content max-md:order-1"
                        dangerouslySetInnerHTML={{ __html: block.content }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="mdx-content max-w-3xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
            </div>
          </section>
        );
      })}

      {/* Bloc Nous rejoindre — toujours en dernier */}
      {joinBlock && (
        <section
          className={`py-10 md:py-20 px-4 ${contentBlocks.length % 2 ? 'bg-background-secondary' : 'bg-background'}`}
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="mdx-content" dangerouslySetInnerHTML={{ __html: joinBlock.content }} />
            <div className="mt-8 flex gap-4 justify-center">
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
