import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const isDevelopment = baseUrl.includes('localhost');
  
  const rules = [
    {
      userAgent: '*',
      allow: '/',
    },
    {
      userAgent: '*',
      allow: '/blog/',
    },
    {
      userAgent: '*',
      disallow: '/admin/',
    },
  ];

  // 只在生產環境禁止爬蟲訪問後台頁面
  if (!isDevelopment) {
    rules.push({
      userAgent: '*',
      disallow: '/dashboard/',
    });
    rules.push({
      userAgent: '*',
      disallow: '/posts/',
    });
    rules.push({
      userAgent: '*',
      disallow: '/categories/',
    });
    rules.push({
      userAgent: '*',
      disallow: '/sub-categories/',
    });
    rules.push({
      userAgent: '*',
      disallow: '/tags/',
    });
  }
  
  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 