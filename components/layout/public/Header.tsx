'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function Header() {
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
    <header 
      className={`sticky top-0 z-50 backdrop-blur bg-white/80 shadow transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/blog" className="flex items-center gap-2 select-none cursor-pointer">
            <Image src="/yj-brand-logo.png" alt="YJ's Tech & Life Notes" width={48} height={48} />
            <h1 className="text-3xl font-bold font-[firacode] text-gray-900">YJ's Tech & Life Notes</h1>
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