
import { notFound } from 'next/navigation';
import { BlogDetailClient } from './BlogDetailClient';
import type { Post } from '@/types/post-card';
import { YooptaContentValue } from '@yoopta/editor';
import { getPostById } from '@/lib/prisma';
import { SITE_CONFIG } from '@/lib/constants';

interface BlogDetailProps {
  id: string;
}

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

// Generates JSON-LD structured data for the blog post
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
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/yj-brand-logo.png`
      }
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`
    },
    articleSection: post.category?.name,
    keywords: post.tags?.map(tag => tag.name).join(', '),
  };
}

export default async function BlogDetail({ id }: BlogDetailProps) {
  const postFromDb = await getPostById(id);

  if (!postFromDb || !postFromDb.published) {
    notFound();
  }

  const post: Post = {
    id: postFromDb.id,
    slug: postFromDb.slug,
    title: postFromDb.title ?? '',
    coverImageUrl: postFromDb.coverImageUrl ?? undefined,
    content: postFromDb.content as YooptaContentValue,
    createdAt: postFromDb.createdAt.toISOString(),
    updatedAt: postFromDb.updatedAt.toISOString(),
    published: postFromDb.published ?? false,
    category: postFromDb.category ? { id: postFromDb.category.id, name: postFromDb.category.name } : undefined,
    subcategory: postFromDb.subcategory ? { id: postFromDb.subcategory.id, name: postFromDb.subcategory.name } : undefined,
    tags: postFromDb.tags.map(postTag => ({ id: String(postTag.tag.id), name: postTag.tag.name }))
  };

  const structuredData = generateStructuredData(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <BlogDetailClient post={post} />
    </>
  );
}
