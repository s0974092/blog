import { supabase } from './supabase';

interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 檢查用戶會話狀態
 * @returns 返回會話信息或null
 */
export async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('檢查會話狀態失敗:', error);
    return null;
  }
}

/**
 * 用戶登入
 * @param credentials 登入憑證
 * @returns 登入結果
 */
export async function signIn(credentials: LoginCredentials) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('登入失敗:', error);
    return { 
      success: false, 
      error: error.message || '請檢查您的郵箱和密碼'
    };
  }
}

/**
 * 客戶端獲取當前用戶信息
 * @returns 返回用戶信息或null
 */
export async function getClientUser() {
  try {
    // 先檢查 session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('檢查會話狀態失敗:', sessionError.message);
      return null;
    }

    // 如果沒有 session，直接返回 null
    if (!session) {
      return null;
    }

    // 有 session 才獲取用戶信息
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('獲取用戶信息錯誤:', error.message);
      return null;
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        display_name: user.user_metadata?.display_name || user.email
      },
      role: user.role || 'authenticated'
    };
  } catch (error) {
    console.error('獲取用戶信息異常:', error);
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