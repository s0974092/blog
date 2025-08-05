'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import { toast } from 'sonner';
import type { Post } from '@/types/post-card';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import { AnimatePresence, motion } from 'framer-motion';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const PAGE_SIZE = 5;

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // 搜尋條件
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [sort, setSort] = useState('newest');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // 滾動方向監聽
  const scrollDirection = useScrollDirection();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    if (scrollDirection === 'down') {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  }, [scrollDirection]);

  // 載入文章
  const fetchPosts = useCallback(async (pageNum: number, opts?: { reset?: boolean }) => {
    if (opts?.reset) setIsResetLoading(true);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', String(categoryId));
      if (subCategoryId) params.append('subCategoryId', String(subCategoryId));
      if (sort) params.append('sort', sort);
      const res = await fetch(`/api/posts?${params}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '獲取文章列表失敗');
      const newPosts: Post[] = result.data.items || [];
      setPosts(prev => opts?.reset ? newPosts : (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === PAGE_SIZE);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '獲取文章列表失敗';
      toast.error('獲取文章列表失敗', { description: errorMessage });
    } finally {
      setLoading(false);
      if (opts?.reset) setIsResetLoading(false);
    }
  }, [search, categoryId, subCategoryId, sort]);

  // 初始載入 & 條件變更時重查
  useEffect(() => {
    fetchPosts(1, { reset: true });
  }, [fetchPosts]);

  // Intersection Observer 監聽底部
  useEffect(() => {
    if (!hasMore || loading) return;
    const currentLoaderRef = loaderRef.current;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 1 }
    );
    if (currentLoaderRef) observer.observe(currentLoaderRef);
    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
    };
  }, [hasMore, loading, fetchPosts, page]);

  return (
    // header 已搬到 layout.tsx，這裡只保留 main
    <main className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div 
        className={`sticky z-40 backdrop-blur bg-transparent rounded-lg p-2 transition-all duration-300 ease-in-out ${
          isHeaderVisible ? 'top-[84px]' : 'top-0'
        }`}
      >
        <BlogSearchBar
          search={search}
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          sort={sort}
          onChange={({ search, categoryId, subCategoryId, sort }) => {
            setSearch(search);
            setCategoryId(categoryId);
            setSubCategoryId(subCategoryId);
            setSort(sort);
          }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={search + '-' + categoryId + '-' + subCategoryId + '-' + sort}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {isResetLoading
            ? Array.from({ length: 5 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : [
                ...posts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onCategoryClick={id => {
                      setCategoryId(id || '');
                      setSubCategoryId('');
                      setSearch('');
                    }}
                    onSubCategoryClick={id => {
                      setSubCategoryId(id || '');
                      setCategoryId(post.category?.id || '');
                      setSearch('');
                    }}
                    onTagClick={name => {
                      setSearch(name);
                      setCategoryId('');
                      setSubCategoryId('');
                    }}
                  />
                )),
                ...(loading && hasMore ? Array.from({ length: 5 }).map((_, i) => <BlogCardSkeleton key={`sk${i}`} />) : [])
              ]}
        </motion.div>
      </AnimatePresence>
      <div ref={loaderRef} className="flex justify-center items-center py-8">
        {!hasMore && !loading && <div className="text-gray-400">已無更多文章</div>}
      </div>
    </main>
  );
} 