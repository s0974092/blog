import { Tag as PrismaTag } from '@prisma/client';

// 基礎Tag模型定義
export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  isTest: boolean;
}

// 創建標籤的DTO
export interface CreateTagDTO {
  name: string;
  createdBy?: string | null;
  isTest?: boolean;
}

// 更新標籤的DTO
export interface UpdateTagDTO {
  name?: string;
  updatedBy?: string;
}

// 標籤的查詢過濾條件
export interface TagFilter {
  id?: number;
  name?: string;
  isTest?: boolean;
}

// 文章摘要
export interface PostSummary {
  id: string;
  title: string | null;
  slug: string;
  createdAt: Date;
}

// 標籤API返回結果
export interface TagResponse {
  success: boolean;
  error?: string;
  data?: Tag;
  postCount?: number;
  posts?: PostSummary[];
}

export interface TagCount {
  tag_id: number;
  name: string;
  post_count: number;
}

export interface TagsResponse {
  success: boolean;
  error?: string;
  data?: Tag[];
  postCounts?: Record<number, number>;
}

// 處理多個標籤的轉換
export const toTagsResponse = (tags: PrismaTag[], postCounts?: Record<number, number>): TagsResponse => {
  return {
    success: true,
    data: tags as unknown as Tag[],
    ...(postCounts && { postCounts })
  };
}

// 轉換函數：從Prisma模型到響應模型
export const toTagResponse = (tag: PrismaTag, postCount?: number): TagResponse => {
  return {
    success: true,
    data: tag as unknown as Tag,
    postCount: postCount || 0
  };
} 