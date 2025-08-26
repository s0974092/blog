
'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Post } from '@/types/post-card';
import { cn } from '@/lib/utils';
import ArticleToc from '@/components/blog/ArticleToc';
import ScrollToTop from '@/components/blog/ScrollToTop';
import ReadingProgressBar from '@/components/blog/ReadingProgressBar';
import ProgressBarToggle from '@/components/blog/ProgressBarToggle';
import { useActiveHeading, useHeadings } from '@/hooks/useActiveHeading';
import { ArrowLeft } from 'lucide-react';

// A simple skeleton for the editor content area while it's loading.
const EditorContentSkeleton = () => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
    </div>
    <div className="space-y-2 pt-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
    </div>
  </div>
);

// Dynamically import the PostEditor to reduce the initial bundle size.
// It will only be loaded on the client-side, and not included in the server-render.
const DynamicPostEditor = dynamic(
  () => import('@/components/post/PostEditor').then(mod => mod.PostEditor),
  {
    ssr: false,
    loading: () => <EditorContentSkeleton />,
  },
);

interface BlogDetailClientProps {
  post: Post;
}

export function BlogDetailClient({ post }: BlogDetailClientProps) {
  const [activeId, setActiveId] = useState('');
  const [showTopProgressBar, setShowTopProgressBar] = useState(true);
  const headings = useHeadings(post?.content);

  useActiveHeading(setActiveId, [post?.content, headings.length]);

  const hasToc = headings.length > 0;

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
              {post.createdAt
                ? new Date(post.createdAt).toLocaleDateString('zh-TW')
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
              <DynamicPostEditor
                value={post.content}
                readOnly
                className="border-none bg-inherit !p-0"
              />
            </article>
          </div>
        </div>

        {hasToc && (
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
