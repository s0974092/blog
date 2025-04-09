import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/core/services/tag.service';

const tagService = new TagService();

// GET /api/tags/counts - 獲取所有標籤的文章數量
export async function GET(_request: NextRequest) {
  try {
    const counts = await tagService.getPostCounts();
    
    return NextResponse.json({
      success: true,
      counts
    });
  } catch (error) {
    console.error('獲取標籤文章數量錯誤:', error);
    return NextResponse.json(
      { success: false, error: '獲取標籤文章數量失敗' },
      { status: 500 }
    );
  }
} 