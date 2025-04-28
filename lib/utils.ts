import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import pinyin from "pinyin"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 將中文文字轉換為拼音，並格式化為 URL 友善的格式
 * @param text 要轉換的中文文字
 * @returns 格式化後的拼音字串
 */
export function generatePinyin(text: string) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL, // 使用普通拼音樣式
  })
    .flat() // 將多維陣列展平
    .join('-') // 使用連字符連接
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-') // 移除非字母、數字和連字符的字元
    .replace(/(^-|-$)/g, ''); // 移除開頭和結尾的連字符
}
