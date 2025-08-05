import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Post } from '@/types/post-card';
import { BlogDetail } from '@/components/blog/BlogDetail';
import { SITE_CONFIG } from '@/lib/constants';

// 生成動態metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${SITE_CONFIG.url}/api/posts/${id}`, {
      next: { revalidate: 3600 } // 快取1小時
    });
    
    if (!res.ok) {
      return {
        title: '文章未找到',
        description: '抱歉，您要查找的文章不存在。'
      };
    }

    const result = await res.json();
    const post: Post = result.data;

    if (!post) {
      return {
        title: '文章未找到',
        description: '抱歉，您要查找的文章不存在。'
      };
    }

    // 提取文章內容的前200個字元作為描述
    const contentText = extractTextFromContent(post.content);
    const description = contentText.length > 200 
      ? contentText.substring(0, 200) + '...' 
      : contentText;

    // 生成關鍵字
    const keywords = [
      post.title,
      ...(post.tags?.map(tag => tag.name) || []),
      post.category?.name,
      '部落格',
      '文章'
    ].filter(Boolean).join(', ');

    return {
      title: `${post.title}`,
      description,
      keywords,
      authors: [{ name: SITE_CONFIG.author }],
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        url: `${SITE_CONFIG.url}/blog/${post.slug}`,
        images: post.coverImageUrl ? [
          {
            url: post.coverImageUrl,
            width: 200,
            height: 630,
            alt: post.title,
          }
        ] : [],
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        authors: [SITE_CONFIG.author],
        tags: post.tags?.map(tag => tag.name) || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
      },
    };
  } catch (error) {
    console.error('生成metadata失敗:', error);
    return {
      title: '部落格文章',
      description: '閱讀精彩的部落格文章。'
    };
  }
}

// 從內容中提取純文字
function extractTextFromContent(content: unknown): string {
  if (!content) return '';
  
  let text = '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    content.forEach(item => {
      if (typeof item === 'object' && item !== null && 'type' in item && 'children' in item) {
        const typedItem = item as { type: string; children?: unknown[] };
        if (typedItem.type === 'paragraph' && typedItem.children) {
          typedItem.children.forEach((child: unknown) => {
            if (typeof child === 'object' && child !== null && 'text' in child) {
              const typedChild = child as { text?: string };
              if (typedChild.text) {
                text += typedChild.text;
              }
            }
          });
          text += ' ';
        } else if (typedItem.type === 'heading' && typedItem.children) {
          typedItem.children.forEach((child: unknown) => {
            if (typeof child === 'object' && child !== null && 'text' in child) {
              const typedChild = child as { text?: string };
              if (typedChild.text) {
                text += typedChild.text;
              }
            }
          });
          text += ' ';
        }
      }
    });
  }
  
  return text.trim();
}

// 生成結構化資料
function generateStructuredData(post: Post) {
  const contentText = extractTextFromContent(post.content);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: contentText.length > 200 ? contentText.substring(0, 200) + '...' : contentText,
    image: post.coverImageUrl ? [post.coverImageUrl] : [],
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`
      }
    },
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`
    },
    articleSection: post.category?.name,
    keywords: post.tags?.map(tag => tag.name).join(', '),
    wordCount: contentText.length,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${SITE_CONFIG.url}/api/posts/${id}`, {
      next: { revalidate: 3600 } // 快取1小時
    });
    
    if (!res.ok) {
      notFound();
    }

    const result = await res.json();
    const post: Post = result.data;

    if (!post) {
      notFound();
    }

    const structuredData = generateStructuredData(post);

    return (
      <>
        {/* 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* 客戶端組件處理互動功能 */}
        <BlogDetail post={post} />
      </>
    );
  } catch (error) {
    console.error('獲取文章失敗:', error);
    notFound();
  }
} 