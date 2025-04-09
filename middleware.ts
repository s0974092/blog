import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { CookieOptions } from '@supabase/ssr';

// 管理頁面路徑列表（這些是實際 URL，不包含 Route Group 名稱）
const ADMIN_PATHS = [
  '/dashboard',
  '/posts',
  '/categories',
  '/tags',
//   '/users',
//   '/settings'
];

export async function middleware(request: NextRequest) {
  // 創建中間件客戶端
  const res = NextResponse.next();
  
  // 獲取請求中的 cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 檢查會話是否存在
  const { data: { session } } = await supabase.auth.getSession();

  // 獲取請求URL的路徑名
  const pathname = request.nextUrl.pathname;
  
  // 檢查是否訪問的是管理後台相關頁面
  const isAdminPage = ADMIN_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // 如果是管理頁面但沒有登入，重定向到登入頁
  if (isAdminPage && !session) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 如果已登入且訪問登入頁，重定向到管理後台
  if (pathname === '/login' && session) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// 配置匹配的路徑 - 將所有管理路徑和登入頁列入匹配範圍
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/:path*',
    '/categories/:path*',
    '/tags/:path*',
    // '/users/:path*',
    // '/settings/:path*',
    // '/login'
  ],
}; 