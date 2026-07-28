import { Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { HomeBlocks } from '@/components/features/home/HomeBlocks';
import { getHomeBlocks } from '@/components/features/home/queries';
import { getContentBlocks } from '@/lib/content';
import { getUserQuery } from '@/lib/auth';

async function HeroSection() {
  const [userInfo, contentBlocks] = await Promise.all([
    getUserQuery(),
    getContentBlocks('home'),
  ]);

  const heroImage = contentBlocks.hero_image ?? '/images/chorale-groupe.jpg';
  const heroTitle = contentBlocks.hero_title ?? '';
  const heroSubtitle = contentBlocks.hero_subtitle ?? '';
  const heroHeight = userInfo.isLoggedIn ? 'h-main-chorister' : 'h-main-visitor';

  return (
    <section className={`relative flex items-center justify-center h-main-visitor lg:${heroHeight}`}>
      <Image
        src={heroImage}
        alt="Le Chœur de Rôle"
        fill
        className="object-cover object-top"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-backdrop/25" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <div className="px-8 py-10 rounded-2xl backdrop-contrast-50 bg-backdrop/35 border border-white/15">
          <div dangerouslySetInnerHTML={{ __html: heroTitle }} className="text-white mdx-content" />
          <div
            dangerouslySetInnerHTML={{ __html: heroSubtitle }}
            className="mt-2 text-white/90 mdx-content"
          />
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

async function HomeBlocksSection() {
  const homeBlocks = await getHomeBlocks();
  const activeBlocks = homeBlocks.filter((b) => b.active);
  return <HomeBlocks blocks={activeBlocks} />;
}

export default function HomePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="relative h-main-visitor bg-muted/20 animate-pulse" />
        }
      >
        <HeroSection />
      </Suspense>
      <Suspense
        fallback={
          <div>
            <div className="py-10 md:py-20 px-4">
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-36 mt-2" />
                </div>
                <Skeleton className="aspect-4/3 rounded-2xl" />
              </div>
            </div>
            <div className="py-10 md:py-20 px-4 bg-background-secondary">
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                <Skeleton className="aspect-3/4 rounded-2xl" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <HomeBlocksSection />
      </Suspense>
    </main>
  );
}
