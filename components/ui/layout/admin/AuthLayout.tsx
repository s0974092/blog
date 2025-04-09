'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import UserProfile from './UserProfile';
import AdminLayout from './AdminLayout';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 獲取用戶資料
    const fetchUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // 已通過中間件驗證，直接設置用戶資料
        if (session) {
          setUser(session.user);
        }
      } catch (error: any) {
        console.error('獲取用戶信息失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 只在加載狀態顯示載入動畫
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  // 用戶資料應該存在，因為中間件已經過濾掉未登入的請求
  return (
    <AdminLayout
      userProfile={<UserProfile user={user} />}
    >
      {children}
    </AdminLayout>
  );
} 