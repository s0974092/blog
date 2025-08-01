import { useEffect, useRef, useState } from 'react';

export interface TocHeading {
  depth: number;
  text: string;
  id: string;
}

// 共享的 ID 生成函數
function generateUniqueIds(elements: Element[]): TocHeading[] {
  const headings: TocHeading[] = [];
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

// 進階 Intersection Observer hook
export function useActiveHeading(setActiveId: (id: string) => void, deps: any[]) {
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

// 解析標題的 hook
export function useHeadings(content: any) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);

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
  }, [content]);

  return headings;
} 