'use client';

import BlogList from '@/components/blog/BlogList';
import { usePublicLayout } from '@/components/layout/public/PublicLayout';
import type { Post } from '@/types/post-card';

interface BlogListWrapperProps {
  initialPosts: Post[];
  initialHasMore: boolean;
}

export default function BlogListWrapper({ initialPosts, initialHasMore }: BlogListWrapperProps) {
  const { headerHeight, isHeaderVisible } = usePublicLayout();

  return (
    <BlogList 
      initialPosts={initialPosts} 
      initialHasMore={initialHasMore} 
      headerHeight={headerHeight} 
      isHeaderVisible={isHeaderVisible}
    />
  );
}
