import { supabase, supabaseAdmin } from './supabase';
import { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { CookieMethodsServer, createServerClient } from '@supabase/ssr';

/**
 * 獲取當前登入的用戶會話，可用於服務端組件
 * @returns 返回用戶會話或null
 */
export async function auth() {
  try {
    // Get cookie store with await
    const cookieStore = await cookies();
    
    // 創建服務器端 Supabase 客戶端
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: async (name: string) => {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          getAll: async () => {
            const cookieStore = await cookies();
            return Array.from(cookieStore.getAll());
          },
          set: () => {}, // 只讀不寫
          remove: () => {} // 只讀不寫
        } as CookieMethodsServer
      }
    );
    
    // 獲取會話
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('獲取會話錯誤:', error.message);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.display_name || session.user.email,
        role: session.user.role || 'authenticated'
      }
    };
  } catch (error) {
    console.error('驗證異常:', error);
    return null;
  }
}

/**
 * 登出用戶
 * @returns 成功或失敗的響應
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('登出錯誤:', error.message);
    return { success: false, error: error.message };
  }
}