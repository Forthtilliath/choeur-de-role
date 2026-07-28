import { HeroAdmin } from '@/components/features/home/admin/HeroAdmin';
import { HomeBlocksAdmin } from '@/components/features/home/admin/HomeBlocksAdmin';
import { getHomeBlocks } from '@/components/features/home/queries';
import { getContentBlocks } from '@/lib/content';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminHomepagePage() {
  await handlePageAccess(isAdmin);

  const [contentBlocks, homeBlocks] = await Promise.all([
    getContentBlocks('home'),
    getHomeBlocks(),
  ]);

  const heroImage = contentBlocks.hero_image ?? '/images/chorale-groupe.jpg';
  const heroTitle = contentBlocks.hero_title ?? '';
  const heroSubtitle = contentBlocks.hero_subtitle ?? '';

  return (
    <main>
      <HeroAdmin heroTitle={heroTitle} heroSubtitle={heroSubtitle} heroImage={heroImage} />
      <HomeBlocksAdmin initialBlocks={homeBlocks} />
    </main>
  );
}
