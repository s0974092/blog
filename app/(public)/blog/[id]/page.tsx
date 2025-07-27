'use client'

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types/post-card';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { PostEditor, PostEditorRef } from '@/components/post/PostEditor';

// 共享的 ID 生成函數
function generateUniqueIds(elements: Element[]): { depth: number; text: string; id: string }[] {
  const headings: { depth: number; text: string; id: string }[] = [];
  const usedIds = new Set<string>();
  const textCounts = new Map<string, number>();
  
  elements.forEach((el, index) => {
    const depth = Number(el.tagName[1]);
    const text = el.textContent || '';
    
    // 優先使用元素現有的 ID
    let id = el.id;
    
    // 如果沒有 ID，才生成新的
    if (!id) {
      // 基於文本生成基礎 ID
      const baseId = text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      // 如果文本相同，添加計數器
      const count = textCounts.get(text) || 0;
      textCounts.set(text, count + 1);
      
      if (count > 0) {
        id = `${baseId}-${count}`;
      } else {
        id = baseId || `heading-${index}`;
      }
      
      // 確保 ID 唯一性
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      id = uniqueId;
      
      // 設置元素的 ID
      if (el instanceof HTMLElement) {
        el.id = id;
      }
    }
    
    usedIds.add(id);
    
    headings.push({
      depth,
      text,
      id: id,
    });
  });
  
  return headings;
}

function Toc({ headings, activeId }: { headings: { depth: number; text: string; id: string }[]; activeId: string }) {
  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 嘗試多種方式找到目標元素
    let targetElement = document.getElementById(id);
    
    if (!targetElement) {
      // 如果直接找不到，嘗試在 PostEditor 容器內查找
      const editorContainer = document.querySelector('[data-yoopta-editor]') || document.querySelector('.prose');
      if (editorContainer) {
        targetElement = editorContainer.querySelector(`#${id}`) as HTMLElement;
      }
    }
    
    if (!targetElement) {
      // 如果還是找不到，嘗試通過文本內容和位置查找
      const targetHeading = headings.find(h => h.id === id);
      
      if (targetHeading) {
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        // 找到所有匹配文本的標題
        const matchingHeadings = Array.from(allHeadings).filter(
          heading => heading.textContent?.trim() === targetHeading.text
        );
        
        if (matchingHeadings.length > 0) {
          // 找到目標標題在 headings 數組中的索引
          const targetIndex = headings.findIndex(h => h.id === id);
          
          // 找到相同文本的標題在 DOM 中的索引
          const sameTextHeadings = headings.filter(h => h.text === targetHeading.text);
          const targetInSameTextIndex = sameTextHeadings.findIndex(h => h.id === id);
          
          // 使用索引來找到正確的 DOM 元素
          if (targetInSameTextIndex >= 0 && targetInSameTextIndex < matchingHeadings.length) {
            targetElement = matchingHeadings[targetInSameTextIndex] as HTMLElement;
          } else {
            // 如果索引不匹配，使用第一個匹配的元素
            targetElement = matchingHeadings[0] as HTMLElement;
          }
        }
      }
    }
    
    if (targetElement) {
      // 計算滾動位置，考慮固定導航欄的高度
      const headerHeight = 80; // 估計的導航欄高度
      const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const scrollTop = elementTop - headerHeight - 20; // 額外留出 20px 空間
      
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      // 可選：添加視覺反饋
      targetElement.style.backgroundColor = '#f0f966';
      setTimeout(() => {
        targetElement.style.backgroundColor = '';
      }, 2000);
    }
  };
  
  return (
    <nav className="hidden lg:block fixed right-8 top-32 w-64 max-h-[70vh] overflow-auto bg-white/80 rounded shadow px-4 py-3 border border-gray-200 z-20">
      <div className="font-bold mb-2 text-gray-700">目錄</div>
      <ul className="space-y-1">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          
          return (
            <li key={h.id} className={`pl-${(h.depth - 1) * 4} ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}> 
              <a
                href={`#${h.id}`}
                className="hover:underline cursor-pointer"
                onClick={handleClick(h.id)}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// 進階 Intersection Observer hook
function useActiveHeading(setActiveId: (id: string) => void, deps: any[]) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 延遲執行，確保 PostEditor 完全渲染
    const timer = setTimeout(() => {
      // 嘗試多個選擇器來找到標題元素
      const selectors = [
        '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6',
        '[data-yoopta-editor] h1, [data-yoopta-editor] h2, [data-yoopta-editor] h3, [data-yoopta-editor] h4, [data-yoopta-editor] h5, [data-yoopta-editor] h6',
        'h1, h2, h3, h4, h5, h6'
      ];

      let headingElements: HTMLElement[] = [];
      
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        if (elements.length > 0) {
          headingElements = elements;
          break;
        }
      }

      if (headingElements.length === 0) {
        return;
      }

      // 使用共享的 ID 生成函數
      const headings = generateUniqueIds(headingElements);

      // 清理舊的 observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 只取進入視窗的 heading，並取最接近頂部的
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => {
              return (
                (a.target as HTMLElement).getBoundingClientRect().top -
                (b.target as HTMLElement).getBoundingClientRect().top
              );
            });
          
          if (visible.length > 0) {
            const activeHeadingId = visible[0].target.id;
            setActiveId(activeHeadingId);
          }
        },
        {
          root: null,
          rootMargin: '0px 0px -80% 0px', // 調整觸發時機
          threshold: [0, 0.1, 0.5, 1], // 多個閾值
        }
      );

      headingElements.forEach((el) => {
        observerRef.current!.observe(el);
      });
    }, 1500); // 延遲 1.5 秒確保 PostEditor 完全渲染

    return () => {
      clearTimeout(timer);
      if (observerRef.current) observerRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.id; // id 實際上是 slug
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ depth: number; text: string; id: string }[]>([]);
  const selectionRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const postEditorRef = useRef<PostEditorRef>(null);
  
  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts/${slug}`);
      const result = await res.json();
      setPost(result.data);
    }
    if (slug) fetchPost();
  }, [slug]);
  
  useEffect(() => {
    // 延遲解析 headings，確保 PostEditor 完全初始化
    const timer = setTimeout(() => {
      // 直接從 DOM 獲取標題元素，而不是從 HTML 解析
      const selectors = [
        '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6',
        '[data-yoopta-editor] h1, [data-yoopta-editor] h2, [data-yoopta-editor] h3, [data-yoopta-editor] h4, [data-yoopta-editor] h5, [data-yoopta-editor] h6',
      ];

      let headingElements: HTMLElement[] = [];
      
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        if (elements.length > 0) {
          headingElements = elements;
          break;
        }
      }

      if (headingElements.length > 0) {
        const extractedHeadings = generateUniqueIds(headingElements);
        setHeadings(extractedHeadings);
      }
    }, 2000); // 延遲 2 秒確保 PostEditor 完全渲染

    return () => clearTimeout(timer);
  }, [post?.content]);

  // 進階 Intersection Observer 高亮 TOC
  useActiveHeading(setActiveId, [post?.content, headings.length]);
  
  if (!post) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

  return (
    <div className="relative max-w-5xl mx-auto py-8 px-4">
      {/* 主內容區塊，右側預留 TOC 空間 */}
      <div className={cn("flex-1 min-w-0", headings.length > 0 ? "lg:pr-[288px]" : "")}>
        <Link href="/blog" className="text-blue-600 mb-4 inline-block">&larr; 返回列表</Link>
        {post?.coverImageUrl && (
          <img src={post.coverImageUrl} alt={post?.title ?? ''} className="w-full aspect-[16/9] object-cover rounded mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-2">{post?.title}</h1>
        <div className="text-sm text-gray-500 mb-4">
          {post.created_at ? new Date(post.created_at).toLocaleDateString('zh-TW') : ''}
          {post.category?.name && <> · {post.category.name}</>}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(tag => (
            <span key={tag.id} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="prose max-w-none" ref={contentRef}>
          <PostEditor
            value={post.content}
            ref={postEditorRef}
            readOnly
            selectionBoxRoot={selectionRef}
            className='border-none bg-inherit !p-0'
          />
        </div>
      </div>
      {/* 右側浮動 TOC 區塊（僅有目錄時顯示） */}
      {headings.length > 0 && (
        <Toc headings={headings} activeId={activeId} />
      )}
    </div>
  );
} 