import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  try {
    // 直接從資料庫獲取所有已發布的文章
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const blogUrls = posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...blogUrls];
  } catch (error) {
    console.error('生成 sitemap 失敗:', error);
    // 即使獲取文章失敗，也回傳靜態路由
    return staticRoutes;
  }
}