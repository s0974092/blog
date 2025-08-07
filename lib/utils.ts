import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 獲取當前年份
 * @returns 當前年份數字
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * 獲取當前月份的中文名稱
 * @returns 當前月份的中文名稱（如：一月、二月等）
 */
export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('zh-TW', { month: 'long' });
}

/**
 * 獲取格式化的當前日期字串
 * @returns 格式化的日期字串（如：2025年一月）
 */
export function getFormattedCurrentDate(): string {
  const year = getCurrentYear();
  const month = getCurrentMonth();
  return `${year}年${month}`;
}

/**
 * 生成檔案名稱，格式為 date-uuid.extension
 * @param originalName 原始檔案名稱
 * @returns 格式化後的檔案名稱
 */
export function generateFileName(originalName?: string): string {
  const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
  const uuid = uuidv4();
  const extension = originalName?.split('.').pop() || 'jpg';
  return `${date}_${uuid}.${extension}`;
}
