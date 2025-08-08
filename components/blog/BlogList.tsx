'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import { toast } from 'sonner';
import type { Post } from '@/types/post-card';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import { AnimatePresence, motion } from 'framer-motion';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import { useDebounce } from 'use-debounce';

const PAGE_SIZE = 5;

interface BlogListProps {
  initialPosts: Post[];
  initialHasMore: boolean;
  headerHeight: number; // 新增：接收 Header 高度
  isHeaderVisible: boolean; // 新增：接收 Header 可見性狀態
}

export default function BlogList({ initialPosts, initialHasMore, headerHeight, isHeaderVisible }: BlogListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // 搜尋條件
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('');
  const [sort, setSort] = useState('newest');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [debouncedSearch] = useDebounce(search, 300);
  const isInitialRender = useRef(true);

  // 載入文章
  const fetchPosts = useCallback(async (pageNum: number, opts?: { reset?: boolean }) => {
    if (opts?.reset) {
      setIsResetLoading(true);
      setPosts([]); // Reset posts immediately for a better UX
    } 
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (categoryId) params.append('categoryId', String(categoryId));
      if (subCategoryId) params.append('subCategoryId', String(subCategoryId));
      if (sort) params.append('sort', sort);
      const res = await fetch(`/api/posts?${params}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '獲取文章列表失敗');
      const newPosts: Post[] = result.data.items || [];
      setPosts(prev => opts?.reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === PAGE_SIZE);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '獲取文章列表失敗';
      toast.error('獲取文章列表失敗', { description: errorMessage });
    } finally {
      setLoading(false);
      if (opts?.reset) setIsResetLoading(false);
    }
  }, [debouncedSearch, categoryId, subCategoryId, sort]);

  const topOffset = headerHeight;

  // 初始載入 & 條件變更時重查
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    fetchPosts(1, { reset: true });
  }, [debouncedSearch, categoryId, subCategoryId, sort]);

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
    <>
      <div 
        className={`sticky z-40 backdrop-blur bg-transparent rounded-lg p-2 transition-all duration-300 ease-in-out`}
        style={{ top: isHeaderVisible ? `${topOffset}px` : '0px' }}
      >
        <BlogSearchBar
          search={search}
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          sort={sort}
          onChange={({ search, categoryId, subCategoryId, sort }) => {
            setPage(1); // Reset page number on filter change
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
            : posts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  priority={index === 0} // Only the first card gets priority
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
              ))}
          {loading && !isResetLoading && hasMore && Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={`sk-${i}`} />)}
        </motion.div>
      </AnimatePresence>
      <div ref={loaderRef} className="flex justify-center items-center py-8">
        {!hasMore && !loading && <div className="text-gray-400">已無更多文章</div>}
      </div>
    </>
  );
}
