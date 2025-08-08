import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Post } from '@/types/post-card';
import { BlogDetail } from '@/components/blog/BlogDetail';
import { SITE_CONFIG } from '@/lib/constants';

// 輔助函數：獲取文章資料
async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${SITE_CONFIG.url}/api/posts/${id}`, {
      next: { revalidate: 3600 } // 快取1小時
    });
    
    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    return result.data as Post;
  } catch (error) {
    console.error('獲取文章失敗:', error);
    return null;
  }
}

// 生成動態metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
      return {
        title: '文章未找到',
        description: '抱歉，您要查找的文章不存在。'
      };
    }

    // 提取文章內容的前200個字元作為描述
    const contentText = extractTextFromContent(post.content);
    // 過濾掉 UI 相關文字
    const cleanDescription = contentText
      .replace(/返回首頁/g, '')
      .trim();
    
    const description = cleanDescription.length > 200 
      ? cleanDescription.substring(0, 200) + '...' 
      : cleanDescription;

    // 如果動態生成的 description 過短或為空，則使用 SITE_CONFIG.description 作為備用
    const finalDescription = description.length > 10 ? description : SITE_CONFIG.description;

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
      description: finalDescription,
      keywords,
      authors: [{ name: SITE_CONFIG.author }],
      openGraph: {
        title: post.title,
        description: finalDescription,
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
        description: finalDescription,
        images: post.coverImageUrl ? [post.coverImageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
      },
      other: {
        'og:description': finalDescription,
        'twitter:description': finalDescription,
      },
    };
  } catch (error) {
    console.error('生成metadata失敗:', error);
    return {
      title: '部落格文章',
      description: SITE_CONFIG.description // 使用 SITE_CONFIG.description 作為錯誤時的備用
    };
  }
}

// 從內容中提取純文字 (遞迴處理)
function extractTextFromContent(content: unknown): string {
  if (!content) return '';
  
  let text = '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    content.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        if ('text' in item && typeof (item as { text?: string }).text === 'string') {
          text += (item as { text: string }).text;
        } else if ('children' in item && Array.isArray((item as { children?: unknown[] }).children)) {
          text += extractTextFromContent((item as { children: unknown[] }).children) + ' ';
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
    const post = await getPost(id);

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