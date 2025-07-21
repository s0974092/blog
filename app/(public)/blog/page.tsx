'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Post } from '@/types/database';
import { useRouter } from 'next/navigation';
import { getClientUser } from '@/lib/auth';
import BlogCard from '@/components/blog/BlogCard';

interface User {
  id: string;
  email: string;
  user_metadata: {
    display_name: string;
  };
  role: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        // 檢查登入狀態
        const userData = await getClientUser();
        if (userData && userData.email) {
          setUser(userData as User);
        }

        // 改為 fetch Next.js API
        const res = await fetch('/api/posts?page=1&pageSize=10');
        const result = await res.json();
        if (!result.success) throw new Error(result.error || '獲取文章列表失敗');
        setPosts(result.data.items || []);
      } catch (error: any) {
        console.error('初始化失敗:', error);
        toast.error('初始化失敗', {
          description: error?.message || '未知錯誤'
        });
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">部落格</h1>
            <div className="flex gap-4">
              {user ? (
                <>
                  <span className="text-gray-600 self-center">
                    {displayName}
                  </span>
                  <Link href="/dashboard">
                    <Button variant="outline" className="cursor-pointer">後台管理</Button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="cursor-pointer">登入</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
} 