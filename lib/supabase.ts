import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 客户端浏览器环境使用此客户端（自动处理cookies）
export const supabase = typeof window !== 'undefined' 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, supabaseAnonKey)

// 創建服務端客戶端（用於後端，具有完整權限）
export const supabaseAdmin = createClient(
  supabaseUrl as string,
  supabaseServiceKey as string
)

// 测试连接
export async function testConnection() {
  try {
    // 使用 auth.getSession() 来测试连接
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    return { 
      success: true, 
      message: 'Supabase连接成功',
      session: session ? '已登录' : '未登录'
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Supabase连接失败', 
      error 
    }
  }
} 