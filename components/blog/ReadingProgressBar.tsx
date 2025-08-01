'use client'

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  className?: string;
  variant?: 'top' | 'bottom';
}

export default function ReadingProgressBar({ className, variant = 'top' }: ReadingProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const positionClass = variant === 'top' ? 'top-0' : 'bottom-0';

  return (
    <div className={cn(
      "fixed left-0 w-full h-1 bg-gray-200/50 backdrop-blur-sm z-50",
      positionClass,
      className
    )}>
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out shadow-sm"
        style={{ 
          width: `${scrollProgress}%`,
          boxShadow: scrollProgress > 0 ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none'
        }}
      />
    </div>
  );
} 