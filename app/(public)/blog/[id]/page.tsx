import type { Metadata } from 'next';
import { getPostById } from '@/lib/prisma';
import BlogDetail from '@/components/blog/BlogDetail';
import { SITE_CONFIG } from '@/lib/constants';

type Props = {
  params: Promise<{ id: string }>;
};

// Helper function to extract plain text from Yoopta editor content
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: '文章未找到',
      description: '抱歉，您要查找的文章不存在。'
    };
  }

  const contentText = extractTextFromContent(post.content);
  const cleanDescription = contentText.replace(/返回首頁/g, '').trim();
  const description = cleanDescription.length > 150 
    ? cleanDescription.substring(0, 150) + '...' 
    : cleanDescription;
  const finalDescription = description.length > 10 ? description : (post.title || SITE_CONFIG.description);

  const keywords = [
    post.title,
    ...(post.tags?.map(tag => tag.tag.name) || []),
    post.category?.name,
  ].filter(Boolean) as string[];

  return {
    title: post.title,
    description: finalDescription,
    keywords: keywords,
    authors: [{ name: SITE_CONFIG.author }],
    openGraph: {
      title: post.title || '',
      description: finalDescription,
      type: 'article',
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      images: post.coverImageUrl ? [{
        url: post.coverImageUrl,
        width: 1200,
        height: 630,
        alt: post.title || '',
      }] : [],
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [SITE_CONFIG.author],
      tags: post.tags?.map(tag => tag.tag.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title || '',
      description: finalDescription,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <article>
      {/* 
        The `loading.tsx` file now acts as the Suspense boundary for this page.
        The <BlogDetail> component fetches its own data, and Next.js will automatically 
        show the loading.tsx UI during this data fetching process on navigation.
      */}
      <BlogDetail id={id} />
    </article>
  );
}