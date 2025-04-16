import { cookies } from 'next/headers';
import { CookieMethodsServer, createServerClient } from '@supabase/ssr';

/**
 * 服務端獲取當前用戶信息
 * @returns 返回用戶信息或null
 */
export async function getServerUser() {
  try {
    const cookieStore = await cookies();
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
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('獲取用戶信息錯誤:', error.message);
      return null;
    }

    if (!data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.display_name || data.user.email,
      role: data.user.role || 'authenticated'
    };
  } catch (error) {
    console.error('獲取用戶信息異常:', error);
    return null;
  }
}
