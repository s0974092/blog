'use client'

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function BlogLayout({ children }: { children: ReactNode }) {
  const scrollDirection = useScrollDirection();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (scrollDirection === 'down') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [scrollDirection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header 
        className={`sticky top-0 z-50 backdrop-blur bg-white/80 shadow transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/blog" className="block select-none cursor-pointer">
              <h1 className="text-3xl font-bold text-gray-900">部落格</h1>
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
      {children}
    </div>
  );
} 