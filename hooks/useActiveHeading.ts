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
    const selectors = [
      '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6',
      '[data-yoopta-editor] h1, [data-yoopta-editor] h2, [data-yoopta-editor] h3, [data-yoopta-editor] h4, [data-yoopta-editor] h5, [data-yoopta-editor] h6',
      'h1, h2, h3, h4, h5, h6'
    ];

    let headingElements: HTMLElement[] = [];

    for (const selector of selectors) {
      const elements = Array.from(
        document.querySelectorAll(selector)
      ) as HTMLElement[];
      if (elements.length > 0) {
        headingElements = elements;
        break;
      }
    }

    if (headingElements.length === 0) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
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
        rootMargin: '0px 0px -80% 0px',
        threshold: [0, 0.1, 0.5, 1]
      }
    );

    headingElements.forEach(el => {
      if (el.id) {
        observerRef.current!.observe(el);
      }
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// 解析標題的 hook
export function useHeadings(content: any) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const findAndSetHeadings = () => {
      
      // 先檢查 PostEditor 容器是否存在
      const proseContainer = document.querySelector('.prose');
      const yooptaContainer = document.querySelector('[data-yoopta-editor]');
      
      // 檢查所有可能的容器
      const allContainers = document.querySelectorAll('*[class*="editor"], *[class*="content"], *[class*="prose"], [data-yoopta-editor], [data-yoopta-element]');
      
      // 直接從 DOM 獲取標題元素，而不是從 HTML 解析
      const selectors = [
        '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6',
        '[data-yoopta-editor] h1, [data-yoopta-editor] h2, [data-yoopta-editor] h3, [data-yoopta-editor] h4, [data-yoopta-editor] h5, [data-yoopta-editor] h6',
        'article h1, article h2, article h3, article h4, article h5, article h6', // 只在 article 內搜索
        '.editor h1, .editor h2, .editor h3, .editor h4, .editor h5, .editor h6', // 嘗試 .editor 容器
        '.content h1, .content h2, .content h3, .content h4, .content h5, .content h6', // 嘗試 .content 容器
        '[data-yoopta-element] h1, [data-yoopta-element] h2, [data-yoopta-element] h3, [data-yoopta-element] h4, [data-yoopta-element] h5, [data-yoopta-element] h6', // 嘗試 Yoopta 元素
        '.yoopta-heading' // 嘗試 Yoopta 的標題類
      ];

      let headingElements: HTMLElement[] = [];
      
      for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        if (elements.length > 0) {
          headingElements = elements;
          break;
        }
      }

      // 如果沒有找到，嘗試在整個頁面搜索，但排除主標題
      if (headingElements.length === 0) {
        const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
        
        // 過濾掉主標題（通常在文章標題區域）
        headingElements = allHeadings.filter(heading => {
          // 檢查是否在文章內容區域內
          const isInArticle = heading.closest('article') || heading.closest('.prose') || heading.closest('[data-yoopta-editor]') || heading.closest('.editor') || heading.closest('.content') || heading.closest('[data-yoopta-element]');
          // 檢查是否為主標題（通常在頁面頂部）
          const isMainTitle = heading.closest('h1') && heading.textContent && heading.textContent.length < 100;
          
          // 檢查是否在 PostEditor 容器內
          const isInPostEditor = heading.closest('[data-yoopta-element]') || heading.closest('.yoopta-editor') || heading.closest('[data-yoopta-editor]');
          
          // 檢查是否為頁面主標題（排除文章標題）
          const isPageTitle = heading.textContent === '部落格' || heading.textContent === 'Blog';
          
          
          // 放寬條件：只要在 PostEditor 內且不是頁面主標題就包含
          return isInPostEditor && !isPageTitle;
        });
        
      }

      if (headingElements.length > 0) {
        const extractedHeadings = generateUniqueIds(headingElements);
        setHeadings(extractedHeadings);
        return true; // 找到標題
      }
      return false; // 沒找到標題
    };

    // 立即嘗試查找標題
    if (findAndSetHeadings()) {
      return;
    }

    // 如果沒找到，設置 MutationObserver 來監聽 DOM 變化
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // 檢查新增的節點是否包含標題
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // 檢查新增的元素本身是否是標題
              if (element.matches && element.matches('h1, h2, h3, h4, h5, h6')) {
                if (findAndSetHeadings()) {
                  observer?.disconnect();
                  return;
                }
              }
              // 檢查新增的元素內部是否有標題
              const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
              if (headings.length > 0) {
                if (findAndSetHeadings()) {
                  observer?.disconnect();
                  return;
                }
              }
            }
          }
        }
      }
    });

    // 開始觀察 DOM 變化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 設置一個備用的超時機制（2 秒），給 PostEditor 更多時間渲染
    timeoutId = setTimeout(() => {
      findAndSetHeadings();
      observer?.disconnect();
    }, 2000);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [content]);

  return headings;
} 