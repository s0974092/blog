'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Post } from '@/types/database';
import { useRouter } from 'next/navigation';
import { getClientUser } from '@/lib/auth';

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
        if (userData && userData.email) {  // 確保 email 存在
          setUser(userData as User);  // 使用類型斷言
        }

        // 獲取文章列表
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('獲取文章列表失敗:', error);
          toast.error('獲取文章列表失敗', {
            description: error.message
          });
          return;
        }
        setPosts(data || []);
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

  // 獲取顯示名稱，如果沒有就使用郵箱
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
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link href={`/blog/${post.id}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <time className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('zh-TW')}
                </time>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
} 