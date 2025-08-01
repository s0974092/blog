'use client'

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  className?: string;
  triggerDistance?: number;
  showProgress?: boolean; // 新增：是否顯示進度環
}

const SIZE = 48; // 按鈕大小
const STROKE = 4; // 邊框寬度
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollToTop({ className, triggerDistance = 100, showProgress = true }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
      setIsVisible(scrollTop > triggerDistance);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerDistance]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white group relative ${className || ''}`}
      aria-label="回到頂部"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        padding: 0,
        border: 'none',
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 60
      }}
    >
      {/* SVG 進度環（僅在 showProgress 為 true 時顯示） */}
      {showProgress && (
        <svg
          width={SIZE}
          height={SIZE}
          className="absolute top-0 left-0"
          style={{ pointerEvents: 'none' }}
        >
          {/* 背景圓環 */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#e5e7eb"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* 進度圓環 */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#3b82f6"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - scrollProgress / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            transform="rotate(-90 24 24)"
          />
        </svg>
      )}
      {/* 箭頭圖標 */}
      <ArrowUp className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors relative z-10" />
    </button>
  );
} 