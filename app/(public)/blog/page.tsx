import BlogListWrapper from '@/components/blog/BlogListWrapper';
import { prisma } from '@/lib/prisma';
import type { Post } from '@/types/post-card';
import { YooptaContentValue } from '@yoopta/editor';

/**
 * 設定頁面重新驗證時間為 60 秒 (Incremental Static Regeneration, ISR)。
 * 這表示部落格列表頁面最多每 60 秒重新生成一次。
 * 在 60 秒內，Next.js 會提供快取版本的頁面，以提高性能。
 * 當有新的請求進來時，如果距離上次重新驗證超過 60 秒，Next.js 會在背景重新獲取資料並重新生成頁面，
 * 然後在下次請求時提供新的頁面。
 * 這有助於平衡資料的即時性與伺服器負載。
 */
export const revalidate = 60;

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
      <BlogListWrapper initialPosts={posts} initialHasMore={hasMore} />
    </main>
  );
}