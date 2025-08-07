import BlogList from '@/components/blog/BlogList';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/post-card';
import { YooptaContentValue } from '@yoopta/editor';

const PAGE_SIZE = 5;

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
        tags: { include: { tag: true } }, // Include the tag details
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
      title: post.title ?? '', // Provide a default value for title
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

export default async function BlogPage() {
  const { posts, hasMore } = await getInitialPosts();

  return (
    <main className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BlogList initialPosts={posts} initialHasMore={hasMore} />
    </main>
  );
}