import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/server-auth';

// 管理頁面路徑列表（這些是實際 URL，不包含 Route Group 名稱）
const ADMIN_PATHS = [
  '/dashboard',
  '/posts',
  '/categories',
  '/sub-categories',
  '/tags',
//   '/users',
//   '/settings'
];

export async function middleware(request: NextRequest) {
  // 創建中間件客戶端
  const res = NextResponse.next();

  // 獲取請求URL的路徑名
  const pathname = request.nextUrl.pathname;
  
  // 檢查是否訪問的是管理後台相關頁面
  const isAdminPage = ADMIN_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // 如果是管理頁面，檢查用戶登入狀態
  if (isAdminPage) {
    try {
      // 使用 getServerUser 方法
      const user = await getServerUser();
      
      // 如果沒有登入，重定向到登入頁
      if (!user) {
        console.log('用戶未登入，重定向到登入頁');
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('middleware 中檢查用戶狀態失敗:', error);
      // 如果檢查失敗，重定向到登入頁
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // 如果已登入且訪問登入頁，重定向到管理後台
  if (pathname === '/login') {
    try {
      const user = await getServerUser();
      if (user) {
        console.log('用戶已登入，重定向到儀表板');
        const redirectUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('middleware 中檢查登入頁用戶狀態失敗:', error);
    }
  }
  
  return res;
}

// 配置匹配的路徑 - 將所有管理路徑和登入頁列入匹配範圍
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/:path*',
    '/categories/:path*',
    '/sub-categories/:path*',
    '/tags/:path*',
    '/login', // 添加登入頁面到匹配範圍
    // '/users/:path*',
    // '/settings/:path*',
  ],
}; 