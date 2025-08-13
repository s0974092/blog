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
  return (
    contentStr.includes('"type":"heading"') ||
    contentStr.includes('"type":"h') ||
    contentStr.includes('heading')
  );
}

export function BlogDetail({ post }: BlogDetailProps) {
  const [activeId, setActiveId] = useState('');
  const [showTopProgressBar, setShowTopProgressBar] = useState(true);
  const [hasToc, setHasToc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const headings = useHeadings(post?.content);

  useActiveHeading(setActiveId, [post?.content, headings.length]);

  useEffect(() => {
    const hasHeadings = hasHeadingsInContent(post?.content);
    setHasToc(hasHeadings);
  }, [post?.content]);

  // 處理載入狀態的 Effect
  useEffect(() => {
    if (!post) {
      return; // 文章尚未載入
    }

    // 如果找到標題，立即顯示內容
    if (headings.length > 0) {
      setIsLoading(false);
      return;
    }

    // 如果沒有標題，則等待一段時間後顯示內容
    // 這能讓 useHeadings 有時間解析，並處理沒有標題的文章
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 等待 1.5 秒

    return () => clearTimeout(timer);
  }, [post, headings.length]);

  if (isLoading) {
    return <BlogDetailSkeleton hasToc={hasToc} />;
  }

  return (
    <>
      {showTopProgressBar && <ReadingProgressBar variant="top" />}

      <div className="relative mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className={cn('flex-1 min-w-0', hasToc ? 'lg:pr-[288px]' : '')}>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>

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
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              {post?.title}
            </h1>
            <div className="text-sm text-gray-500 mb-4">
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString('zh-TW')
                : ''}
              {post.category?.name && <> · {post.category.name}</>}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.map(tag => (
                <span
                  key={tag.id}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <article className="prose max-w-none">
              <PostEditor
                value={post.content}
                readOnly
                className="border-none bg-inherit !p-0"
              />
            </article>
          </div>
        </div>

        {headings.length > 0 && (
          <ArticleToc headings={headings} activeId={activeId} />
        )}
      </div>

      <ScrollToTop triggerDistance={100} showProgress={!showTopProgressBar} />

      <ProgressBarToggle
        onToggle={showTopBar => setShowTopProgressBar(showTopBar)}
        defaultShowTopBar={true}
      />
    </>
  );
} 