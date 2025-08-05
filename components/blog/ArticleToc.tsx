'use client'

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { TocHeading } from '@/hooks/useActiveHeading';

interface ArticleTocProps {
  headings: TocHeading[];
  activeId: string;
  highlightColor?: string; // 新增高亮顏色參數
}

// 根據深度獲取縮排樣式
const getIndentStyle = (depth: number) => {
  const indentMap: { [key: number]: string } = {
    1: 'pl-0',
    2: 'pl-4',
    3: 'pl-8',
    4: 'pl-12',
    5: 'pl-16',
    6: 'pl-20'
  };
  return indentMap[depth] || 'pl-0';
};

// 淡入淡出高亮效果
function createFadeHighlight(element: HTMLElement, backgroundColor?: string) {
  // 保存原始樣式
  const originalBackground = element.style.backgroundColor;
  const originalTransition = element.style.transition;
  const originalPadding = element.style.padding;
  
  // 設置過渡效果
  element.style.transition = 'background-color 0.6s ease-in-out, padding 0.6s ease-in-out';
  
  // 淡入效果 - 使用傳入的顏色或預設顏色
  const highlightColor = backgroundColor || '#fff7ed'; // 預設淺橙色
  element.style.backgroundColor = highlightColor;
  element.style.padding = '4px';
  
  // 1秒後開始淡出
  setTimeout(() => {
    // 同時淡出背景色和 padding
    element.style.transition = 'background-color 0.8s ease-in-out, padding 0.8s ease-in-out';
    element.style.backgroundColor = 'transparent';
    element.style.padding = originalPadding;
    
    // 恢復原始過渡效果
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 800);
  }, 1000);
  
  // 清理函數
  return () => {
    element.style.backgroundColor = originalBackground;
    element.style.transition = originalTransition;
    element.style.padding = originalPadding;
  };
}

// 處理點擊事件的通用函數
const handleTocClick = (id: string, headings: TocHeading[], onClose?: () => void, backgroundColor?: string) => (e: React.MouseEvent) => {
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
    
    // 使用淡入淡出效果，可傳入自定義顏色
    setTimeout(() => {
      createFadeHighlight(targetElement, backgroundColor);
    }, 500);
    
    // 如果提供了 onClose 回調，則調用它（用於移動端）
    if (onClose) {
      onClose();
    }
  }
};

// 桌面版目錄組件
function DesktopToc({ headings, activeId, highlightColor }: ArticleTocProps) {
  return (
    <nav className="hidden lg:block fixed right-8 top-32 w-64 max-h-[70vh] overflow-auto bg-white/80 rounded shadow px-4 py-3 border border-gray-200 z-20">
      <div className="font-bold mb-2 text-gray-700">目錄</div>
      <ul className="space-y-1">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          const indentClass = getIndentStyle(h.depth);
          
          return (
            <li key={h.id} className={`${indentClass} ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}> 
              <a
                href={`#${h.id}`}
                className="hover:underline cursor-pointer"
                onClick={handleTocClick(h.id, headings, undefined, highlightColor)}
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

// 移動端目錄組件
function MobileToc({ headings, activeId, isOpen, onClose, highlightColor }: ArticleTocProps & { isOpen: boolean; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed top-32 right-8 w-64 max-h-[70vh] overflow-auto bg-white/80 backdrop-blur-md rounded shadow px-4 py-3 border border-gray-200 z-50 transform transition-all duration-300 ease-in-out lg:hidden",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-gray-700">目錄</div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <ul className="space-y-1">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          const indentClass = getIndentStyle(h.depth);
          
          return (
            <li key={h.id} className={`${indentClass} ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}> 
              <a
                href={`#${h.id}`}
                className="hover:underline cursor-pointer"
                onClick={handleTocClick(h.id, headings, onClose, highlightColor)}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 浮動按鈕組件
function FloatingTocButton({ 
  onClick, 
  headingsCount,
  isVisible
}: { 
  onClick: () => void;
  headingsCount: number;
  isVisible: boolean;
}) {
  if (headingsCount === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed top-1/2 right-0 transform translate-x-1/3 hover:translate-x-0 w-10 h-10 bg-white text-blue-500 rounded-l-full shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] transition-all duration-200 z-30 lg:hidden flex items-center justify-center",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      aria-label="開啟目錄"
    >
      <Menu size={24} />
    </button>
  );
}

// 主目錄組件
export default function ArticleToc({ headings, activeId, highlightColor }: ArticleTocProps) {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  return (
    <>
      {/* 桌面版目錄 */}
      <DesktopToc headings={headings} activeId={activeId} highlightColor={highlightColor} />
      
      {/* 移動端浮動按鈕 */}
      <FloatingTocButton 
        onClick={() => setIsMobileTocOpen(true)}
        headingsCount={headings.length}
        isVisible={!isMobileTocOpen}
      />
      
      {/* 移動端目錄面板 */}
      <MobileToc 
        headings={headings}
        activeId={activeId}
        isOpen={isMobileTocOpen}
        onClose={() => setIsMobileTocOpen(false)}
        highlightColor={highlightColor}
      />
    </>
  );
} 