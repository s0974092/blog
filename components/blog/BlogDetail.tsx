'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post-card';
import { cn } from '@/lib/utils';
import { PostEditor } from '@/components/post/PostEditor';
import ArticleToc from '@/components/blog/ArticleToc';
import ScrollToTop from '@/components/blog/ScrollToTop';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ProgressBarToggle from '@/components/blog/ProgressBarToggle';
import { useActiveHeading, useHeadings } from '@/hooks/useActiveHeading';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { ArrowLeft } from 'lucide-react';

interface BlogDetailProps {
  post: Post;
}

// 簡單檢查文章內容中是否有標題的函數
function hasHeadingsInContent(content: unknown): boolean {
  if (!content) return false;
  
  // 將內容轉換為字符串進行檢查
  const contentStr = JSON.stringify(content);
  
  // 檢查是否包含標題相關的內容
  // Yoopta 編輯器的標題通常會有 "type": "heading" 或類似的結構
  return contentStr.includes('"type":"heading"') || 
         contentStr.includes('"type":"h') ||
         contentStr.includes('heading');
}

export function BlogDetail({ post }: BlogDetailProps) {
  const [activeId, setActiveId] = useState('');
  const [showTopProgressBar, setShowTopProgressBar] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [hasToc, setHasToc] = useState(false);
  
  // 使用自定義 hook 來解析標題
  const headings = useHeadings(post?.content);
  
  // 使用自定義 hook 來處理高亮
  useActiveHeading(setActiveId, [post?.content, headings.length]);

  // 預先檢查是否有目錄 - 在 Skeleton 階段就確定
  useEffect(() => {
    const hasHeadings = hasHeadingsInContent(post?.content);
    console.log('Pre-check hasHeadings:', hasHeadings);
    setHasToc(hasHeadings);
  }, [post?.content]);

  // 檢測是否有目錄 - 當 useHeadings 解析完成後更新
  useEffect(() => {
    console.log('Headings length:', headings.length);
    console.log('Headings:', headings);
    if (headings.length > 0) {
      setHasToc(true);
      console.log('Setting hasToc to true');
    }
  }, [headings.length, headings]);

  // 等待目錄解析完成後再顯示內容
  useEffect(() => {
    if (post?.content) {
      // 給足夠時間讓 PostEditor 渲染並解析標題
      const timer = setTimeout(() => {
        setIsContentVisible(true);
      }, 3000); // 給 PostEditor 更多時間渲染
      
      return () => clearTimeout(timer);
    }
  }, [post?.content]);

  // 如果內容還沒準備好，顯示 Skeleton
  if (!isContentVisible) {
    console.log('Showing skeleton, hasToc:', hasToc);
    return (
      <>
        <BlogDetailSkeleton hasToc={hasToc} />
        {/* 隱藏的 PostEditor，讓 useHeadings 可以工作 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <PostEditor
            value={post.content}
            readOnly
            className='border-none bg-inherit !p-0'
          />
        </div>
      </>
    );
  }

  console.log('Rendering content, hasToc:', hasToc, 'headings.length:', headings.length);

  return (
    <>
      {/* 頂部閱讀進度條（可選） */}
      {showTopProgressBar && <ReadingProgressBar variant="top" />}
      
      <div className="relative mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 主內容區塊，右側預留 TOC 空間 */}
        <div className={cn("flex-1 min-w-0", hasToc ? "lg:pr-[288px]" : "")}>
          <Link href="/blog" className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700 transition-colors">
            <ArrowLeft size={16} />返回首頁
          </Link>
          
          {/* 文章內容 */}
          <div>
            {post?.coverImageUrl && (
              <Image 
                src={post.coverImageUrl} 
                alt={post?.title ?? ''} 
                width={640}
                height={360}
                className="w-full aspect-[16/9] object-cover rounded-lg mb-6 shadow-md"
                priority
              />
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
            <article className="prose max-w-none">
              <PostEditor
                value={post.content}
                readOnly
                className='border-none bg-inherit !p-0'
              />
            </article>
          </div>
        </div>
        
        {/* 目錄組件 - 立即顯示，不需要等待 */}
        {headings.length > 0 && (
          <>
            {(() => {
              console.log('Rendering ArticleToc with headings:', headings);
              return null;
            })()}
            <ArticleToc headings={headings} activeId={activeId} />
          </>
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