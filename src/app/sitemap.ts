import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const baseUrl = 'https://www.otosipsak.com';

const staticRoutes = [
  '',
  '/araba-al',
  '/arac-sat',
  '/motosiklet-sat',
  '/konsinye-birak',
  '/blog',
  '/hakkimizda',
  '/iletisim',
  '/kurumsal',
  '/kariyer',
  '/sss',
  '/form',
  '/cerez-politikasi',
  '/gizlilik-ve-sartlar',
  '/satis-ve-odeme-kosullari',
  '/ekspertiz-kosullari'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7
  }));

  try {
    const [blogPosts, listings] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true }
      }),
      prisma.listing.findMany({
        where: { status: 'published' },
        select: { id: true, updatedAt: true }
      })
    ]);

    const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8
    }));

    const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${baseUrl}/araba-al/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9
    }));

    return [...staticEntries, ...blogEntries, ...listingEntries];
  } catch (error) {
    console.error('Failed to generate sitemap dynamic entries', error);
    return staticEntries;
  }
}
