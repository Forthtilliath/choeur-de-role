import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { getSitemapPerformances } from '@/components/features/concerts/queries';
import { getSitemapExternalEvents } from '@/components/features/externals/queries';
import { getGalleryLastUpdated } from '@/components/features/galerie/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [performances, events, galerieLastModified] = await Promise.all([
    getSitemapPerformances(),
    getSitemapExternalEvents(),
    getGalleryLastUpdated(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                      lastModified: new Date(), priority: 1.0, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/concerts`,        lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/evenements`,      lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${SITE_URL}/galerie`,         lastModified: galerieLastModified, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/partenaires`,     lastModified: new Date(), priority: 0.6, changeFrequency: 'yearly'  },
    { url: `${SITE_URL}/contact`,         lastModified: new Date(), priority: 0.5, changeFrequency: 'yearly'  },
  ];

  const performanceRoutes: MetadataRoute.Sitemap = (performances ?? []).map((p) => ({
    url: `${SITE_URL}/concerts/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }));

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${SITE_URL}/evenements/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    priority: 0.6,
    changeFrequency: 'weekly' as const,
  }));

  return [...staticRoutes, ...performanceRoutes, ...eventRoutes];
}
