'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types/post-card';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { PostEditor } from '@/components/post/PostEditor';
import ArticleToc from '@/components/blog/ArticleToc';
import ScrollToTop from '@/components/blog/ScrollToTop';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ProgressBarToggle from '@/components/blog/ProgressBarToggle';
import { useActiveHeading, useHeadings, TocHeading } from '@/hooks/useActiveHeading';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.id; // id 實際上是 slug
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [activeId, setActiveId] = useState('');
  const [showTopProgressBar, setShowTopProgressBar] = useState(true);
  
  // 使用自定義 hook 來解析標題
  const headings = useHeadings(post?.content);
  
  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts/${slug}`);
      const result = await res.json();
      setPost(result.data);
    }
    if (slug) fetchPost();
  }, [slug]);

  // 使用自定義 hook 來處理高亮
  useActiveHeading(setActiveId, [post?.content, headings.length]);
  
  if (!post) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

  return (
    <>
      {/* 頂部閱讀進度條（可選） */}
      {showTopProgressBar && <ReadingProgressBar variant="top" />}
      
      <div className="relative max-w-5xl mx-auto py-8 px-4">
        {/* 主內容區塊，右側預留 TOC 空間 */}
        <div className={cn("flex-1 min-w-0", headings.length > 0 ? "lg:pr-[288px]" : "")}>
          <Link href="/blog" className="text-blue-600 mb-4 inline-block hover:text-blue-700 transition-colors">
            &larr; 返回列表
          </Link>
          {post?.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post?.title ?? ''} className="w-full aspect-[16/9] object-cover rounded-lg mb-6 shadow-md" />
          )}
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{post?.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            {post.created_at ? new Date(post.created_at).toLocaleDateString('zh-TW') : ''}
            {post.category?.name && <> · {post.category.name}</>}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags?.map(tag => (
              <span key={tag.id} className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                {tag.name}
              </span>
            ))}
          </div>
          <div className="prose max-w-none">
            <PostEditor
              value={post.content}
              readOnly
              className='border-none bg-inherit !p-0'
            />
          </div>
        </div>
        
        {/* 目錄組件 */}
        {headings.length > 0 && (
          <ArticleToc headings={headings} activeId={activeId} />
        )}
      </div>
      
      {/* 置頂按鈕（始終顯示，但進度環配合設置） */}
      <ScrollToTop 
        triggerDistance={100} 
        showProgress={!showTopProgressBar} 
      />

      {/* 進度條設置切換 */}
      <ProgressBarToggle 
        onToggle={(showTopBar) => setShowTopProgressBar(showTopBar)}
        defaultShowTopBar={true}
      />
    </>
  );
} 