import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const isDevelopment = process.env.NODE_ENV === 'development' || baseUrl.includes('localhost');
  
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
    const posts = result.data || [];

    const blogUrls = posts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
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