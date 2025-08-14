'use client'

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { TocHeading } from '@/hooks/useActiveHeading';

interface ArticleTocProps {
  headings: TocHeading[];
  activeId: string;
  highlightColor?: string;
}

const getIndentStyle = (depth: number, minDepth: number) => {
  const relativeDepth = depth - minDepth;
  const indentMap: { [key: number]: string } = {
    0: 'pl-0',
    1: 'pl-4',
    2: 'pl-8',
    3: 'pl-12',
    4: 'pl-16',
    5: 'pl-20'
  };
  return indentMap[Math.max(0, relativeDepth)] || 'pl-0';
};

function createFadeHighlight(element: HTMLElement, backgroundColor?: string) {
  const originalBackground = element.style.backgroundColor;
  const originalTransition = element.style.transition;
  const originalPadding = element.style.padding;

  element.style.transition = 'background-color 0.6s ease-in-out, padding 0.6s ease-in-out';
  const highlightColor = backgroundColor || '#fff7ed';
  element.style.backgroundColor = highlightColor;
  element.style.padding = '4px';

  setTimeout(() => {
    element.style.transition = 'background-color 0.8s ease-in-out, padding 0.8s ease-in-out';
    element.style.backgroundColor = 'transparent';
    element.style.padding = originalPadding;

    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 800);
  }, 1000);

  return () => {
    element.style.backgroundColor = originalBackground;
    element.style.transition = originalTransition;
    element.style.padding = originalPadding;
  };
};

const handleTocClick = (
  id: string,
  headings: TocHeading[],
  onClose?: () => void,
  backgroundColor?: string
) => (e: React.MouseEvent) => {
  e.preventDefault();
  let targetElement = document.getElementById(id);

  if (!targetElement) {
    const editorContainer =
      document.querySelector('[data-yoopta-editor]') ||
      document.querySelector('.prose');
    if (editorContainer) {
      targetElement = editorContainer.querySelector(`#${id}`) as HTMLElement;
    }
  }

  if (!targetElement) {
    const targetHeading = headings.find(h => h.id === id);
    if (targetHeading) {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const matchingHeadings = Array.from(allHeadings).filter(
        heading => heading.textContent?.trim() === targetHeading.text
      );
      if (matchingHeadings.length > 0) {
        const sameTextHeadings = headings.filter(h => h.text === targetHeading.text);
        const targetInSameTextIndex = sameTextHeadings.findIndex(h => h.id === id);
        if (
          targetInSameTextIndex >= 0 &&
          targetInSameTextIndex < matchingHeadings.length
        ) {
          targetElement = matchingHeadings[targetInSameTextIndex] as HTMLElement;
        } else {
          targetElement = matchingHeadings[0] as HTMLElement;
        }
      }
    }
  }

  if (targetElement) {
    const headerHeight = 80;
    const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const scrollTop = elementTop - headerHeight - 20;

    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });

    setTimeout(() => {
      createFadeHighlight(targetElement, backgroundColor);
    }, 500);

    if (onClose) {
      onClose();
    }
  }
};

function DesktopToc({ headings, activeId, highlightColor }: ArticleTocProps) {
  const minDepth = headings.length > 0 ? Math.min(...headings.map(h => h.depth)) : 1;
  return (
    <nav className="hidden lg:block fixed right-8 top-32 w-64 max-h-[70vh] overflow-auto bg-white/80 rounded shadow px-4 py-3 border border-gray-200 z-20">
      <div className="font-bold mb-2 text-gray-700">目錄</div>
      <ul className="space-y-1">
        {headings.map(h => {
          const isActive = activeId === h.id;
          const indentClass = getIndentStyle(h.depth, minDepth);
          return (
            <li
              key={h.id}
              className={`${indentClass} ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
            >
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

function MobileToc(
  { headings, activeId, isOpen, onClose, highlightColor }: ArticleTocProps & { isOpen: boolean; onClose: () => void }
) {
  const minDepth = headings.length > 0 ? Math.min(...headings.map(h => h.depth)) : 1;
  return (
    <div
      className={cn(
        "fixed top-32 w-64 max-h-[70vh] overflow-auto bg-white/80 backdrop-blur-md rounded shadow px-4 py-3 border border-gray-200 z-50 transform transition-all duration-300 ease-in-out lg:hidden",
        isOpen
          ? "translate-x-0 opacity-100 right-8"
          : "translate-x-full opacity-0 right-0 pointer-events-none"
      )}
    >
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
        {headings.map(h => {
          const isActive = activeId === h.id;
          const indentClass = getIndentStyle(h.depth, minDepth);
          return (
            <li
              key={h.id}
              className={`${indentClass} ${isActive ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
            >
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
        isVisible ? "opacity-100 translate-y-0" : "hidden"
      )}
      aria-label="開啟目錄"
    >
      <Menu size={24} />
    </button>
  );
}

export default function ArticleToc({ headings, activeId, highlightColor }: ArticleTocProps) {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileTocOpen(false);
      }
    };

    if (isMobileTocOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileTocOpen]);

  return (
    <>
      <DesktopToc headings={headings} activeId={activeId} highlightColor={highlightColor} />
      <FloatingTocButton
        onClick={() => setIsMobileTocOpen(true)}
        headingsCount={headings.length}
        isVisible={!isMobileTocOpen}
      />
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