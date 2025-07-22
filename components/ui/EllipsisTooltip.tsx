import { useRef, useEffect, useState, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export function EllipsisTooltip({ children, className = '' }: { children: ReactNode, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setShowTooltip(el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span ref={ref} className={`truncate ${className}`}>{children}</span>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <span ref={ref} className={`truncate ${className}`}>{children}</span>
  );
} 