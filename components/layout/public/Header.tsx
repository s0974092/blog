'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { SITE_CONFIG } from '@/lib/constants';

export default function Header({ onHeightChange, onVisibilityChange, enableHideOnScroll = true }: { onHeightChange?: (height: number) => void; onVisibilityChange?: (isVisible: boolean) => void; enableHideOnScroll?: boolean }) {
  const scrollDirection = useScrollDirection();
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // 測量 Header 高度並傳遞給父元件
  useLayoutEffect(() => {
    if (headerRef.current && onHeightChange) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          onHeightChange(entry.contentRect.height);
        }
      });
      resizeObserver.observe(headerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [onHeightChange]);

  // 效果：檢查滾動距離，並設定一個閾值
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.pageYOffset;
      // 設定一個滾動閾值，例如 150px，超過此距離才觸發效果
      if (offset > 150) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    // 監聽滾動事件
    window.addEventListener('scroll', handleScroll);

    // 組件卸載時移除監聽器，避免記憶體洩漏
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 效果：根據滾動方向和是否超過閾值來決定是否顯示 Header
  useEffect(() => {
    if (!enableHideOnScroll) {
      setIsVisible(true); // 如果不啟用隱藏，則始終可見
    } else if (scrollDirection === 'down' && hasScrolled) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    // 回傳可見性狀態
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }
  }, [scrollDirection, hasScrolled, isVisible, onVisibilityChange, enableHideOnScroll]);

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 backdrop-blur bg-white/80 shadow transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/blog" className="flex items-center gap-2 select-none cursor-pointer">
            <Image src="/yj-brand-logo.png" alt={SITE_CONFIG.name+'_Header'} width={48} height={48} priority />
            <h1 className="text-3xl font-bold font-[firacode] text-gray-900">{SITE_CONFIG.name}</h1>
          </Link>
          {/* 右側登入/後台按鈕先隱藏，未來管理者直接進 /login */}
          {/* <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" className="cursor-pointer">登入</Button>
            </Link>
          </div> */}
        </div>
      </div>
    </header>
  );
} 