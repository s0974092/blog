
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/post-card';
import { YooptaContentValue } from '@yoopta/editor';
import BlogListWrapper from '@/components/blog/BlogListWrapper';

const PAGE_SIZE = 5;

/**
 * Fetches the initial set of published posts from the database.
 * This function is intended to be used on the server side.
 */
async function getInitialPosts(): Promise<{ posts: Post[]; hasMore: boolean }> {
  try {
    const postsFromDb = await prisma.post.findMany({
      where: {
        published: true,
      },
      take: PAGE_SIZE,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        subcategory: true,
        tags: { include: { tag: true } },
      },
    });

    const totalPosts = await prisma.post.count({
      where: {
        published: true,
      },
    });

    const posts: Post[] = postsFromDb.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title ?? '',
      coverImageUrl: post.coverImageUrl ?? undefined,
      content: post.content as YooptaContentValue,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      published: post.published ?? false,
      category: post.category ? { id: post.category.id, name: post.category.name } : undefined,
      subcategory: post.subcategory ? { id: post.subcategory.id, name: post.subcategory.name } : undefined,
      tags: post.tags.map(postTag => ({ id: String(postTag.tag.id), name: postTag.tag.name }))
    }));

    return {
      posts,
      hasMore: totalPosts > PAGE_SIZE,
    };
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
    return {
      posts: [],
      hasMore: false,
    };
  }
}

/**
 * An async Server Component that fetches initial posts and renders the client-side
 * BlogListWrapper, passing the initial data to it. This component is designed
 * to be used within a React Suspense boundary to enable streaming.
 */
export default async function InitialPostFetcher() {
  const { posts, hasMore } = await getInitialPosts();
  return <BlogListWrapper initialPosts={posts} initialHasMore={hasMore} />;
}
