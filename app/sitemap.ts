import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  
  try {
    // 獲取所有部落格文章
    const res = await fetch(`${baseUrl}/api/posts`, {
      next: { revalidate: 3600 } // 快取1小時
    });
    
    if (!res.ok) {
      return [
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 1,
        },
        {
          url: `${baseUrl}/blog`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        },
      ];
    }

    const result = await res.json();
    // 確保 posts 是數組
    const posts = Array.isArray(result.data) ? result.data : [];

    const blogUrls = posts.map((post: { slug: string; updatedAt?: string; createdAt: string }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const sitemapUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...blogUrls,
    ];

    return sitemapUrls;
  } catch (error) {
    console.error('生成sitemap失敗:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
  }
} 