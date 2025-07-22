import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 shadow">
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