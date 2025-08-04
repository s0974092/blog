import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BlogDetailSkeletonProps {
  hasToc?: boolean;
}

export function BlogDetailSkeleton({ hasToc = false }: BlogDetailSkeletonProps) {
  return (
    <div className="relative mx-auto py-8 px-4 max-lg:px-10">
      {/* 主內容區塊，右側預留 TOC 空間 */}
      <div className={cn("flex-1 min-w-0", hasToc ? "lg:pr-[288px]" : "")}>
        <Link href="/blog" className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700 transition-colors">
          <ArrowLeft size={16} />返回首頁
        </Link>
        
        {/* 封面圖片骨架 */}
        <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg mb-6 animate-pulse" />
        
        {/* 標題骨架 */}
        <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
        
        {/* 日期和分類骨架 */}
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
        
        {/* 標籤骨架 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse" />
        </div>
        
        {/* 文章內容骨架 */}
        <div className="space-y-4">
          {/* 段落骨架 */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
          
          {/* 標題骨架 */}
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          
          {/* 段落骨架 */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
          
          {/* 標題骨架 */}
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
          
          {/* 段落骨架 */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
          </div>
          
          {/* 更多段落 */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* 目錄骨架 - 只在桌面版且有大螢幕時顯示 */}
      {hasToc && (
        <div className="hidden lg:block fixed right-8 top-32 w-64 max-h-[70vh] overflow-auto bg-white/80 rounded shadow px-4 py-3 border border-gray-200 z-20">
          <div className="h-5 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 ml-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 ml-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 ml-4 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
} 