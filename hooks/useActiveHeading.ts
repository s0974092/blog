import { useEffect, useRef, useState } from 'react';

export interface TocHeading {
  depth: number;
  text: string;
  id: string;
}

// Shared function to generate unique IDs for headings
function generateUniqueIds(elements: Element[]): TocHeading[] {
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();
  const textCounts = new Map<string, number>();
  
  elements.forEach((el, index) => {
    const depth = Number(el.tagName[1]);
    const text = el.textContent || '';
    
    let id = el.id;
    
    if (!id) {
      const baseId = text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const count = textCounts.get(text) || 0;
      textCounts.set(text, count + 1);
      
      if (count > 0) {
        id = `${baseId}-${count}`;
      } else {
        id = baseId || `heading-${index}`;
      }
      
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      id = uniqueId;
      
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

// Hook to observe headings and set the active one on scroll
export function useActiveHeading(setActiveId: (id: string) => void, deps: any[]) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Use a precise selector to only target headings within the article content
    const selector = '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6';
    const headingElements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

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
      // Ensure element has an ID before observing
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

// Hook to parse headings from the DOM for TOC
export function useHeadings(content: any) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);

  useEffect(() => {
    let observer: MutationObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const findAndSetHeadings = () => {
      // Use a precise selector to only target headings within the article content
      const selector = '.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6';
      const headingElements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      if (headingElements.length > 0) {
        const extractedHeadings = generateUniqueIds(headingElements);
        setHeadings(extractedHeadings);
        return true; // Headings found
      }
      return false; // No headings found
    };

    // Attempt to find headings immediately on mount
    if (findAndSetHeadings()) {
      return;
    }

    // If not found, set up a MutationObserver to watch for dynamic content rendering
    observer = new MutationObserver(() => {
      if (findAndSetHeadings()) {
        observer?.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Fallback timeout in case MutationObserver is slow or content renders unusually
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